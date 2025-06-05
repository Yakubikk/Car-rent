using Microsoft.AspNetCore.Http;

namespace car_rent_back.DTOs;

public class AvatarDto
{
    // Если передается файл, то используется это свойство
    public IFormFile File { get; set; }
    
    // Если передается ссылка на внешний ресурс, то используется это свойство
    public string ExternalUrl { get; set; }
}
