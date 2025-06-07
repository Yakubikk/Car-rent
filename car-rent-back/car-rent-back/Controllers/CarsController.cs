using car_rent_back.Data;
using car_rent_back.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace car_rent_back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController(ApplicationDbContext context) : ControllerBase
{
    // GET: api/Cars
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Car>>> GetCars()
    {
        return await context.Cars.ToListAsync();
    }

    // GET: api/Cars/5
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Car>> GetCar(Guid id)
    {
        var car = await context.Cars.FindAsync(id);

        if (car == null)
        {
            return NotFound();
        }

        return car;
    }

    // GET: api/Cars/Available
    [HttpGet("Available")]
    public async Task<ActionResult<IEnumerable<Car>>> GetAvailableCars()
    {
        return await context.Cars.Where(c => c.IsAvailable).ToListAsync();
    }

    // POST: api/Cars
    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<Car>> PostCar(Car car)
    {
        car.Id = Guid.NewGuid();
        context.Cars.Add(car);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCar), new { id = car.Id }, car);
    }

    // PUT: api/Cars/5
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<Car>> PutCar(Guid id, Car car)
    {
        if (id != car.Id)
        {
            return BadRequest();
        }

        context.Entry(car).State = EntityState.Modified;

        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CarExists(id))
            {
                return NotFound();
            }

            throw;
        }

        return car;
    }

    // DELETE: api/Cars/5
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> DeleteCar(Guid id)
    {
        var car = await context.Cars
            .Include(c => c.Rentals)
            .FirstOrDefaultAsync(c => c.Id == id);
            
        if (car == null)
        {
            return NotFound();
        }
        
        // Проверяем, есть ли активные или забронированные аренды для этой машины
        if (car.Rentals.Any(r => r.Status is RentalStatus.Active or RentalStatus.Booked))
        {
            return BadRequest("Невозможно удалить машину, которая в данный момент используется или забронирована.");
        }

        context.Cars.Remove(car);
        await context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/Cars/5/Availability
    [HttpPatch("{id:guid}/Availability")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> ToggleCarAvailability(Guid id, [FromBody] bool isAvailable)
    {
        var car = await context.Cars.FindAsync(id);
        if (car == null)
        {
            return NotFound();
        }

        car.IsAvailable = isAvailable;
        await context.SaveChangesAsync();

        return NoContent();
    }

    private bool CarExists(Guid id)
    {
        return context.Cars.Any(e => e.Id == id);
    }
}
