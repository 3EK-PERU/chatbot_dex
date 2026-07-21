using Chatbot.Application.Abstractions;
using Chatbot.Application.Options;
using Chatbot.Domain.Evaluation;
using Chatbot.Domain.Vision;
using Microsoft.Extensions.Options;

namespace Chatbot.Application.Services;

public sealed class PlanogramEvaluator : IPlanogramEvaluator
{
    private readonly PlanogramOptions _options;

    public PlanogramEvaluator(IOptions<PlanogramOptions> options)
    {
        _options = options.Value;
    }

    public AuditEvaluation Evaluate(IReadOnlyCollection<DetectedObject> detectedObjects)
    {
        var rules = new List<RuleEvaluation>();
        var filtered = detectedObjects.Where(x => x.Confidence >= _options.MinimumConfidence).ToList();

        rules.Add(new RuleEvaluation(
            "DETECTION_MIN_CONFIDENCE",
            $"Objetos considerados con confidence >= {_options.MinimumConfidence:0.00}: {filtered.Count}.",
            filtered.Count > 0));

        foreach (var required in _options.RequiredClasses)
        {
            var exists = filtered.Any(x => string.Equals(x.ClassName, required, StringComparison.OrdinalIgnoreCase));
            rules.Add(new RuleEvaluation(
                $"REQUIRED_CLASS_{required.ToUpperInvariant()}",
                exists
                    ? $"Se detecto la clase requerida '{required}'."
                    : $"No se detecto la clase requerida '{required}'.",
                exists));
        }

        foreach (var minimumRule in _options.MinimumByClass)
        {
            var count = filtered.Count(x => string.Equals(x.ClassName, minimumRule.Key, StringComparison.OrdinalIgnoreCase));
            var passed = count >= minimumRule.Value;
            rules.Add(new RuleEvaluation(
                $"MIN_COUNT_{minimumRule.Key.ToUpperInvariant()}",
                passed
                    ? $"La clase '{minimumRule.Key}' cumple con minimo {minimumRule.Value} (detectados: {count})."
                    : $"La clase '{minimumRule.Key}' no cumple minimo {minimumRule.Value} (detectados: {count}).",
                passed));
        }

        if (_options.RequiredClasses.Count == 0 && _options.MinimumByClass.Count == 0)
        {
            rules.Add(new RuleEvaluation(
                "PLANOGRAM_NOT_CONFIGURED",
                "No hay reglas de planograma configuradas aun.",
                false));
        }

        var isApproved = rules.All(r => r.Passed);

        return new AuditEvaluation(isApproved, rules, DateTimeOffset.UtcNow);
    }
}
