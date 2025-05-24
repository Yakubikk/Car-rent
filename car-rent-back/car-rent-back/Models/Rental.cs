namespace car_rent_back.Models;

public class Rental
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = null!;
    public Guid CarId { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public RentalStatus Status { get; set; } = RentalStatus.Booked;
    public decimal TotalCost { get; set; }
    
    // Навигационные свойства
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual Car Car { get; set; } = null!;
}

public enum RentalStatus
{
    Booked,
    Active,
    Completed,
    Cancelled
}
