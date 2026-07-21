namespace Chatbot.Domain.Evaluation;

public sealed record RuleEvaluation(
    string RuleCode,
    string Message,
    bool Passed);
