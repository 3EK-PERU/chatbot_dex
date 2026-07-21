using Chatbot.Client.Models;
using Microsoft.AspNetCore.Mvc;

namespace Chatbot.Client.ViewComponents;

public sealed class ChatbotWidgetViewComponent : ViewComponent
{
    private readonly IConfiguration configuration;

    public ChatbotWidgetViewComponent(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public IViewComponentResult Invoke()
    {
        var options = new ChatbotWidgetOptions
        {
            HubUrl = configuration["ChatbotWidget:HubUrl"] ?? ChatbotWidgetOptions.DefaultHubUrl,
            BotName = configuration["ChatbotWidget:BotName"] ?? ChatbotWidgetOptions.DefaultBotName,
            Theme = NormalizeTheme(configuration["ChatbotWidget:Theme"]),
            SessionId = configuration["ChatbotWidget:SessionId"] ?? Guid.NewGuid().ToString("N"),
            UserName = configuration["ChatbotWidget:UserName"] ?? ChatbotWidgetOptions.DefaultUserName,
            UserPhone = configuration["ChatbotWidget:UserPhone"],
            IdCliente = configuration["ChatbotWidget:IdCliente"],
            WelcomeMessage = configuration["ChatbotWidget:WelcomeMessage"] ?? ChatbotWidgetOptions.DefaultWelcomeMessage,
            Placeholder = configuration["ChatbotWidget:Placeholder"] ?? ChatbotWidgetOptions.DefaultPlaceholder,
        };

        return View(options);
    }

    private static string NormalizeTheme(string? theme)
    {
        return string.Equals(theme, "dark", StringComparison.OrdinalIgnoreCase)
            ? "dark"
            : "light";
    }
}