import { AxiosError } from 'axios';
import { api } from '../infrastructure/axios';
import { SensorData } from '@/types';

interface FetchSensorDataRequest {
  from?: string;
  to?: string;
  setDownloadProgress?: React.Dispatch<React.SetStateAction<number>>;
}

export const fetchSensorData = async ({
  from,
  to,
  setDownloadProgress,
}: FetchSensorDataRequest): Promise<SensorData[]> => {
  try {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await api.get<SensorData[]>('/data', {
      params,
      onDownloadProgress(progressEvent) {
        if (setDownloadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Ошибка при получении данных:', error);
      throw new Error(error.response?.data.title || 'Произошла ошибка при получении данных');
    } else {
      console.error('Неизвестная ошибка:', error);
      throw new Error('Произошла неизвестная ошибка');
    }
  }
};

export const sendFileToBackend = async (formData: FormData) => {
  try {
    const response = await api.post('/upload-xml', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Ошибка при отправке файла:', error);
      throw new Error(error.response?.data.errors[0] || 'Произошла ошибка при отправке файла');
    } else {
      console.error('Неизвестная ошибка:', error);
      throw new Error('Произошла неизвестная ошибка');
    }
  }
};
