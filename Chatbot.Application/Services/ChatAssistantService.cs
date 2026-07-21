using Chatbot.Application.Abstractions;
using Chatbot.Domain.Evaluation;
using Chatbot.Domain.Sessions;

namespace Chatbot.Application.Services;

public sealed class ChatAssistantService : IChatAssistantService
{
    public string BuildAuditSummary(AuditEvaluation evaluation)
    {
        if (evaluation.IsApproved)
        {
            return "Implementacion aprobada segun las reglas actuales del planograma.";
        }

        var failed = evaluation.Rules.Where(r => !r.Passed).Select(r => $"- {r.Message}");
        return "Implementacion rechazada. Ajustes sugeridos:\n" + string.Join("\n", failed);
    }

    public string BuildReply(ChatSession session, string userMessage)
    {
        if (session.LastEvaluation is null)
        {
            return "Aun no tengo una evaluacion. Envia una imagen para auditar la exhibicion.";
        }

        var lowered = userMessage.ToLowerInvariant();
        if (lowered.Contains("por que") || lowered.Contains("rechaz") || lowered.Contains("motivo"))
        {
            var failed = session.LastEvaluation.Rules.Where(r => !r.Passed).ToList();
            if (failed.Count == 0)
            {
                return "La implementacion fue aprobada. No hay reglas incumplidas.";
            }

            return "La implementacion fue rechazada por:\n" + string.Join("\n", failed.Select(x => $"- {x.Message}"));
        }

        if (lowered.Contains("correg") || lowered.Contains("como"))
        {
            var failed = session.LastEvaluation.Rules.Where(r => !r.Passed).ToList();
            if (failed.Count == 0)
            {
                return "No se requieren correcciones segun la ultima auditoria.";
            }

            return "Para corregir, enfocate en:\n" + string.Join("\n", failed.Select(x => $"- {x.Message}")) + "\nDespues envia una nueva fotografia.";
        }

        return "Puedo explicarte por que fue rechazada la implementacion o como corregirla. Tambien puedes enviar una nueva imagen.";
    }
}
