import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { sendFileToBackend } from '@/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const ExportXml: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleError = useErrorHandler();
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        await sendFileToBackend(formData);
        toast({ title: 'Файл успешно отправлен' });
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".xml"
        id="file-input"
        className="hidden"
        aria-label="Выберите XML файл для экспорта"
        disabled={isLoading}
        onChange={handleFileChange}
      />
      <LoadingSpinner loading={isLoading}>
        <Button asChild>
          <label htmlFor="file-input" className="cursor-pointer">
            {isLoading ? 'Отправка...' : 'Экспорт XML'}
          </label>
        </Button>
      </LoadingSpinner>
    </>
  );
};
