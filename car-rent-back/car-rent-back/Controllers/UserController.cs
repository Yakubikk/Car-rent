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
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.RegisterDate,
            user.IsActive,
            user.AvatarUrl,
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
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.PhoneNumber,
            user.RegisterDate,
            user.IsActive,
            user.AvatarUrl,
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
            user.Id,
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
            user.RegisterDate,
            user.IsActive,
            user.AvatarUrl,
            Roles = roles
        });
    }
    
    [HttpGet("{id}")]
    [Authorize(Policy = "RequireManagerOrAdminRole")]
    public async Task<IActionResult> GetUserById(string id)
    {
        if (string.IsNullOrEmpty(id))
        {
            return BadRequest(new { Message = "ID пользователя не может быть пустым" });
        }

        var user = await userManager.FindByIdAsync(id);
        
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }
        
        // Получаем роли пользователя
        var roles = await userManager.GetRolesAsync(user);
        
        // Возвращаем информацию о пользователе (без конфиденциальных данных)
        return Ok(new
        {
            user.Id,
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
            user.RegisterDate,
            user.IsActive,
            user.AvatarUrl,
            Roles = roles
        });
    }
    
    [HttpGet("guest-users")]
    [Authorize(Policy = "RequireManagerOrAdminRole")]
    public async Task<IActionResult> GetGuestUsers()
    {
        // Получаем всех пользователей с ролью Guest
        var users = await userManager.GetUsersInRoleAsync("Guest");
        
        // Возвращаем информацию о пользователях (без конфиденциальных данных)
        var result = users.Select(user => new
        {
            user.Id,
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

            // Используем настроенный WebRootPath через environment
            var uploadsFolder = Path.Combine(environment.ContentRootPath, "wwwroot", "avatars");
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
    
    [HttpPost("activate/{email}")]
    [Authorize(Policy = "RequireManagerOrAdminRole")]
    public async Task<IActionResult> ActivateUser(string email, [FromQuery] bool activate = true)
    {
        // Получаем текущего пользователя
        var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);
        
        // Проверяем, не пытается ли пользователь деактивировать себя
        if (email.Equals(currentUserEmail, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { Message = "Вы не можете изменить статус своей учетной записи" });
        }
        
        // Находим пользователя, которого нужно активировать/деактивировать
        var user = await userManager.FindByEmailAsync(email);
        
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }
        
        // Получаем роли целевого пользователя
        var userRoles = await userManager.GetRolesAsync(user);
        
        // Проверяем роль текущего пользователя
        var isCurrentUserAdmin = User.IsInRole("Admin");
        var isCurrentUserManager = User.IsInRole("Manager");
        
        // Если текущий пользователь - менеджер, и целевой пользователь - менеджер или админ
        if (isCurrentUserManager && !isCurrentUserAdmin && 
            (userRoles.Contains("Manager") || userRoles.Contains("Admin")))
        {
            return BadRequest(new { Message = "Менеджер не может изменять статус других менеджеров или администраторов" });
        }
        
        // Если текущий пользователь - админ, и целевой пользователь - админ
        if (isCurrentUserAdmin && userRoles.Contains("Admin"))
        {
            return BadRequest(new { Message = "Администратор не может изменять статус других администраторов" });
        }
        
        user.IsActive = activate;
        
        var result = await userManager.UpdateAsync(user);
        
        if (result.Succeeded)
        {
            return Ok(new { Message = activate ? "Пользователь активирован" : "Пользователь деактивирован" });
        }
        
        return BadRequest(new { Message = "Не удалось изменить статус пользователя", result.Errors });
    }
    
    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto userDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Проверяем, существует ли пользователь с таким email
        var existingUser = await userManager.FindByEmailAsync(userDto.Email);
        if (existingUser != null)
        {
            return BadRequest(new { Message = "Пользователь с таким email уже существует" });
        }

        var user = new ApplicationUser
        {
            UserName = userDto.Email,
            Email = userDto.Email,
            FirstName = userDto.FirstName,
            LastName = userDto.LastName,
            PhoneNumber = userDto.PhoneNumber,
            PassportNumber = userDto.PassportNumber ?? string.Empty,
            DriverLicense = userDto.DriverLicense ?? string.Empty,
            DriverLicenseIssueDate = userDto.DriverLicenseIssueDate ?? DateTime.UtcNow,
            BirthDate = userDto.BirthDate ?? DateTime.UtcNow,
            Address = userDto.Address ?? string.Empty,
            IsActive = true,
            RegisterDate = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, userDto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { Message = "Не удалось создать пользователя", Errors = result.Errors });
        }

        // Добавляем пользователя в указанную роль
        if (userDto.Roles.Length > 0)
        {
            await userManager.AddToRolesAsync(user, userDto.Roles);
        }
        else
        {
            // По умолчанию добавляем роль Guest
            await userManager.AddToRoleAsync(user, "Guest");
        }

        return Ok(new { 
            Message = "Пользователь успешно создан", 
            UserId = user.Id,
            Email = user.Email
        });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto userDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }

        // Проверяем, не пытается ли админ изменить другого админа
        var userRoles = await userManager.GetRolesAsync(user);
        var isCurrentUserAdmin = User.IsInRole("Admin");
        
        if (isCurrentUserAdmin && userRoles.Contains("Admin") && 
            user.Id != User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return BadRequest(new { Message = "Администратор не может изменять данные других администраторов" });
        }

        // Обновляем основные поля
        user.FirstName = userDto.FirstName ?? user.FirstName;
        user.LastName = userDto.LastName ?? user.LastName;
        user.PhoneNumber = userDto.PhoneNumber ?? user.PhoneNumber;
        user.PassportNumber = userDto.PassportNumber ?? user.PassportNumber;
        user.DriverLicense = userDto.DriverLicense ?? user.DriverLicense;
        user.DriverLicenseIssueDate = userDto.DriverLicenseIssueDate ?? user.DriverLicenseIssueDate;
        user.BirthDate = userDto.BirthDate ?? user.BirthDate;
        user.Address = userDto.Address ?? user.Address;
        
        if (userDto.IsActive.HasValue)
        {
            user.IsActive = userDto.IsActive.Value;
        }

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { Message = "Не удалось обновить пользователя", Errors = result.Errors });
        }

        // Если есть роли для назначения и они отличаются от текущих
        if (userDto.Roles is not { Length: > 0 }) return Ok(new { Message = "Пользователь успешно обновлен" });
        // Получаем текущие роли пользователя
        var currentUserRoles = await userManager.GetRolesAsync(user);
            
        // Удаляем все текущие роли
        if (currentUserRoles.Count > 0)
        {
            await userManager.RemoveFromRolesAsync(user, currentUserRoles);
        }
            
        // Добавляем новые роли
        await userManager.AddToRolesAsync(user, userDto.Roles);

        return Ok(new { Message = "Пользователь успешно обновлен" });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        // Проверяем, не пытается ли пользователь удалить себя
        if (id == currentUserId)
        {
            return BadRequest(new { Message = "Вы не можете удалить свою учетную запись" });
        }
        
        var user = await userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }

        // Проверяем, не пытается ли админ удалить другого админа
        var userRoles = await userManager.GetRolesAsync(user);
        if (userRoles.Contains("Admin"))
        {
            return BadRequest(new { Message = "Нельзя удалить учетную запись администратора" });
        }

        // Проверяем, есть ли у пользователя активные аренды
        var activeRentals = await context.Rentals
            .Where(r => r.UserId == id && (r.Status == RentalStatus.Booked || r.Status == RentalStatus.Active))
            .AnyAsync();
            
        if (activeRentals)
        {
            return BadRequest(new { Message = "Нельзя удалить пользователя с активными арендами" });
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { Message = "Не удалось удалить пользователя", Errors = result.Errors });
        }

        return Ok(new { Message = "Пользователь успешно удален" });
    }
}