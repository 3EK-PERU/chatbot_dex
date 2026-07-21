namespace Chatbot.Application.Contracts;

public sealed record AnalyzeImageCommand(
    Guid SessionId,
    string FileName,
    string ContentType,
    Stream ImageStream);
