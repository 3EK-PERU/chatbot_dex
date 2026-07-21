using System.Collections.Concurrent;
using Chatbot.Application.Abstractions;
using Chatbot.Domain.Vision;

namespace Chatbot.Infrastructure.Storage;

public sealed class InMemoryImageStorageService : IImageStorageService
{
    private readonly ConcurrentDictionary<string, byte[]> _images = new(StringComparer.Ordinal);

    public async Task<ImageAuditInfo> SaveAsync(
        Guid sessionId,
        string fileName,
        string contentType,
        Stream imageStream,
        CancellationToken cancellationToken)
    {
        await using var ms = new MemoryStream();
        await imageStream.CopyToAsync(ms, cancellationToken);
        var bytes = ms.ToArray();

        var imageId = $"{sessionId:N}_{Guid.NewGuid():N}";
        _images[imageId] = bytes;

        if (imageStream.CanSeek)
        {
            imageStream.Position = 0;
        }

        return new ImageAuditInfo(
            imageId,
            fileName,
            contentType,
            bytes.Length,
            DateTimeOffset.UtcNow);
    }
}
