using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace car_rent_back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    ILogger<AuthController> logger,
    IEmailSender emailSender,
    IHubContext<RegistrationHub> hubContext) : ControllerBase
{
    // DTO для запросов с email
    public class EmailDto
    {
        public required string Email { get; set; }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PassportNumber = registerDto.PassportNumber,
                DriverLicense = registerDto.DriverLicense,
                DriverLicenseIssueDate = registerDto.DriverLicenseIssueDate,
                BirthDate = registerDto.BirthDate,
                PhoneNumber = registerDto.PhoneNumber,
                Address = registerDto.Address,
                IsActive = false
            };

            var result = await userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded) return BadRequest(result.Errors);
            // Добавляем пользователя в роль Guest ТОЛЬКО после успешного создания
            var roleResult = await userManager.AddToRoleAsync(user, "Guest");
                
            if (!roleResult.Succeeded)
            {
                logger.LogWarning("Не удалось добавить пользователя {Email} в роль Guest: {Errors}", 
                    registerDto.Email, string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            }
                
            logger.LogInformation("Новый пользователь зарегистрирован: {Email}", registerDto.Email);

            // Здесь можно отправить уведомление на фронтенд через SignalR или другой механизм
            await SendRegistrationNotification(registerDto.Email);

            return Ok(new { Message = "Регистрация успешна. Ожидайте подтверждения." });

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при регистрации пользователя: {Message}", ex.Message);
            return StatusCode(500, "Произошла ошибка при регистрации");
        }
    }

    [HttpPost("approve-registration")]
    [Authorize(Roles = "Manager, Admin")]
    public async Task<IActionResult> ApproveRegistration([FromBody] EmailDto emailDto)
    {
        try
        {
            var user = await userManager.FindByEmailAsync(emailDto.Email);

            if (user == null)
            {
                return NotFound(new { Message = "Пользователь не найден" });
            }

            // Проверяем, что пользователь в роли Guest (ожидает подтверждения)
            if (!await userManager.IsInRoleAsync(user, "Guest"))
                return BadRequest(new { Message = "Пользователь уже подтвержден или находится в другой роли" });
            // Удаляем роль Guest и добавляем роль User
            await userManager.RemoveFromRoleAsync(user, "Guest");
            await userManager.AddToRoleAsync(user, "User");
            
            // Активируем пользователя
            user.IsActive = true;
            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            // Отправляем email уведомление пользователю о подтверждении регистрации
            // await _emailSender.SendEmailAsync(
            //     user.Email!,
            //     "Регистрация подтверждена",
            //     "Ваша регистрация успешно подтверждена. Вы можете войти в систему."
            // );

            // Уведомляем об этом через SignalR
            await hubContext.Clients.All.SendAsync("RegistrationApproved", new { email = user.Email, date = DateTime.Now });

            logger.LogInformation("Регистрация пользователя одобрена: {Email}", user.Email);

            return Ok(new { Message = "Регистрация пользователя подтверждена" });

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при подтверждении регистрации пользователя");
            return StatusCode(500, new { Message = "Произошла ошибка при подтверждении регистрации" });
        }
    }

    [HttpPost("reject-registration")]
    [Authorize(Roles = "Manager, Admin")]
    public async Task<IActionResult> RejectRegistration([FromBody] EmailDto emailDto)
    {
        try
        {
            var user = await userManager.FindByEmailAsync(emailDto.Email);

            if (user == null)
            {
                return NotFound(new { Message = "Пользователь не найден" });
            }

            // Удаляем пользователя
            var result = await userManager.DeleteAsync(user);

            if (!result.Succeeded) return BadRequest(result.Errors);
            // Уведомляем об этом через SignalR
            await hubContext.Clients.All.SendAsync("RegistrationRejected", new { email = emailDto.Email, date = DateTime.Now });

            logger.LogInformation("Регистрация пользователя отклонена: {Email}", emailDto.Email);

            return Ok(new { Message = "Регистрация пользователя отклонена" });

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при отклонении регистрации пользователя");
            return StatusCode(500, new { Message = "Произошла ошибка при отклонении регистрации" });
        }
    }

    private async Task SendRegistrationNotification(string email)
    {
        try
        {
            // Отправка email уведомления администратору
            // await _emailSender.SendEmailAsync(
            //     "yagorius@gmail.com",
            //     "Новая регистрация",
            //     $"Новый пользователь хочет зарегистрироваться: {email}");

            // Отправка уведомления на фронтенд через SignalR для подтверждения менеджером
            await hubContext.Clients.All.SendAsync("NewRegistration", new { email, date = DateTime.Now });

            logger.LogInformation("Отправлено уведомление о регистрации через SignalR: {Email}", email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при отправке уведомления о регистрации");
        }
    }
}