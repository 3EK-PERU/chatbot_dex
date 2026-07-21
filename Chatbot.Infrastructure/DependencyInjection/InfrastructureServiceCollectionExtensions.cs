using Chatbot.Application.Abstractions;
using Chatbot.Infrastructure.Options;
using Chatbot.Infrastructure.Sessions;
using Chatbot.Infrastructure.Storage;
using Chatbot.Infrastructure.Vision;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Chatbot.Infrastructure.DependencyInjection;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<FastApiOptions>(configuration.GetSection(FastApiOptions.SectionName));

        services.AddSingleton<ISessionStore, InMemorySessionStore>();
        services.AddSingleton<IImageStorageService, InMemoryImageStorageService>();

        services.AddHttpClient<IVisionAnalysisClient, FastApiVisionClient>((sp, client) =>
        {
            var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<FastApiOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl, UriKind.Absolute);
        });

        return services;
    }
}
