namespace Chatbot.Domain.Sessions;

public sealed record ChatMessage(
    Guid MessageId,
    ChatRole Role,
    string Content,
    DateTimeOffset CreatedAtUtc);
