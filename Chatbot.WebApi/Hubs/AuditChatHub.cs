using Chatbot.Application.Abstractions;
using Chatbot.Application.Contracts;
using Microsoft.AspNetCore.SignalR;

namespace Chatbot.WebApi.Hubs;

public sealed class AuditChatHub : Hub
{
    private readonly IAuditOrchestrator _orchestrator;

    public AuditChatHub(IAuditOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public async Task JoinSession(string sessionId)
    {
        if (!Guid.TryParse(sessionId, out var id))
        {
            throw new HubException("Invalid session id.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, id.ToString());
    }

    public async Task SendMessage(string sessionId, string message)
    {
        if (!Guid.TryParse(sessionId, out var id))
        {
            throw new HubException("Invalid session id.");
        }

        var response = _orchestrator.SendChatMessage(new SendChatMessageCommand(id, message));
        await Clients.Group(id.ToString()).SendAsync("MessageReceived", response);
    }
}
