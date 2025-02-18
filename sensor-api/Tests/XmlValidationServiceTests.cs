using Moq;
using Xunit;
using sensor_api.Services;

namespace sensor_api.Tests;

public class XmlValidationServiceTests
{
    private readonly XmlValidationService _service;

    public XmlValidationServiceTests()
    {
        Mock<ILogger<XmlValidationService>> loggerMock = new();
        _service = new XmlValidationService(loggerMock.Object);
    }

    [Fact]
    public void ValidateXml_ValidXml_ReturnsTrue()
    {
        const string xml = """
                           <?xml version="1.0" encoding="UTF-8"?>
                                       <SensorReadings>
                                           <Reading>
                                               <SensorId>1</SensorId>
                                               <Value>42</Value>
                                               <Timestamp>2024-02-15T12:00:00Z</Timestamp>
                                           </Reading>
                                       </SensorReadings>
                           """;

        var result = _service.ValidateXml(xml, out var errors);

        Assert.True(result);
        Assert.Empty(errors);
    }

    [Fact]
    public void ValidateXml_InvalidXml_ReturnsFalse()
    {
        const string xml = """
                           <?xml version="1.0" encoding="UTF-8"?>
                                       <SensorReadings>
                                           <Reading>
                                               <SensorId>invalid</SensorId>
                                               <Value>42</Value>
                                               <Timestamp>2024-02-15T12:00:00Z</Timestamp>
                                           </Reading>
                                       </SensorReadings>
                           """;

        var result = _service.ValidateXml(xml, out var errors);

        Assert.False(result);
        Assert.NotEmpty(errors);
    }
}