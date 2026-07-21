namespace Chatbot.Application.Contracts;

public sealed record SendChatMessageCommand(
    Guid SessionId,
    string Message);
