using Chatbot.Application.Abstractions;
using Chatbot.Application.Options;
using Chatbot.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Chatbot.Application.DependencyInjection;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<PlanogramOptions>(configuration.GetSection(PlanogramOptions.SectionName));

        services.AddScoped<IAuditOrchestrator, AuditOrchestrator>();
        services.AddScoped<IPlanogramEvaluator, PlanogramEvaluator>();
        services.AddScoped<IChatAssistantService, ChatAssistantService>();

        return services;
    }
}
