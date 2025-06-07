using System.ComponentModel.DataAnnotations;

namespace car_rent_back.DTOs;

public class UpdateUserDto
{
    public string? FirstName { get; set; }
    
    public string? LastName { get; set; }
    
    public string? PhoneNumber { get; set; }
    
    public string? PassportNumber { get; set; }
    
    public string? DriverLicense { get; set; }
    
    public DateTime? DriverLicenseIssueDate { get; set; }
    
    public DateTime? BirthDate { get; set; }
    
    public string? Address { get; set; }
    
    public bool? IsActive { get; set; }
    
    // Массив ролей пользователя (Admin, Manager, Guest)
    public string[] Roles { get; set; } = [];
}
