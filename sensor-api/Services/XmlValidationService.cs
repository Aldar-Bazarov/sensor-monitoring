using System.Xml;
using System.Xml.Schema;

namespace sensor_api.Services;

public class XmlValidationService
{
    private readonly XmlSchemaSet _schemaSet;
    private readonly ILogger<XmlValidationService> _logger;

    /// <summary>
    /// Инициализирует новый экземпляр <see cref="XmlValidationService"/>.
    /// </summary>
    /// <param name="logger">Логгер для записи сообщений.</param>
    public XmlValidationService(ILogger<XmlValidationService> logger)
    {
        _logger = logger;
        _schemaSet = new XmlSchemaSet();

        try
        {
            using var schemaStream = File.OpenRead("Schemas/sensor-data.xsd");
            _schemaSet.Add(null, XmlReader.Create(schemaStream));
            _logger.LogInformation("Схема XML успешно загружена.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при загрузке схемы XML.");
            throw;
        }
    }

    /// <summary>
    /// Проверяет, соответствует ли указанный XML-контент заданной схеме.
    /// </summary>
    /// <param name="xmlContent">XML-контент для проверки.</param>
    /// <param name="errors">Список ошибок валидации.</param>
    /// <returns>True, если XML-контент валиден; иначе - false.</returns>
    public bool ValidateXml(string xmlContent, out List<string> errors)
    {
        errors = [];
        try
        {
            var document = new XmlDocument();
            document.LoadXml(xmlContent);
            _logger.LogInformation("XML-контент успешно загружен для валидации.");

            document.Schemas = _schemaSet;

            var localErrors = new List<string>();

            document.Validate((_, e) =>
            {
                if (e.Severity != XmlSeverityType.Error) return;
                localErrors.Add(e.Message);
                _logger.LogWarning("Ошибка валидации XML: {Message}", e.Message);
            });

            errors.AddRange(localErrors);

            var isValid = errors.Count == 0;
            _logger.LogInformation("Валидация XML завершена. Результат: {IsValid}", isValid);
            return isValid;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при валидации XML.");
            errors.Add(e.Message);
            return false;
        }
    }
}