using Chatbot.Application.Contracts;

namespace Chatbot.Application.Abstractions;

public interface IAuditOrchestrator
{
    Task<AuditResponse> AnalyzeImageAsync(AnalyzeImageCommand command, CancellationToken cancellationToken);

    ChatResponse SendChatMessage(SendChatMessageCommand command);

    SessionResponse CreateSession();

    SessionStateResponse GetSessionState(Guid sessionId);
}
