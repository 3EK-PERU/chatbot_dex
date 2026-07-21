using System.Collections.Concurrent;
using Chatbot.Application.Abstractions;
using Chatbot.Domain.Sessions;

namespace Chatbot.Infrastructure.Sessions;

public sealed class InMemorySessionStore : ISessionStore
{
    private readonly ConcurrentDictionary<Guid, ChatSession> _sessions = new();

    public ChatSession GetOrCreate(Guid sessionId)
    {
        return _sessions.GetOrAdd(sessionId, static id => new ChatSession(id));
    }

    public bool TryGet(Guid sessionId, out ChatSession? session)
    {
        var found = _sessions.TryGetValue(sessionId, out var local);
        session = local;
        return found;
    }
}
