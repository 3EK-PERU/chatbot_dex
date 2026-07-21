namespace Chatbot.Application.Options;

public sealed class PlanogramOptions
{
    public const string SectionName = "Planogram";

    public List<string> RequiredClasses { get; init; } = new();

    public Dictionary<string, int> MinimumByClass { get; init; } = new(StringComparer.OrdinalIgnoreCase);

    public double MinimumConfidence { get; init; } = 0.35;
}
