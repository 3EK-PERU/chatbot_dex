namespace Chatbot.Domain.Vision;

public sealed record ImageAuditInfo(
    string ImageId,
    string FileName,
    string ContentType,
    long SizeInBytes,
    DateTimeOffset UploadedAtUtc);
