using Chatbot.Application.Abstractions;
using Chatbot.Application.Contracts;
using Chatbot.WebApi.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Chatbot.WebApi.Controllers;

[ApiController]
[Route("api/chat")]
public sealed class ChatController : ControllerBase
{
    private readonly IAuditOrchestrator _orchestrator;

    public ChatController(IAuditOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpPost("{sessionId:guid}/message")]
    public IActionResult SendMessage([FromRoute] Guid sessionId, [FromBody] SendChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Message cannot be empty." });
        }

        var command = new SendChatMessageCommand(sessionId, request.Message.Trim());
        var response = _orchestrator.SendChatMessage(command);
        return Ok(response);
    }
}
