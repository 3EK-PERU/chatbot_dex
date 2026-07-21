using Chatbot.Domain.Sessions;

namespace Chatbot.Application.Abstractions;

public interface ISessionStore
{
    ChatSession GetOrCreate(Guid sessionId);
    bool TryGet(Guid sessionId, out ChatSession? session);
}
