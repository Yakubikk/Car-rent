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
    
    // GET: api/Rentals/Active
    [HttpGet("Active")]
    [Authorize(Policy = "RequireManagerOrAdminRole")]
    public async Task<ActionResult<IEnumerable<Rental>>> GetActiveRentals()
    {
        return await context.Rentals
            .Include(r => r.Car)
            .Include(r => r.User)
            .Where(r => r.Status == RentalStatus.Booked || r.Status == RentalStatus.Active)
            .ToListAsync();
    }
    
    // GET: api/Rentals/User/{userId:guid}
    [HttpGet("User/{userId:guid}")]
    [Authorize(Policy = "RequireManagerOrAdminRole")]
    public async Task<ActionResult<IEnumerable<Rental>>> GetRentalsByUser(Guid userId)
    {
        var rentals = await context.Rentals
            .Include(r => r.Car)
            .Where(r => r.UserId == userId.ToString())
            .ToListAsync();

        return rentals;
    }

    // GET: api/Rentals/5
    [HttpGet("{id:guid}")]
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

        // Конвертируем даты в UTC формат
        var startDateTimeUtc = DateTime.SpecifyKind(rentalDto.StartDateTime, DateTimeKind.Utc);
        var endDateTimeUtc = DateTime.SpecifyKind(rentalDto.EndDateTime, DateTimeKind.Utc);

        // Вычисляем стоимость поминутно
        var totalMinutes = (endDateTimeUtc - startDateTimeUtc).TotalMinutes;
        var days = Math.Floor(totalMinutes / (24 * 60));
        var remainingMinutes = totalMinutes % (24 * 60);
        
        // Расчет стоимости: дни по дневной ставке + оставшиеся минуты по почасовой ставке, поделенной на 60
        var totalCost = (decimal)days * car.PricePerDay + (decimal)remainingMinutes * (car.PricePerHour / 60);
        // Округляем до двух знаков после запятой (копейки)
        totalCost = Math.Round(totalCost, 2);

        var rental = new Rental
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CarId = car.Id,
            StartDateTime = startDateTimeUtc,
            EndDateTime = endDateTimeUtc,
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
    [HttpPut("{id:guid}/Status")]
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
        if (statusDto.Status is RentalStatus.Completed or RentalStatus.Cancelled)
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
    [HttpDelete("{id:guid}")]
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

    // POST: api/Rentals/{id:guid}/Cancel
    [HttpPost("{id:guid}/Cancel")]
    public async Task<IActionResult> CancelRental(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var rental = await context.Rentals
            .Include(r => r.Car)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rental == null)
        {
            return NotFound("Бронирование не найдено");
        }

        // Проверяем, что это бронирование принадлежит текущему пользователю или пользователь - админ/менеджер
        if (rental.UserId != userId && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
        {
            return Forbid();
        }

        // Проверяем, что бронирование можно отменить (оно в статусе "Забронировано")
        if (rental.Status != RentalStatus.Booked)
        {
            return BadRequest("Можно отменить только бронирования в статусе 'Забронировано'");
        }

        // Меняем статус на "Отменено"
        rental.Status = RentalStatus.Cancelled;
        
        // Делаем автомобиль снова доступным
        rental.Car.IsAvailable = true;

        await context.SaveChangesAsync();

        return Ok(new { Message = "Бронирование успешно отменено" });
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
