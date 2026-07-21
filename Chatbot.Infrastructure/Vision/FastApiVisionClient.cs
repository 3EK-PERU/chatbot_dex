using System.Net.Http.Json;
using Chatbot.Application.Abstractions;
using Chatbot.Domain.Vision;
using Chatbot.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace Chatbot.Infrastructure.Vision;

public sealed class FastApiVisionClient : IVisionAnalysisClient
{
    private readonly HttpClient _httpClient;
    private readonly FastApiOptions _options;

    public FastApiVisionClient(HttpClient httpClient, IOptions<FastApiOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<IReadOnlyCollection<DetectedObject>> AnalyzeAsync(
        Stream imageStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken)
    {
        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(imageStream);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
        content.Add(fileContent, "file", fileName);

        using var response = await _httpClient.PostAsync(_options.AnalyzePath, content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<FastApiAnalyzeResponse>(cancellationToken: cancellationToken);
        if (payload?.Detections is null)
        {
            return Array.Empty<DetectedObject>();
        }

        return payload.Detections
            .Select(d => new DetectedObject(
                d.ClassName,
                d.Confidence,
                new BoundingBox(d.X, d.Y, d.Width, d.Height)))
            .ToList();
    }

    private sealed record FastApiAnalyzeResponse(List<FastApiDetectionItem> Detections);

    private sealed record FastApiDetectionItem(
        string ClassName,
        double Confidence,
        double X,
        double Y,
        double Width,
        double Height);
}
