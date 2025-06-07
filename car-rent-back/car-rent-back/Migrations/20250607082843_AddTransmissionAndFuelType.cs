using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace car_rent_back.Migrations
{
    /// <inheritdoc />
    public partial class AddTransmissionAndFuelType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FuelType",
                schema: "carsharing",
                table: "cars",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Transmission",
                schema: "carsharing",
                table: "cars",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FuelType",
                schema: "carsharing",
                table: "cars");

            migrationBuilder.DropColumn(
                name: "Transmission",
                schema: "carsharing",
                table: "cars");
        }
    }
}
