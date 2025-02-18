using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sensor_api.Data;
using sensor_api.Models;
using sensor_api.Services;
using System.Xml;

namespace sensor_api.Controllers;

[ApiController]
[Route("api")]
[Produces("application/json")]
public class SensorController(
    ApplicationDbContext context,
    ILogger<SensorController> logger,
    XmlValidationService xmlValidationService)
    : ControllerBase
{
    /// <summary>
    /// Сохраняет данные датчика.
    /// </summary>
    /// <param name="data">Данные датчика для сохранения.</param>
    /// <returns>Результат операции сохранения.</returns>
    /// <response code="200">Данные успешно сохранены.</response>
    /// <response code="500">Внутренняя ошибка сервера.</response>
    [HttpPost("data")]
    public async Task<IActionResult> PostData(SensorData data)
    {
        try
        {
            context.SensorData.Add(data);
            await context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при сохранении данных датчика");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Получает данные датчиков в заданном диапазоне времени.
    /// </summary>
    /// <param name="from">Начальная дата и время.</param>
    /// <param name="to">Конечная дата и время.</param>
    /// <returns>Список данных датчиков.</returns>
    /// <response code="200">Данные успешно получены.</response>
    /// <response code="500">Внутренняя ошибка сервера.</response>
    [HttpGet("data")]
    public async Task<IActionResult> GetData([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        try
        {
            var query = context.SensorData.AsQueryable();

            if (from.HasValue)
                query = query.Where(d => d.Timestamp >= from.Value);

            if (to.HasValue)
                query = query.Where(d => d.Timestamp <= to.Value);

            var data = await query.OrderByDescending(d => d.Timestamp).ToListAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при получении данных датчиков");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Получает агрегированные данные по датчикам за заданный период.
    /// </summary>
    /// <param name="from">Начальная дата и время.</param>
    /// <param name="to">Конечная дата и время.</param>
    /// <returns>Агрегированные данные по датчикам.</returns>
    /// <response code="200">Агрегированные данные успешно получены.</response>
    /// <response code="500">Внутренняя ошибка сервера.</response>
    [HttpGet("sensors/summary")]
    public async Task<IActionResult> GetSummary([FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        try
        {
            var summary = await context.SensorData
                .Where(d => d.Timestamp >= from && d.Timestamp <= to)
                .GroupBy(d => d.SensorId)
                .Select(g => new
                {
                    SensorId = g.Key,
                    Average = g.Average(d => d.Value),
                    Maximum = g.Max(d => d.Value),
                    Minimum = g.Min(d => d.Value)
                })
                .ToListAsync();

            return Ok(summary);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при получении сводки по датчикам");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Загружает XML-файл с данными датчиков.
    /// </summary>
    /// <param name="file">XML файл с данными.</param>
    /// <returns>Результат загрузки.</returns>
    /// <response code="200">Файл успешно загружен.</response>
    /// <response code="400">Некорректный формат файла.</response>
    /// <response code="500">Внутренняя ошибка сервера.</response>
    [HttpPost("upload-xml")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadXml(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Файл не предоставлен");

        try
        {
            using var reader = new StreamReader(file.OpenReadStream());
            var content = await reader.ReadToEndAsync();

            if (!xmlValidationService.ValidateXml(content, out var errors))
            {
                return BadRequest(new { Errors = errors });
            }

            var sensorDataList = ParseXml(content);
            context.SensorData.AddRange(sensorDataList);
            await context.SaveChangesAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при загрузке XML файла");
            return StatusCode(500, "Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Парсит XML-контент и извлекает данные датчиков.
    /// </summary>
    /// <param name="content">XML-контент для парсинга.</param>
    /// <returns>Список данных датчиков, извлеченных из XML.</returns>
    private List<SensorData> ParseXml(string content)
    {
        var sensorDataList = new List<SensorData>();
        var document = new XmlDocument();
        document.LoadXml(content);

        var readings = document.GetElementsByTagName("Reading");
        foreach (XmlNode reading in readings)
        {
            var sensorIdNode = reading["SensorId"];
            var valueNode = reading["Value"];
            var timestampNode = reading["Timestamp"];

            if (sensorIdNode == null || valueNode == null || timestampNode == null)
            {
                logger.LogWarning("Некорректный формат XML: отсутствуют обязательные элементы SensorId, Value или Timestamp.");
                continue;
            }

            if (!int.TryParse(sensorIdNode.InnerText, out var sensorId))
            {
                logger.LogWarning($"Некорректное значение SensorId: {sensorIdNode.InnerText}");
                continue;
            }

            if (!int.TryParse(valueNode.InnerText, out var value))
            {
                logger.LogWarning($"Некорректное значение Value: {valueNode.InnerText}");
                continue;
            }

            if (!DateTime.TryParse(timestampNode.InnerText, out var timestamp))
            {
                logger.LogWarning($"Некорректное значение Timestamp: {timestampNode.InnerText}");
                continue;
            }

            timestamp = timestamp.ToUniversalTime();

            var sensorData = new SensorData
            {
                SensorId = sensorId,
                Value = value,
                Timestamp = timestamp
            };

            sensorDataList.Add(sensorData);
        }

        return sensorDataList;
    }
}