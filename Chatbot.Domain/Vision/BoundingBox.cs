namespace Chatbot.Domain.Vision;

public sealed record BoundingBox(
    double X,
    double Y,
    double Width,
    double Height);
