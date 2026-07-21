namespace Chatbot.Client.Models;

public sealed class ChatbotWidgetOptions
{
    public const string DefaultHubUrl = "/hubs/audit-chat";
    public const string DefaultBotName = "ChatBot AI";
    public const string DefaultTheme = "light";
    public const string DefaultUserName = "Usuario";
    public const string DefaultWelcomeMessage = "¡Hola! ¿En qué puedo ayudarte?";
    public const string DefaultPlaceholder = "Escribe un mensaje...";

    public string HubUrl { get; set; } = DefaultHubUrl;
    public string BotName { get; set; } = DefaultBotName;
    public string Theme { get; set; } = DefaultTheme;
    public string SessionId { get; set; } = string.Empty;
    public string UserName { get; set; } = DefaultUserName;
    public string? UserPhone { get; set; }
    public string? IdCliente { get; set; }
    public string WelcomeMessage { get; set; } = DefaultWelcomeMessage;
    public string Placeholder { get; set; } = DefaultPlaceholder;
}