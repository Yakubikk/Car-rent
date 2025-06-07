using Microsoft.AspNetCore.Identity;

namespace car_rent_back.Models;

public class ApplicationUser : IdentityUser
{
    // Дополнительные поля для пользователя каршеринга
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PassportNumber { get; set; }
    public string DriverLicense { get; set; }
    public DateTime DriverLicenseIssueDate { get; set; }
    public DateTime BirthDate { get; set; }
    public string Address { get; set; }
    public DateTime RegisterDate { get; set; } = DateTime.UtcNow;
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
}
