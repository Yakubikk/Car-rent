using car_rent_back.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace car_rent_back.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<Rental> Rentals => Set<Rental>();
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Схема для таблиц Identity
        builder.HasDefaultSchema("carsharing");
        
        // Настройка таблицы Cars
        builder.Entity<Car>(entity =>
        {
            entity.ToTable("cars");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Brand).IsRequired();
            entity.Property(e => e.Model).IsRequired();
            entity.Property(e => e.LicensePlate).IsRequired();
            entity.Property(e => e.PricePerHour).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PricePerDay).HasColumnType("decimal(18,2)");
        });
        
        // Настройка таблицы Rentals
        builder.Entity<Rental>(entity =>
        {
            entity.ToTable("rentals");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.TotalCost).HasColumnType("decimal(18,2)");
            
            // Отношения
            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(d => d.Car)
                .WithMany(p => p.Rentals)
                .HasForeignKey(d => d.CarId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
