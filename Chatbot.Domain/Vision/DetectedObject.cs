namespace Chatbot.Domain.Vision;

public sealed record DetectedObject(
    string ClassName,
    double Confidence,
    BoundingBox BoundingBox);
