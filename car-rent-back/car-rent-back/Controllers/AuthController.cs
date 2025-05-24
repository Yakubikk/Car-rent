using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

[ApiController]
[Route("[controller]")]
public class AuthController(
    UserManager<IdentityUser> userManager,
    ILogger<AuthController> logger,
    IEmailSender emailSender,
    IHubContext<RegistrationHub> hubContext) : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager = userManager;
    private readonly ILogger<AuthController> _logger = logger;
    private readonly IEmailSender _emailSender = emailSender; // Если нужно отправить email
    private readonly IHubContext<RegistrationHub> _hubContext = hubContext;

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
                Address = registerDto.Address
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            await _userManager.AddToRoleAsync(user, "Guest"); // Добавляем пользователя в роль "Guest" (ожидает подтверждения)

            if (result.Succeeded)
            {
                _logger.LogInformation("Новый пользователь зарегистрирован: {Email}", registerDto.Email);

                // Здесь можно отправить уведомление на фронтенд через SignalR или другой механизм
                // Или отправить email администратору
                await SendRegistrationNotification(registerDto.Email);

                return Ok(new { Message = "Регистрация успешна. Ожидайте подтверждения." });
            }

            return BadRequest(result.Errors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при регистрации пользователя");
            return StatusCode(500, "Произошла ошибка при регистрации");
        }
    }

    [HttpPost("approve-registration")]
    [Authorize(Roles = "Manager, Admin")]
    public async Task<IActionResult> ApproveRegistration([FromBody] EmailDto emailDto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(emailDto.Email);

            if (user == null)
            {
                return NotFound(new { Message = "Пользователь не найден" });
            }

            // Проверяем, что пользователь в роли Guest (ожидает подтверждения)
            if (await _userManager.IsInRoleAsync(user, "Guest"))
            {
                // Удаляем роль Guest и добавляем роль User
                await _userManager.RemoveFromRoleAsync(user, "Guest");
                await _userManager.AddToRoleAsync(user, "User");

                // Отправляем email уведомление пользователю о подтверждении регистрации
                await _emailSender.SendEmailAsync(
                    user.Email!,
                    "Регистрация подтверждена",
                    "Ваша регистрация успешно подтверждена. Вы можете войти в систему."
                );

                // Уведомляем об этом через SignalR
                await _hubContext.Clients.All.SendAsync("RegistrationApproved", new { email = user.Email, date = DateTime.Now });

                _logger.LogInformation("Регистрация пользователя одобрена: {Email}", user.Email);

                return Ok(new { Message = "Регистрация пользователя подтверждена" });
            }

            return BadRequest(new { Message = "Пользователь уже подтвержден или находится в другой роли" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при подтверждении регистрации пользователя");
            return StatusCode(500, new { Message = "Произошла ошибка при подтверждении регистрации" });
        }
    }

    [HttpPost("reject-registration")]
    [Authorize(Roles = "Manager, Admin")]
    public async Task<IActionResult> RejectRegistration([FromBody] EmailDto emailDto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(emailDto.Email);

            if (user == null)
            {
                return NotFound(new { Message = "Пользователь не найден" });
            }

            // Удаляем пользователя
            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                // Уведомляем об этом через SignalR
                await _hubContext.Clients.All.SendAsync("RegistrationRejected", new { email = emailDto.Email, date = DateTime.Now });

                _logger.LogInformation("Регистрация пользователя отклонена: {Email}", emailDto.Email);

                return Ok(new { Message = "Регистрация пользователя отклонена" });
            }

            return BadRequest(result.Errors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при отклонении регистрации пользователя");
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
            await _hubContext.Clients.All.SendAsync("NewRegistration", new { email, date = DateTime.Now });

            _logger.LogInformation("Отправлено уведомление о регистрации через SignalR: {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при отправке уведомления о регистрации");
        }
    }
}