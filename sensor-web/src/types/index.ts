export interface IMenuItem {
  icon: React.ReactNode;
  title: string;
  child: React.ReactNode;
}

export interface SensorData {
  id: number;
  sensorId: number;
  value: number;
  timestamp: string;
}
