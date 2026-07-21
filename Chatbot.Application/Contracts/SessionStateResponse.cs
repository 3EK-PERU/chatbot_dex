using Chatbot.Domain.Sessions;

namespace Chatbot.Application.Contracts;

public sealed record SessionStateResponse(
    Guid SessionId,
    ConversationState State,
    bool HasLastEvaluation,
    bool HasLastImage,
    IReadOnlyCollection<ChatHistoryItem> History);

public sealed record ChatHistoryItem(
    string Role,
    string Content,
    DateTimeOffset CreatedAtUtc);
