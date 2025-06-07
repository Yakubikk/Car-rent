using car_rent_back;
using car_rent_back.Data;
using car_rent_back.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Добавляем контекст базы данных для PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Регистрируем сервис IEmailSender
builder.Services.AddTransient<IEmailSender, NoOpEmailSender>();

// Настраиваем Identity с кастомной моделью пользователя и ролями
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Настраиваем авторизацию на основе ролей с использованием AddAuthorizationBuilder
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"))
    .AddPolicy("RequireManagerRole", policy => policy.RequireRole("Manager"))
    .AddPolicy("RequireManagerOrAdminRole", policy => policy.RequireRole("Manager", "Admin"))
    .AddPolicy("RequireUserRole", policy => policy.RequireRole("User"));

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Удаляем предыдущую конфигурацию SpaStaticFiles, так как она не требуется
// и заменяем на стандартную конфигурацию StaticFiles
builder.Services.AddDirectoryBrowser();

// Настраиваем CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddControllers();

// Добавляем SignalR
builder.Services.AddSignalR();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Создаем роли и администратора при первом запуске
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        
        // Создаем роли
        string[] roleNames = ["Admin", "Manager", "User", "Guest"];
        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
        
        // Создаем администратора, если его ещё нет
        const string adminEmail = "admin@carsharing.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "Admin",
                LastName = "User",
                PassportNumber = "1234567890",
                DriverLicense = "DL123456789",
                DriverLicenseIssueDate = DateTime.UtcNow.AddYears(-5),
                BirthDate = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                PhoneNumber = "1234567890",
                RegisterDate = DateTime.UtcNow,
                Address = "123 Admin Street, City, Country"
            };
            
            var result = await userManager.CreateAsync(admin, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ошибка при создании ролей и пользователей");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Car Rent API V1");
        options.RoutePrefix = string.Empty;
    }); 
}

// Используем CORS
app.UseCors("AllowAll");

// Используем статические файлы
app.UseStaticFiles();

// Настраиваем обслуживание файлов из директории wwwroot/avatars напрямую через URL /avatars
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(app.Environment.ContentRootPath, "wwwroot", "avatars")),
    RequestPath = "/avatars"
});

// Создаем директорию wwwroot/avatars, если она не существует
var avatarsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "avatars");
if (!Directory.Exists(avatarsPath))
{
    Directory.CreateDirectory(avatarsPath);
}

// Добавляем Identity эндпоинты
app.MapIdentityApi<ApplicationUser>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Добавляем маршрут для SignalR Hub
app.MapHub<RegistrationHub>("/registrationHub");

app.Run();
