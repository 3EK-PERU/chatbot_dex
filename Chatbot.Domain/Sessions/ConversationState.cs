namespace Chatbot.Domain.Sessions;

public enum ConversationState
{
    AwaitingImage = 1,
    EvaluationCompleted = 2,
    AwaitingCorrection = 3
}
