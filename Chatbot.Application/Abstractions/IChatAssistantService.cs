using Chatbot.Domain.Evaluation;
using Chatbot.Domain.Sessions;

namespace Chatbot.Application.Abstractions;

public interface IChatAssistantService
{
    string BuildAuditSummary(AuditEvaluation evaluation);

    string BuildReply(ChatSession session, string userMessage);
}
