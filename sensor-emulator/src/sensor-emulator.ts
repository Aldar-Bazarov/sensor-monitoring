import axios from 'axios';
import { logger } from './logger';
import { SensorData } from './types';

/**
 * Класс SensorEmulator эмулирует работу датчиков.
 * Он отправляет случайные данные на указанный API.
 */
export class SensorEmulator {
  private readonly sensorIds: number[] = [1, 2, 3];
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = process.env.API_URL || '';
    logger.info('Эмулятор датчиков инициализирован', { apiUrl: this.apiUrl });
  }

  /**
   * Генерирует случайное значение от 0 до 100.
   * @returns Случайное число
   */
  private generateRandomValue(): number {
    return Math.floor(Math.random() * 101);
  }

  /**
   * Отправляет данные датчика на API.
   * @param sensorId Идентификатор датчика
   */
  private async sendSensorData(sensorId: number): Promise<void> {
    const data: SensorData = {
      sensorId,
      value: this.generateRandomValue(),
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post(this.apiUrl, data);
      logger.info('Данные успешно отправлены', data);
    } catch (error) {
      logger.error('Ошибка отправки данных', {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Запускает эмуляцию датчиков, отправляя данные с интервалом.
   */
  public start(): void {
    this.sensorIds.forEach((sensorId) => {
      setInterval(() => {
        this.sendSensorData(sensorId);
      }, 1000);
    });

    logger.info('Эмулятор датчиков запущен', {
      sensorCount: this.sensorIds.length,
      sensorIds: this.sensorIds,
    });
  }
}
