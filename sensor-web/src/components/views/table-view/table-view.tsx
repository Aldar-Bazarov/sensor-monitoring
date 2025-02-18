import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { Separator } from '../../ui/separator';
import { Popover, PopoverTrigger } from '../../ui/popover';
import { ISelectedFilters } from './types';
import { useEffect, useMemo, useState } from 'react';
import { sensorTableColumns, sensorTableFilters } from './properties';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { fetchSensorData } from '@/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const CURRENT_DATE = new Date();
export const DEFAULT_FILTERS = {
  from: new Date(1900, 0, 1),
  to: new Date(CURRENT_DATE.setDate(CURRENT_DATE.getDate() + 1)),
};

export const TableView = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedFilters, setSelectedFilters] = useState<ISelectedFilters>(DEFAULT_FILTERS);
  const errorHandler = useErrorHandler();

  const filters = sensorTableFilters(selectedFilters, setSelectedFilters);

  const {
    data: theData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sensorData', selectedFilters.from, selectedFilters.to],
    queryFn: () =>
      fetchSensorData({
        from: selectedFilters.from?.toISOString(),
        to: selectedFilters.to?.toISOString(),
      }),
    refetchInterval: 5000,
    enabled: !!selectedFilters.from && !!selectedFilters.to,
  });

  const data = useMemo(() => {
    console.log('theData', theData);
    if (theData !== undefined) toast({ title: 'Данные обновлены' });
    return Array.isArray(theData) ? theData : [];
  }, [theData]);

  const table = useReactTable({
    data: data,
    columns: sensorTableColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  useEffect(() => {
    if (error) errorHandler(error);
  }, [error]);

  const resetFilters = () => setSelectedFilters(DEFAULT_FILTERS);

  return (
    <div>
      <div className="flex items-center rounded-lg border bg-background w-fit mb-6">
        <Filter className="m-6" />
        <Separator orientation="vertical" className="h-20" />
        <span className="p-6">Фильтры</span>
        <Separator orientation="vertical" className="h-20" />
        {filters.map((filter) => (
          <Popover key={filter.title}>
            <PopoverTrigger asChild>
              <p className="flex w-fit items-center p-6 gap-4 cursor-pointer">
                {filter.title}
                <ChevronDown />
              </p>
            </PopoverTrigger>
            {filter.content(filter)}
            <Separator orientation="vertical" className="h-20" />
          </Popover>
        ))}
        <div
          className="flex w-fit items-center p-6 gap-2 cursor-pointer text-destructive"
          onClick={resetFilters}
        >
          <RotateCcw />
          Reset Filter
        </div>
      </div>
      <div className="rounded-md border">
        <LoadingSpinner loading={isLoading}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead className="px-8 py-4" key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="px-8 py-4" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={sensorTableColumns.length} className="h-24 text-center">
                    Нет данных
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </LoadingSpinner>
      </div>
      <div className="flex items-center justify-end py-4 space-x-2 lg:space-x-4">
        <p className="text-sm font-medium">Количество строк</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="flex w-fit items-center justify-center text-sm font-medium">
          Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
