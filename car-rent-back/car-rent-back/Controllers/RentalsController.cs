using car_rent_back.Data;
using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace car_rent_back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RentalsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    // GET: api/Rentals
    [HttpGet]
    [Authorize(Policy = "RequireManagerOrAdminRole")]
    public async Task<ActionResult<IEnumerable<Rental>>> GetRentals()
    {
        return await context.Rentals
            .Include(r => r.Car)
            .Include(r => r.User)
            .ToListAsync();
    }

    // GET: api/Rentals/MyRentals
    [HttpGet("MyRentals")]
    public async Task<ActionResult<IEnumerable<Rental>>> GetMyRentals()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        return await context.Rentals
            .Include(r => r.Car)
            .Where(r => r.UserId == userId)
            .ToListAsync();
    }

    // GET: api/Rentals/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Rental>> GetRental(Guid id)
    {
        var rental = await context.Rentals
            .Include(r => r.Car)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rental == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != rental.UserId && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
        {
            return Forbid();
        }

        return rental;
    }

    // POST: api/Rentals
    [HttpPost]
    public async Task<ActionResult<Rental>> CreateRental(RentalCreateDto rentalDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var car = await context.Cars.FindAsync(rentalDto.CarId);
        if (car == null)
        {
            return BadRequest("Автомобиль не найден");
        }

        if (!car.IsAvailable)
        {
            return BadRequest("Автомобиль не доступен для аренды");
        }

        // Вычисляем стоимость
        var totalHours = (rentalDto.EndDateTime - rentalDto.StartDateTime).TotalHours;
        var days = Math.Floor(totalHours / 24);
        var remainingHours = totalHours % 24;
        
        var totalCost = (decimal)days * car.PricePerDay + (decimal)remainingHours * car.PricePerHour;

        var rental = new Rental
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CarId = car.Id,
            StartDateTime = rentalDto.StartDateTime,
            EndDateTime = rentalDto.EndDateTime,
            Status = RentalStatus.Booked,
            TotalCost = totalCost
        };

        context.Rentals.Add(rental);
        
        // Помечаем автомобиль как недоступный
        car.IsAvailable = false;
        
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRental), new { id = rental.Id }, rental);
    }

    // PUT: api/Rentals/5/Status
    [HttpPut("{id}/Status")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> UpdateRentalStatus(Guid id, [FromBody] RentalStatusUpdateDto statusDto)
    {
        var rental = await context.Rentals
            .Include(r => r.Car)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rental == null)
        {
            return NotFound();
        }

        rental.Status = statusDto.Status;

        // Если аренда завершается, делаем автомобиль доступным снова
        if (statusDto.Status == RentalStatus.Completed || statusDto.Status == RentalStatus.Cancelled)
        {
            rental.Car.IsAvailable = true;
            
            if (statusDto.Status == RentalStatus.Completed)
            {
                rental.EndDateTime = DateTime.UtcNow;
            }
        }
        
        await context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Rentals/5
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> DeleteRental(Guid id)
    {
        var rental = await context.Rentals.FindAsync(id);
        if (rental == null)
        {
            return NotFound();
        }

        context.Rentals.Remove(rental);
        await context.SaveChangesAsync();

        return NoContent();
    }
}

// DTO для создания аренды
public class RentalCreateDto
{
    public Guid CarId { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
}

// DTO для обновления статуса аренды
public class RentalStatusUpdateDto
{
    public RentalStatus Status { get; set; }
}
