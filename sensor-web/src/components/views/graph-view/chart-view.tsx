import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useEffect, useMemo, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useQuery } from '@tanstack/react-query';
import { fetchSensorData } from '@/api';
import {
  groupByDate,
  calculateAverages,
  interpolateMissingDays,
  generateChartConfig,
} from './private-utils';
import { toast } from '@/hooks/use-toast';

export const ChartView = () => {
  const errorHandler = useErrorHandler();
  const [chartConfig, setChartConfig] = useState<ChartConfig>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['sensorData'],
    queryFn: () => fetchSensorData({}),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (error) errorHandler(error);
  }, [error]);

  const chartData = useMemo(() => {
    if (data) {
      const groupedData = groupByDate(data);
      const averagedData = calculateAverages(groupedData);
      return interpolateMissingDays(averagedData);
    }
  }, [data]);

  useEffect(() => {
    if (chartData) {
      setChartConfig(generateChartConfig(chartData));
      toast({ title: 'Данные обновлены' });
    }
  }, [chartData]);

  return (
    <LoadingSpinner loading={isLoading}>
      <Card>
        <CardHeader>
          <CardTitle>Sensor Data Chart (Linear interpolation)</CardTitle>
          <CardDescription>{new Date().toString()}</CardDescription>
        </CardHeader>
        <CardContent>
          {chartConfig && chartData && (
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                {chartData.map((chart) => {
                  return Object.keys(chart).map((key) => {
                    if (key !== 'day') {
                      return (
                        <Line
                          key={key}
                          dataKey={key}
                          type="natural"
                          stroke={`var(--color-${key})`}
                          strokeWidth={2}
                          dot={false}
                        />
                      );
                    }
                    return null;
                  });
                })}
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </LoadingSpinner>
  );
};
