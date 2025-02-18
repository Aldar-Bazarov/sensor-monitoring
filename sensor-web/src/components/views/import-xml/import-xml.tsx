import { FC, useState } from 'react';
import { SensorData } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { fetchSensorData } from '@/api';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useToast } from '@/hooks/use-toast';

export const ImportXML: FC = () => {
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleError = useErrorHandler();
  const { toast } = useToast();

  const fetchDataAndDownloadXML = async () => {
    try {
      setIsLoading(true);
      setDownloadProgress(0);
      const data = await fetchSensorData({ from: undefined, to: undefined, setDownloadProgress });
      setDownloadProgress(10);
      downloadXML(convertToXML(data), 'sensors-data.xml');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDownloadProgress(100);
      toast({ title: 'XML успешно импортирован' });
    } catch (error) {
      handleError(error);
    } finally {
      setTimeout(() => {
        setDownloadProgress(0);
        setIsLoading(false);
      }, 1000);
    }
  };

  const convertToXML = (data: SensorData[]): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<SensorReadings>\n';

    data.forEach((reading) => {
      xml += '    <Reading>\n';
      xml += `        <SensorId>${reading.sensorId}</SensorId>\n`;
      xml += `        <Value>${reading.value}</Value>\n`;
      xml += `        <Timestamp>${reading.timestamp}</Timestamp>\n`;
      xml += '    </Reading>\n';
    });

    xml += '</SensorReadings>';

    return xml;
  };

  const downloadXML = (xmlString: string, fileName: string): void => {
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-row items-center">
      <Progress
        value={downloadProgress}
        aria-label="Прогресс загрузки"
        className={`w-[200px] mr-10 transition-opacity duration-500 ${
          downloadProgress === 0 ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <Button onClick={fetchDataAndDownloadXML} disabled={isLoading} aria-busy={isLoading}>
        Импорт XML
      </Button>
    </div>
  );
};
