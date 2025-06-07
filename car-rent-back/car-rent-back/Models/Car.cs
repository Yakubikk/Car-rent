namespace car_rent_back.Models;

using System.Text.Json.Serialization;

public enum TransmissionType
{
    Manual,
    Automatic,
    SemiAutomatic,
    CVT,
    Robot
}

public enum FuelType
{
    Petrol,
    Diesel,
    Gas,
    Hybrid,
    Electric
}

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
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TransmissionType Transmission { get; set; }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public FuelType FuelType { get; set; }
    
    // Навигационные свойства
    [JsonIgnore]
    public virtual ICollection<Rental> Rentals { get; set; } = new List<Rental>();
}
