import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { logger } from '../logger';
import { SensorEmulator } from '../sensor-emulator';

jest.mock('../logger');

describe('SensorEmulator', () => {
  let emulator: SensorEmulator;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    process.env.API_URL = 'http://example.com/api';
    emulator = new SensorEmulator();
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.reset();
  });

  test('generateRandomValue() возвращает число от 0 до 100', () => {
    const value = (emulator as any).generateRandomValue();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  test('sendSensorData() отправляет данные через axios', async () => {
    mockAxios.onPost(process.env.API_URL!).reply(200);

    const sensorId = 1;
    await (emulator as any).sendSensorData(sensorId);

    expect(mockAxios.history.post.length).toBe(1);
    const requestData = JSON.parse(mockAxios.history.post[0].data);
    expect(requestData).toHaveProperty('sensorId', sensorId);
    expect(requestData).toHaveProperty('value');
    expect(requestData).toHaveProperty('timestamp');
  });

  test('sendSensorData() логирует ошибку при неудачном запросе', async () => {
    mockAxios.onPost(process.env.API_URL!).reply(500);

    const sensorId = 2;
    await (emulator as any).sendSensorData(sensorId);

    expect(logger.error).toHaveBeenCalledWith(
      'Ошибка отправки данных',
      expect.objectContaining({
        data: expect.objectContaining({ sensorId }),
        error: expect.any(String),
      })
    );
  });

  test('start() запускает интервалы отправки данных', () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(emulator as any, 'sendSensorData').mockImplementation(jest.fn());

    emulator.start();

    jest.advanceTimersByTime(1000);
    expect(spy).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
  });
});
