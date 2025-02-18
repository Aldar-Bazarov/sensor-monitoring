namespace sensor_api.Models;

/// <summary>
/// Данные датчика.
/// </summary>
public class SensorData
{
    /// <summary>
    /// Уникальный идентификатор данных датчика.
    /// </summary>
    public int Id { get; init; }

    /// <summary>
    /// Идентификатор датчика, к которому относятся данные.
    /// </summary>
    public int SensorId { get; init; }

    /// <summary>
    /// Значение, полученное от датчика.
    /// </summary>
    public int Value { get; init; }

    /// <summary>
    /// Временная метка, когда были получены данные.
    /// </summary>
    public DateTime Timestamp { get; init; }
}