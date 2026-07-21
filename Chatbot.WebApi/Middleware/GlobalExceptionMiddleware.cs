using System.Net;
using System.Text.Json;

namespace Chatbot.WebApi.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found.");
            await WriteErrorAsync(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception during request processing.");
            await WriteErrorAsync(context, HttpStatusCode.InternalServerError, "Unexpected server error.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var payload = new { error = message, statusCode = (int)statusCode };
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
