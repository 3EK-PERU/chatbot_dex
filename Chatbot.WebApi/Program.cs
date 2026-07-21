using Chatbot.Application.DependencyInjection;
using Chatbot.Infrastructure.DependencyInjection;
using Chatbot.WebApi.Hubs;
using Chatbot.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true);
    });
});

builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthorization();

app.MapControllers();
app.MapHub<AuditChatHub>("/hubs/audit-chat");

app.Run();
