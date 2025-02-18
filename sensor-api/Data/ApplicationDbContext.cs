using Microsoft.EntityFrameworkCore;
using sensor_api.Models;

namespace sensor_api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<SensorData> SensorData { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SensorData>();
    }
}