using Chatbot.Domain.Evaluation;
using Chatbot.Domain.Vision;

namespace Chatbot.Application.Abstractions;

public interface IPlanogramEvaluator
{
    AuditEvaluation Evaluate(IReadOnlyCollection<DetectedObject> detectedObjects);
}
