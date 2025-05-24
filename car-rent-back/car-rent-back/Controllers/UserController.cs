using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace car_rent_back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    
    public UsersController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
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
        var user = await _userManager.FindByEmailAsync(email);
        
        if (user == null)
        {
            return NotFound(new { Message = "Пользователь не найден" });
        }
        
        // Получаем роли пользователя
        var roles = await _userManager.GetRolesAsync(user);
        
        // Возвращаем информацию о пользователе (без конфиденциальных данных)
        return Ok(new
        {
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            Roles = roles
        });
    }
}