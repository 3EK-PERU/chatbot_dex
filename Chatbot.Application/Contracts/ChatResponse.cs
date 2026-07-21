namespace Chatbot.Application.Contracts;

public sealed record ChatResponse(
    Guid SessionId,
    string Message,
    DateTimeOffset RespondedAtUtc);
