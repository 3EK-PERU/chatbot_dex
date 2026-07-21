namespace Chatbot.Infrastructure.Options;

public sealed class FastApiOptions
{
    public const string SectionName = "FastApi";

    public string BaseUrl { get; init; } = "http://localhost:8000";

    public string AnalyzePath { get; init; } = "/analyze";
}
