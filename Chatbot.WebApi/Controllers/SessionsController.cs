using Chatbot.Application.Abstractions;
using Chatbot.WebApi.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Chatbot.WebApi.Controllers;

[ApiController]
[Route("api/sessions")]
public sealed class SessionsController : ControllerBase
{
    private readonly IAuditOrchestrator _orchestrator;

    public SessionsController(IAuditOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpPost]
    public ActionResult<SessionCreatedResponse> CreateSession()
    {
        var result = _orchestrator.CreateSession();
        return Ok(new SessionCreatedResponse(result.SessionId));
    }

    [HttpGet("{sessionId:guid}")]
    public IActionResult GetSessionState([FromRoute] Guid sessionId)
    {
        var state = _orchestrator.GetSessionState(sessionId);
        return Ok(state);
    }
}
