using Chatbot.Domain.Vision;

namespace Chatbot.Application.Abstractions;

public interface IImageStorageService
{
    Task<ImageAuditInfo> SaveAsync(
        Guid sessionId,
        string fileName,
        string contentType,
        Stream imageStream,
        CancellationToken cancellationToken);
}
