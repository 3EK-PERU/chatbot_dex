namespace Chatbot.Application.Contracts;

public sealed record RuleResultResponse(
    string RuleCode,
    string Message,
    bool Passed);
