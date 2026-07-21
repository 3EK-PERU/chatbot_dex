using Chatbot.Domain.Evaluation;
using Chatbot.Domain.Vision;

namespace Chatbot.Domain.Sessions;

public sealed class ChatSession
{
    private readonly List<ChatMessage> _messages = new();

    public ChatSession(Guid sessionId)
    {
        SessionId = sessionId;
    }

    public Guid SessionId { get; }

    public ConversationState State { get; private set; } = ConversationState.AwaitingImage;

    public AuditEvaluation? LastEvaluation { get; private set; }

    public ImageAuditInfo? LastImage { get; private set; }

    public IReadOnlyList<ChatMessage> Messages => _messages;

    public void AddMessage(ChatMessage message)
    {
        _messages.Add(message);
    }

    public void SetLastImage(ImageAuditInfo image)
    {
        LastImage = image;
        State = ConversationState.AwaitingCorrection;
    }

    public void SetLastEvaluation(AuditEvaluation evaluation)
    {
        LastEvaluation = evaluation;
        State = ConversationState.EvaluationCompleted;
    }
}
