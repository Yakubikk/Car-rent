using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace car_rent_back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireAdminRole")]
public class RolesController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    : ControllerBase
{
    // GET: api/Roles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<IdentityRole>>> GetRoles()
    {
        return await roleManager.Roles.ToListAsync();
    }

    // GET: api/Roles/User/{userId}
    [HttpGet("User/{userId}")]
    public async Task<ActionResult<IEnumerable<string>>> GetUserRoles(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        var roles = await userManager.GetRolesAsync(user);
        return Ok(roles);
    }

    // POST: api/Roles
    [HttpPost]
    public async Task<IActionResult> CreateRole([FromBody] RoleCreateDto roleDto)
    {
        if (string.IsNullOrEmpty(roleDto.Name))
        {
            return BadRequest("Имя роли не может быть пустым");
        }

        var roleExists = await roleManager.RoleExistsAsync(roleDto.Name);
        if (roleExists)
        {
            return Conflict("Роль с таким именем уже существует");
        }

        var result = await roleManager.CreateAsync(new IdentityRole(roleDto.Name));
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return CreatedAtAction(nameof(GetRoles), null);
    }

    // PUT: api/Roles/User
    [HttpPut("User")]
    public async Task<IActionResult> AssignRoleToUser([FromBody] UserRoleDto userRoleDto)
    {
        var user = await userManager.FindByIdAsync(userRoleDto.UserId);
        if (user == null)
        {
            return NotFound("Пользователь не найден");
        }

        if (!await roleManager.RoleExistsAsync(userRoleDto.RoleName))
        {
            return NotFound("Роль не найдена");
        }

        // Если действие - добавление роли
        if (userRoleDto.Action == RoleAction.Add)
        {
            if (await userManager.IsInRoleAsync(user, userRoleDto.RoleName))
            {
                return Conflict("Пользователь уже имеет эту роль");
            }

            var result = await userManager.AddToRoleAsync(user, userRoleDto.RoleName);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
        }
        // Если действие - удаление роли
        else if (userRoleDto.Action == RoleAction.Remove)
        {
            if (!await userManager.IsInRoleAsync(user, userRoleDto.RoleName))
            {
                return Conflict("Пользователь не имеет этой роли");
            }

            var result = await userManager.RemoveFromRoleAsync(user, userRoleDto.RoleName);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
        }

        return NoContent();
    }

    // DELETE: api/Roles/{roleName}
    [HttpDelete("{roleName}")]
    public async Task<IActionResult> DeleteRole(string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            return NotFound();
        }

        var role = await roleManager.FindByNameAsync(roleName);
        if (role.Name == "Admin" || role.Name == "User" || role.Name == "Manager")
        {
            return BadRequest("Нельзя удалить системную роль");
        }

        var result = await roleManager.DeleteAsync(role);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        return NoContent();
    }
}

// DTO для создания роли
public class RoleCreateDto
{
    public string Name { get; set; } = null!;
}

// DTO для назначения/удаления роли пользователю
public class UserRoleDto
{
    public string UserId { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public RoleAction Action { get; set; }
}

public enum RoleAction
{
    Add,
    Remove
}
