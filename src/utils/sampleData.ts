import * as XLSX from 'xlsx';
import { GuestRow } from '../types';
import { compareApartments, reformatGuestName } from './nameFormatter';

export const INITIAL_SAMPLE_GUESTS: Omit<GuestRow, 'id'>[] = [
  {
    apto: '101',
    originalName: 'SILVA; JOÃO CARLOS',
    formattedName: 'JOÃO CARLOS SILVA',
    checkIn: '10/08/2026',
    checkOut: '15/08/2026',
    status: 'valid',
    isCheckedIn: true,
  },
  {
    apto: '101',
    originalName: 'SILVA; MARIA FERNANDA',
    formattedName: 'MARIA FERNANDA SILVA',
    checkIn: '10/08/2026',
    checkOut: '15/08/2026',
    status: 'valid',
    isCheckedIn: true,
  },
  {
    apto: '102',
    originalName: 'SANTOS; PEDRO HENRIQUE DE',
    formattedName: 'PEDRO HENRIQUE DE SANTOS',
    checkIn: '10/08/2026',
    checkOut: '14/08/2026',
    status: 'valid',
    isCheckedIn: true,
  },
  {
    apto: '102',
    originalName: 'SANTOS; LUCIA HELENA',
    formattedName: 'LUCIA HELENA SANTOS',
    checkIn: '10/08/2026',
    checkOut: '14/08/2026',
    status: 'valid',
    isCheckedIn: true,
  },
  {
    apto: '103',
    originalName: 'OLIVEIRA; ROBERTO ALVES DE',
    formattedName: 'ROBERTO ALVES DE OLIVEIRA',
    checkIn: '11/08/2026',
    checkOut: '16/08/2026',
    status: 'valid',
    isCheckedIn: false,
  },
  {
    apto: '201',
    originalName: 'FERREIRA; ANA LUIZA',
    formattedName: 'ANA LUIZA FERREIRA',
    checkIn: '10/08/2026',
    checkOut: '15/08/2026',
    status: 'valid',
    isCheckedIn: false,
  },
  {
    apto: '201',
    originalName: 'FERREIRA; RODRIGO',
    formattedName: 'RODRIGO FERREIRA',
    checkIn: '10/08/2026',
    checkOut: '15/08/2026',
    status: 'valid',
    isCheckedIn: false,
  },
  {
    apto: '202',
    originalName: 'COSTA; GABRIELA BEATRIZ',
    formattedName: 'GABRIELA BEATRIZ COSTA',
    checkIn: '12/08/2026',
    checkOut: '17/08/2026',
    status: 'valid',
    isCheckedIn: false,
  },
  {
    apto: '202',
    originalName: 'COSTA; LUCAS MATHEUS',
    formattedName: 'LUCAS MATHEUS COSTA',
    checkIn: '12/08/2026',
    checkOut: '17/08/2026',
    status: 'valid',
    isCheckedIn: false,
  },
  {
    apto: '202',
    originalName: 'COSTA; FELIPE',
    formattedName: 'FELIPE COSTA',
    checkIn: '12/08/2026',
    checkOut: '17/08/2026',
    status: 'valid',
    isCheckedIn: false,
  },
  {
    apto: '301',
    originalName: 'MARTINS; CLAUDIA REGINA',
    formattedName: 'CLAUDIA REGINA MARTINS',
    checkIn: '10/08/2026',
    checkOut: '15/08/2026',
    status: 'valid',
    isCheckedIn: true,
  },
  {
    apto: '302',
    originalName: 'BARBOSA; EDUARDO HENRIQUE',
    formattedName: 'EDUARDO HENRIQUE BARBOSA',
    checkIn: '10/08/2026',
    checkOut: '15/08/2026',
    status: 'valid',
    isCheckedIn: false,
  },
];

export function getInitialGuestList(): GuestRow[] {
  const result = INITIAL_SAMPLE_GUESTS.map((item, idx) => ({
    ...item,
    id: `sample-${idx}-${Math.random().toString(36).substring(2, 6)}`,
  }));

  result.sort((a, b) => {
    const cmp = compareApartments(a.apto, b.apto);
    if (cmp !== 0) return cmp;
    return a.formattedName.localeCompare(b.formattedName);
  });

  return result;
}

/**
 * Downloads a sample Excel (.xlsx) file with typical input format.
 */
export function downloadSampleExcel() {
  const data = [
    {
      'Nº Apto': '101',
      'Hóspede (Sobrenome;Nome)': 'SILVA; JOÃO CARLOS',
      'Check-In': '10/08/2026',
      'Check-Out': '15/08/2026',
    },
    {
      'Nº Apto': '101',
      'Hóspede (Sobrenome;Nome)': 'SILVA; MARIA FERNANDA',
      'Check-In': '10/08/2026',
      'Check-Out': '15/08/2026',
    },
    {
      'Nº Apto': '102',
      'Hóspede (Sobrenome;Nome)': 'SANTOS; PEDRO HENRIQUE',
      'Check-In': '10/08/2026',
      'Check-Out': '14/08/2026',
    },
    {
      'Nº Apto': '102',
      'Hóspede (Sobrenome;Nome)': 'SANTOS; LUCIA HELENA',
      'Check-In': '10/08/2026',
      'Check-Out': '14/08/2026',
    },
    {
      'Nº Apto': '103',
      'Hóspede (Sobrenome;Nome)': 'OLIVEIRA; ROBERTO ALVES',
      'Check-In': '11/08/2026',
      'Check-Out': '16/08/2026',
    },
    {
      'Nº Apto': '201',
      'Hóspede (Sobrenome;Nome)': 'FERREIRA; ANA LUIZA',
      'Check-In': '10/08/2026',
      'Check-Out': '15/08/2026',
    },
    {
      'Nº Apto': '202',
      'Hóspede (Sobrenome;Nome)': 'COSTA; GABRIELA BEATRIZ',
      'Check-In': '12/08/2026',
      'Check-Out': '17/08/2026',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Grupo');

  // Auto column widths
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.writeFile(workbook, 'Modelo_Lista_Hospedes_Grupo.xlsx');
}
