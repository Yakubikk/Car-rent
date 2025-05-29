using Microsoft.AspNetCore.Identity.UI.Services;

namespace car_rent_back.Services;

/// <summary>
/// Пустая реализация IEmailSender, которая не отправляет фактические email
/// </summary>
public class NoOpEmailSender(ILogger<NoOpEmailSender> logger) : IEmailSender
{
    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        logger.LogInformation("Email не отправлен (фиктивная отправка): To: {Email}, Subject: {Subject}", email, subject);
        return Task.CompletedTask;
    }
}
