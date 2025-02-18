import { ChartConfig } from '@/components/ui/chart';
import { AveragedData } from './types';
import { SensorData } from '@/types';

export const groupByDate = (data: SensorData[]) => {
  return data.reduce(
    (acc, { sensorId, value, timestamp }) => {
      const date = new Date(timestamp);
      const day = date.toISOString().split('T')[0];

      if (!acc[day]) {
        acc[day] = {};
      }

      if (!acc[day][sensorId]) {
        acc[day][sensorId] = [];
      }

      acc[day][sensorId].push(value);

      return acc;
    },
    {} as Record<string, Record<number, number[]>>
  );
};

export const calculateAverages = (groupedData: Record<string, Record<number, number[]>>) => {
  const result: AveragedData[] = [];

  for (const day in groupedData) {
    const dayData: AveragedData = { day };
    const sensors = groupedData[day];

    for (const sensorId in sensors) {
      const values = sensors[sensorId];
      const averageValue = values.reduce((sum, value) => sum + value, 0) / values.length;
      dayData[+sensorId] = averageValue;
    }

    result.push(dayData);
  }

  result.sort((a, b) => {
    const dateA = new Date(a.day);
    const dateB = new Date(b.day);
    return dateA.getTime() - dateB.getTime();
  });

  return result;
};

export const interpolateMissingDays = (averagedData: AveragedData[]) => {
  const result = [...averagedData];
  const allDays = new Set(averagedData.map(({ day }) => day));

  const minDate = new Date(Math.min(...averagedData.map(({ day }) => new Date(day).getTime())));
  const maxDate = new Date(Math.max(...averagedData.map(({ day }) => new Date(day).getTime())));

  const getDateRange = (start: Date, end: Date): string[] => {
    const dates: string[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const allPossibleDays = getDateRange(minDate, maxDate);
  allPossibleDays.forEach((day, index) => {
    if (!allDays.has(day)) {
      const previousDayData = result[index - 1];
      const nextDayData = result[index];

      const interpolatedData: AveragedData = { day };

      for (const sensorId in previousDayData) {
        if (sensorId !== 'day') {
          const previousValue = previousDayData[sensorId];
          const nextValue = nextDayData[sensorId];
          const interpolatedValue = previousValue + (nextValue - previousValue) / 1;
          interpolatedData[+sensorId] = interpolatedValue;
        }
      }

      result.splice(index, 0, interpolatedData);
    }
  });

  return result;
};

export const generateChartConfig = (averagedData: AveragedData[]): ChartConfig => {
  const chartConfig: ChartConfig = {};

  averagedData.forEach((data) => {
    Object.keys(data)
      .filter((key) => key !== 'day')
      .forEach((sensorId) => {
        const sensorIndex = Number(sensorId);

        if (!chartConfig[`${sensorIndex}`]) {
          chartConfig[`${sensorIndex}`] = {
            label: `Датчик ${sensorIndex}`,
            color: `hsl(var(--chart-${sensorIndex}))`,
          };
        }
      });
  });

  return chartConfig;
};
