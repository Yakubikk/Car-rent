using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using car_rent_back.Data;
using Microsoft.EntityFrameworkCore;
using car_rent_back.DTOs;

namespace car_rent_back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "RequireManagerOrAdminRole")]
    public async Task<ActionResult<IEnumerable<Rental>>> GetUsers()
    {
        // Получаем всех пользователей из базы данных
        var users = await userManager.Users.ToListAsync();
        
        // Возвращаем информацию о пользователях (без конфиденциальных данных)
        var result = users.Select(user => new
        {
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.RegisterDate,
            user.IsActive,
            Roles = userManager.GetRolesAsync(user).Result
        });
        
        return Ok(result);
    }
    
    [HttpGet("get-me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        // Получаем email пользователя из клеймов
        var email = User.FindFirstValue(ClaimTypes.Email);
        
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new { Message = "Не удалось определить пользователя" });
        }
        
        // Находим пользователя по email
        var user = await userManager.FindByEmailAsync(email);
        
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }
        
        // Получаем роли пользователя
        var roles = await userManager.GetRolesAsync(user);
        
        // Возвращаем информацию о пользователе (без конфиденциальных данных)
        return Ok(new
        {
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            Roles = roles
        });
    }
    
    [HttpGet("by-email")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> GetUserByEmail([FromQuery] string email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new { Message = "Email не может быть пустым" });
        }

        var user = await userManager.FindByEmailAsync(email);
        
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }
        
        // Получаем роли пользователя
        var roles = await userManager.GetRolesAsync(user);
        
        // Возвращаем информацию о пользователе (без конфиденциальных данных)
        return Ok(new
        {
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.PassportNumber,
            user.DriverLicense,
            user.DriverLicenseIssueDate,
            user.BirthDate,
            user.Address,
            user.UserName,
            Roles = roles
        });
    }
    
    [HttpGet("guest-users")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> GetGuestUsers()
    {
        // Получаем всех пользователей с ролью Guest
        var users = await userManager.GetUsersInRoleAsync("Guest");
        
        // Возвращаем информацию о пользователях (без конфиденциальных данных)
        var result = users.Select(user => new
        {
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.RegisterDate
        });
        
        return Ok(result);
    }
    
    [HttpPost("update-avatar")]
    [Authorize]
    public async Task<IActionResult> UpdateAvatar([FromForm] AvatarDto avatarDto)
    {
        // Получаем email пользователя из клеймов
        var email = User.FindFirstValue(ClaimTypes.Email);
        
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized(new { Message = "Не удалось определить пользователя" });
        }
        
        // Находим пользователя по email
        var user = await userManager.FindByEmailAsync(email);
        
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }
        
        // Если передан файл, сохраняем его
        if (avatarDto.File.Length > 0)
        {
            // Валидация типа файла (только изображения)
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(avatarDto.File.ContentType.ToLower()))
            {
                return BadRequest(new { Message = "Недопустимый формат файла. Разрешены только JPEG, PNG и GIF." });
            }
            
            // Создаем уникальное имя файла
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(avatarDto.File.FileName)}";
            
            // Создаем директорию для аватаров, если она не существует
            var uploadsFolder = Path.Combine(environment.WebRootPath, "avatars");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }
            
            // Полный путь к файлу
            var filePath = Path.Combine(uploadsFolder, fileName);
            
            // Сохраняем файл
            await using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await avatarDto.File.CopyToAsync(fileStream);
            }
            
            // Обновляем URL аватара пользователя
            user.AvatarUrl = $"/avatars/{fileName}";
        }
        // Если передана внешняя ссылка
        else if (!string.IsNullOrEmpty(avatarDto.ExternalUrl))
        {
            // Проверяем, что ссылка является допустимым URL
            if (Uri.TryCreate(avatarDto.ExternalUrl, UriKind.Absolute, out var uriResult) 
                && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps))
            {
                user.AvatarUrl = avatarDto.ExternalUrl;
            }
            else
            {
                return BadRequest(new { Message = "Указана недопустимая ссылка на изображение" });
            }
        }
        else
        {
            return BadRequest(new { Message = "Необходимо передать файл или ссылку на изображение" });
        }
        
        // Сохраняем изменения в базе данных
        var result = await userManager.UpdateAsync(user);
        
        if (result.Succeeded)
        {
            return Ok(new { Message = "Аватар успешно обновлен", user.AvatarUrl });
        }
        
        return BadRequest(new { Message = "Не удалось обновить аватар", result.Errors });
    }
    
    [HttpGet("activate/{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> ActivateUser(string id, [FromQuery] bool activate = true)
    {
        var user = await userManager.FindByIdAsync(id);
        
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }
        
        user.IsActive = activate;
        
        var result = await userManager.UpdateAsync(user);
        
        if (result.Succeeded)
        {
            return Ok(new { Message = activate ? "Пользователь активирован" : "Пользователь деактивирован" });
        }
        
        return BadRequest(new { Message = "Не удалось изменить статус пользователя", result.Errors });
    }
}