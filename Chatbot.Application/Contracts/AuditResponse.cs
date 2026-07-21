namespace Chatbot.Application.Contracts;

public sealed record AuditResponse(
    Guid SessionId,
    bool IsApproved,
    IReadOnlyCollection<RuleResultResponse> Rules,
    string AssistantMessage,
    DateTimeOffset EvaluatedAtUtc);
