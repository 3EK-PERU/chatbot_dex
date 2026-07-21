using Chatbot.Domain.Vision;

namespace Chatbot.Application.Abstractions;

public interface IVisionAnalysisClient
{
    Task<IReadOnlyCollection<DetectedObject>> AnalyzeAsync(
        Stream imageStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken);
}
