using Chatbot.Application.Abstractions;
using Chatbot.Application.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Chatbot.WebApi.Controllers;

[ApiController]
[Route("api/audit")]
public sealed class AuditController : ControllerBase
{
    private readonly IAuditOrchestrator _orchestrator;

    public AuditController(IAuditOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpPost("{sessionId:guid}/image")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> AnalyzeImage([FromRoute] Guid sessionId, [FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { error = "Image file is empty." });
        }

        await using var ms = new MemoryStream();
        await file.CopyToAsync(ms, cancellationToken);
        ms.Position = 0;

        var command = new AnalyzeImageCommand(sessionId, file.FileName, file.ContentType, ms);
        var result = await _orchestrator.AnalyzeImageAsync(command, cancellationToken);
        return Ok(result);
    }
}
