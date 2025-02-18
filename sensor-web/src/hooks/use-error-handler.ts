import { toast } from '@/hooks/use-toast';

export const useErrorHandler = () => {
  return (error: any, fallbackMessage = 'Произошла ошибка') => {
    let message = error instanceof Error ? error.message : fallbackMessage;
    toast({
      title: 'Ошибка',
      description: message,
      variant: 'destructive',
    });
  };
};
