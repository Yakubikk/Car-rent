using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace car_rent_back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
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
}