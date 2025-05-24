public class RegisterDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PassportNumber { get; set; }
    public string DriverLicense { get; set; }
    public DateTime DriverLicenseIssueDate { get; set; }
    public DateTime BirthDate { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
}