export interface GuestRow {
  id: string;
  apto: string;
  originalName: string;
  formattedName: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  status: 'valid' | 'missing_apto' | 'missing_name';
  isCheckedIn?: boolean;
}

export interface RawExcelRow {
  [key: string]: any;
}

export interface ColumnMapping {
  aptoCol: string;
  nameCol: string;
  checkInCol: string;
  checkOutCol: string;
}

export interface ParseResult {
  rows: GuestRow[];
  headers: string[];
  mapping: ColumnMapping;
  fileName: string;
}

export interface PrintSettings {
  title: string;
  subtitle: string;
  groupName: string;
  columnsCount: 1 | 2 | 3;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  showBorders: boolean;
  showRowNumbers: boolean;
  showApartmentHeader: boolean; // Group guests under apartment headers or simple rows
  showCheckInStatus: boolean; // Display check-in status column / badge on print
  checkInFilter: 'all' | 'checked_in' | 'pending'; // Filter rows on print
  headerColor: string;
  customNotes: string;
  printDate: boolean;
}

export interface SavedList {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  fileName?: string;
  guests: GuestRow[];
  totalGuests: number;
  uniqueAptsCount: number;
  checkedInAptsCount?: number;
}

export interface ExcelParseSummary {
  fileName: string;
  totalRows: number;
  validRows: number;
  totalApts: number;
  unknownCols: string[];
}
