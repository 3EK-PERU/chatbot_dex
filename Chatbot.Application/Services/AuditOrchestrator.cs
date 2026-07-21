using Chatbot.Application.Abstractions;
using Chatbot.Application.Contracts;
using Chatbot.Domain.Sessions;

namespace Chatbot.Application.Services;

public sealed class AuditOrchestrator : IAuditOrchestrator
{
    private readonly ISessionStore _sessionStore;
    private readonly IVisionAnalysisClient _visionAnalysisClient;
    private readonly IPlanogramEvaluator _planogramEvaluator;
    private readonly IChatAssistantService _chatAssistant;
    private readonly IImageStorageService _imageStorageService;

    public AuditOrchestrator(
        ISessionStore sessionStore,
        IVisionAnalysisClient visionAnalysisClient,
        IPlanogramEvaluator planogramEvaluator,
        IChatAssistantService chatAssistant,
        IImageStorageService imageStorageService)
    {
        _sessionStore = sessionStore;
        _visionAnalysisClient = visionAnalysisClient;
        _planogramEvaluator = planogramEvaluator;
        _chatAssistant = chatAssistant;
        _imageStorageService = imageStorageService;
    }

    public SessionResponse CreateSession()
    {
        var sessionId = Guid.NewGuid();
        _sessionStore.GetOrCreate(sessionId);
        return new SessionResponse(sessionId);
    }

    public async Task<AuditResponse> AnalyzeImageAsync(AnalyzeImageCommand command, CancellationToken cancellationToken)
    {
        var session = _sessionStore.GetOrCreate(command.SessionId);

        var imageInfo = await _imageStorageService.SaveAsync(
            command.SessionId,
            command.FileName,
            command.ContentType,
            command.ImageStream,
            cancellationToken);

        session.SetLastImage(imageInfo);

        await using var streamForVision = command.ImageStream;
        streamForVision.Position = 0;

        var detections = await _visionAnalysisClient.AnalyzeAsync(
            streamForVision,
            command.FileName,
            command.ContentType,
            cancellationToken);

        var evaluation = _planogramEvaluator.Evaluate(detections);
        session.SetLastEvaluation(evaluation);

        var assistantSummary = _chatAssistant.BuildAuditSummary(evaluation);
        session.AddMessage(new ChatMessage(Guid.NewGuid(), ChatRole.System, assistantSummary, DateTimeOffset.UtcNow));

        return new AuditResponse(
            command.SessionId,
            evaluation.IsApproved,
            evaluation.Rules.Select(x => new RuleResultResponse(x.RuleCode, x.Message, x.Passed)).ToList(),
            assistantSummary,
            evaluation.EvaluatedAtUtc);
    }

    public ChatResponse SendChatMessage(SendChatMessageCommand command)
    {
        var session = _sessionStore.GetOrCreate(command.SessionId);

        var userMessage = new ChatMessage(Guid.NewGuid(), ChatRole.User, command.Message, DateTimeOffset.UtcNow);
        session.AddMessage(userMessage);

        var reply = _chatAssistant.BuildReply(session, command.Message);
        var assistantMessage = new ChatMessage(Guid.NewGuid(), ChatRole.Assistant, reply, DateTimeOffset.UtcNow);
        session.AddMessage(assistantMessage);

        return new ChatResponse(command.SessionId, reply, assistantMessage.CreatedAtUtc);
    }

    public SessionStateResponse GetSessionState(Guid sessionId)
    {
        if (!_sessionStore.TryGet(sessionId, out var session) || session is null)
        {
            throw new KeyNotFoundException($"La sesion '{sessionId}' no existe.");
        }

        var history = session.Messages
            .Select(m => new ChatHistoryItem(m.Role.ToString(), m.Content, m.CreatedAtUtc))
            .ToList();

        return new SessionStateResponse(
            sessionId,
            session.State,
            session.LastEvaluation is not null,
            session.LastImage is not null,
            history);
    }
}
