namespace Chatbot.Domain.Evaluation;

public sealed record AuditEvaluation(
    bool IsApproved,
    IReadOnlyCollection<RuleEvaluation> Rules,
    DateTimeOffset EvaluatedAtUtc);
