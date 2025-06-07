using System.ComponentModel.DataAnnotations;

namespace car_rent_back.DTOs;

public class CreateUserDto
{
    [Required(ErrorMessage = "Email обязателен")]
    [EmailAddress(ErrorMessage = "Неверный формат email")]
    public string Email { get; set; } = null!;
    
    [Required(ErrorMessage = "Пароль обязателен")]
    [MinLength(6, ErrorMessage = "Пароль должен содержать минимум 6 символов")]
    public string Password { get; set; } = null!;
    
    [Required(ErrorMessage = "Имя обязательно")]
    public string FirstName { get; set; } = null!;
    
    [Required(ErrorMessage = "Фамилия обязательна")]
    public string LastName { get; set; } = null!;
    
    public string? PhoneNumber { get; set; }
    
    public string? PassportNumber { get; set; }
    
    public string? DriverLicense { get; set; }
    
    public DateTime? DriverLicenseIssueDate { get; set; }
    
    public DateTime? BirthDate { get; set; }
    
    public string? Address { get; set; }
    
    // Роль пользователя (Admin, Manager, Guest)
    public string[]? Roles { get; set; } = [];
}
