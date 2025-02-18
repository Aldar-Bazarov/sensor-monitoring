export interface ITableFilter {
  title: string;
  content: (data?: any) => React.ReactNode;
}

export interface ISelectedFilters {
  from: Date | null;
  to: Date | null;
}
