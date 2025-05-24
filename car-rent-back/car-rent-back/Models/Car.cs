namespace car_rent_back.Models;

public class Car
{
    public Guid Id { get; set; }
    public string Brand { get; set; } = null!;
    public string Model { get; set; } = null!;
    public int Year { get; set; }
    public string LicensePlate { get; set; } = null!;
    public string Color { get; set; } = null!;
    public decimal PricePerHour { get; set; }
    public decimal PricePerDay { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    
    // Навигационные свойства
    public virtual ICollection<Rental> Rentals { get; set; } = new List<Rental>();
}
