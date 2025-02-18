import { Calendar } from '@/components/ui/calendar';
import { PopoverContent } from '@/components/ui/popover';
import { ISelectedFilters, ITableFilter } from './types';
import { ColumnDef } from '@tanstack/react-table';
import { SensorData } from '@/types';
import { ChevronDown } from 'lucide-react';

export const sensorTableColumns: ColumnDef<SensorData>[] = [
  {
    accessorKey: 'id',
    header: 'id',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'sensorId',
    enableSorting: true,
    header: ({ column }) => {
      return (
        <div
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID Датчика
          <ChevronDown />
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue('sensorId')}</div>,
  },
  {
    accessorKey: 'value',
    enableSorting: true,
    header: ({ column }) => {
      return (
        <div
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Значение
          <ChevronDown />
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue('value')}</div>,
  },
  {
    accessorKey: 'timestamp',
    enableSorting: true,
    header: ({ column }) => {
      return (
        <div
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Дата и время
          <ChevronDown />
        </div>
      );
    },
    cell: ({ row }) => {
      const date = Date.parse(row.getValue('timestamp'));
      const formatted = new Date(date)
        .toLocaleString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        })
        .replace(',', '');
      return <div>{formatted}</div>;
    },
  },
];

export const sensorTableFilters = (
  selectedFilters: ISelectedFilters,
  setSelectedFilters: React.Dispatch<React.SetStateAction<ISelectedFilters>>
): ITableFilter[] => [
  {
    title: 'Дата с',
    content: () => (
      <>
        <PopoverContent className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedFilters.from ?? new Date()}
            onSelect={(date) => {
              setSelectedFilters((prev) => ({
                ...prev,
                from: date ?? prev.from,
              }));
            }}
          />
        </PopoverContent>
      </>
    ),
  },
  {
    title: 'Дата по',
    content: () => (
      <PopoverContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedFilters.to ?? new Date()}
          onSelect={(date) => {
            setSelectedFilters((prev) => ({
              ...prev,
              to: date ?? prev.to,
            }));
          }}
        />
      </PopoverContent>
    ),
  },
];
