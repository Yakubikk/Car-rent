using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace car_rent_back.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                schema: "carsharing",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "carsharing",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                schema: "carsharing",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "carsharing",
                table: "AspNetUsers");
        }
    }
}
