import * as XLSX from 'xlsx';
import { ColumnMapping, GuestRow, RawExcelRow } from '../types';
import { compareApartments, reformatGuestName } from './nameFormatter';

export { compareApartments };

/**
 * Auto-detect column headers for Apt, Name, Check-In, Check-Out.
 * Uses header name keywords and sample row contents to prevent selecting status columns like "Confirmada".
 */
export function autoDetectColumns(
  headers: string[],
  sampleRows: RawExcelRow[] = []
): ColumnMapping {
  const normHeaders = headers.map((h) => (h || '').toString().toLowerCase().trim());

  let aptoCol = '';
  let nameCol = '';
  let checkInCol = '';
  let checkOutCol = '';

  // Keywords definitions
  const aptoKeywords = [
    'apto', 'apt', 'apartamento', 'quarto', 'uh', 'unidade', 'room',
    'habitação', 'habitacao', 'num', 'nº', 'no.', 'n.º', 'acomodacao',
    'acomodação', 'alocacao', 'alocação', 'flat', 'suite', 'suíte', 'nr', 'nr.'
  ];

  const statusKeywords = [
    'status', 'situacao', 'situação', 'confirmad', 'confirmada', 'confirmado',
    'pago', 'cancelad', 'estado', 'tipo', 'categoria'
  ];

  const checkInKeywords = [
    'chegada', 'dt.chegada', 'dt_chegada', 'dt chegada', 'data chegada',
    'checkin', 'check-in', 'entrada', 'dt.entrada', 'c/in', 'dt.in', 'in'
  ];

  const checkOutKeywords = [
    'partida', 'dt.partida', 'dt_partida', 'dt partida', 'data partida',
    'checkout', 'check-out', 'saida', 'saída', 'dt.saida', 'c/out', 'dt.out', 'out'
  ];

  const nameKeywords = [
    'hospede', 'hóspede', 'nome', 'guest', 'sobrenome', 'pax',
    'passageiro', 'cliente', 'titular', 'turista'
  ];

  const typeOrCategoryKeywords = [
    'tipo', 'categoria', 'perfil', 'status', 'situacao', 'situação',
    'funcao', 'função', 'regime', 'pensao', 'pensão', 'tarifa', 'faixa', 'idade'
  ];

  // Helper to test if a string matches any keyword
  const matchesAny = (str: string, keywords: string[]) =>
    keywords.some((kw) => str.includes(kw));

  // 1. First pass: Match Check-In and Check-Out explicitly
  headers.forEach((original, index) => {
    const h = normHeaders[index];

    // Check-in matching
    if (!checkInCol && matchesAny(h, checkInKeywords)) {
      checkInCol = original;
    }

    // Check-out matching
    if (!checkOutCol && matchesAny(h, checkOutKeywords)) {
      checkOutCol = original;
    }
  });

  // Priority search for Apt/UH column:
  // First check exact "uh", "u.h", "apto", "apt"
  for (let i = 0; i < headers.length; i++) {
    const h = normHeaders[i];
    if (h === 'uh' || h === 'u.h.' || h === 'u.h' || h === 'apto' || h === 'apt' || h === 'quarto' || h === 'apartamento') {
      aptoCol = headers[i];
      break;
    }
  }

  // If not exact match, check contains keywords (avoiding status keywords)
  if (!aptoCol) {
    headers.forEach((original, index) => {
      const h = normHeaders[index];
      if (!aptoCol && matchesAny(h, aptoKeywords) && !matchesAny(h, statusKeywords)) {
        aptoCol = original;
      }
    });
  }

  // 2. Intelligent Name Column Search:
  // We MUST avoid picking "Tipo Hóspede", "Tipo Pax", "Tipo de Hóspede", "Categoria", "Perfil", etc.
  let bestNameCol = '';
  let maxNameScore = -999;

  headers.forEach((original) => {
    const h = original.toLowerCase().trim();

    // Ignore columns already picked for Apt, Check-In, Check-Out
    if (original === aptoCol || original === checkInCol || original === checkOutCol) return;

    let score = 0;
    const isTypeOrCat = matchesAny(h, typeOrCategoryKeywords);

    // Exact name matches get massive boost
    if (
      h === 'hóspede' ||
      h === 'hospede' ||
      h === 'nome' ||
      h === 'nome do hóspede' ||
      h === 'nome do hospede' ||
      h === 'guest' ||
      h === 'guest name'
    ) {
      score += 100;
    } else if (
      h === 'pax' ||
      h === 'passageiro' ||
      h === 'passageiros' ||
      h === 'sobrenome;nome' ||
      h === 'sobrenome/nome' ||
      h === 'nome completo' ||
      h === 'cliente' ||
      h === 'titular'
    ) {
      score += 80;
    } else if (matchesAny(h, nameKeywords)) {
      score += 40;
    }

    // Penalize heavily if header contains "tipo", "categoria", "perfil", "status", etc.
    if (isTypeOrCat) {
      score -= 80;
    }

    // Inspect sample rows to verify if it looks like person names or guest types
    if (sampleRows.length > 0) {
      let containsGuestTypeValues = 0;
      let containsSpacesOrPunct = 0;
      const commonTypeValues = [
        'adulto', 'adult', 'chd', 'adt', 'criança', 'crianca',
        'infantil', 'titular', 'acompanhante', 'pagante', 'bebê',
        'bebe', 'isento', 'foc', 'f.o.c'
      ];

      const sampleCount = Math.min(sampleRows.length, 10);
      for (let i = 0; i < sampleCount; i++) {
        const val = String(sampleRows[i][original] ?? '').trim().toLowerCase();
        if (!val) continue;

        if (commonTypeValues.includes(val)) {
          containsGuestTypeValues++;
        }

        // Person names typically contain spaces, semicolons, commas or slashes
        if (val.includes(' ') || val.includes(';') || val.includes(',') || val.includes('/')) {
          containsSpacesOrPunct++;
        }
      }

      if (containsGuestTypeValues > 0) {
        score -= containsGuestTypeValues * 15;
      }

      score += containsSpacesOrPunct * 3;
    }

    if (score > maxNameScore) {
      maxNameScore = score;
      bestNameCol = original;
    }
  });

  if (bestNameCol && maxNameScore > -50) {
    nameCol = bestNameCol;
  }

  // 2. Second pass: Sample data inspection if aptoCol was not found or if picked candidate looks like a status column
  if (!aptoCol && sampleRows.length > 0) {
    let bestAptoCol = '';
    let maxAptoScore = -999;

    headers.forEach((header) => {
      const hNorm = header.toLowerCase();
      // Skip checkIn, checkOut, name cols if already identified
      if (header === checkInCol || header === checkOutCol || header === nameCol) return;

      let score = 0;

      if (matchesAny(hNorm, aptoKeywords)) score += 10;
      if (matchesAny(hNorm, statusKeywords)) score -= 20;

      // Inspect first 10 sample row values
      let nonStatusCount = 0;
      let numericOrAptoLikeCount = 0;
      const sampleCount = Math.min(sampleRows.length, 10);

      for (let i = 0; i < sampleCount; i++) {
        const val = String(sampleRows[i][header] ?? '').trim().toLowerCase();
        if (!val) continue;

        if (statusKeywords.some((sk) => val.includes(sk))) {
          score -= 5;
        } else {
          nonStatusCount++;
        }

        // Room numbers usually contain digits or room codes like 101, 204B, 12, A101
        if (/^\d+[a-z]?$/i.test(val) || /^[a-z]?\d+$/i.test(val) || /^\d+$/i.test(val)) {
          numericOrAptoLikeCount++;
        }
      }

      score += numericOrAptoLikeCount * 3;
      score += nonStatusCount * 1;

      if (score > maxAptoScore) {
        maxAptoScore = score;
        bestAptoCol = header;
      }
    });

    if (bestAptoCol && maxAptoScore > -10) {
      aptoCol = bestAptoCol;
    }
  }

  // Fallbacks if still unassigned (picking non-status columns first)
  const availableForFallback = headers.filter(
    (h) => !matchesAny(h.toLowerCase(), statusKeywords)
  );
  const fallbackList = availableForFallback.length > 0 ? availableForFallback : headers;

  if (!aptoCol && fallbackList.length > 0) aptoCol = fallbackList[0];
  if (!nameCol && fallbackList.length > 1) nameCol = fallbackList[1];
  if (!checkInCol && fallbackList.length > 2) checkInCol = fallbackList[2];
  if (!checkOutCol && fallbackList.length > 3) checkOutCol = fallbackList[3];

  return { aptoCol, nameCol, checkInCol, checkOutCol };
}

/**
 * Parses an Excel array buffer or File and extracts GuestRows sorted by Apt.
 */
export async function parseExcelFile(
  file: File,
  customMapping?: Partial<ColumnMapping>,
  nameCasing: 'uppercase' | 'titlecase' = 'uppercase'
): Promise<{
  rows: GuestRow[];
  headers: string[];
  mapping: ColumnMapping;
  fileName: string;
}> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawRows: RawExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });

  if (rawRows.length === 0) {
    return {
      rows: [],
      headers: [],
      mapping: { aptoCol: '', nameCol: '', checkInCol: '', checkOutCol: '' },
      fileName: file.name,
    };
  }

  // Get all header keys
  const headers = Object.keys(rawRows[0] || {});
  const autoMap = autoDetectColumns(headers, rawRows);

  const mapping: ColumnMapping = {
    aptoCol: customMapping?.aptoCol || autoMap.aptoCol,
    nameCol: customMapping?.nameCol || autoMap.nameCol,
    checkInCol: customMapping?.checkInCol || autoMap.checkInCol,
    checkOutCol: customMapping?.checkOutCol || autoMap.checkOutCol,
  };

  const rows: GuestRow[] = rawRows.map((rawRow, idx) => {
    const rawApto = String(rawRow[mapping.aptoCol] ?? '').trim();
    const rawName = String(rawRow[mapping.nameCol] ?? '').trim();
    const rawCheckIn = String(rawRow[mapping.checkInCol] ?? '').trim();
    const rawCheckOut = String(rawRow[mapping.checkOutCol] ?? '').trim();

    const formattedName = reformatGuestName(rawName, nameCasing);

    let status: GuestRow['status'] = 'valid';
    if (!rawApto) status = 'missing_apto';
    else if (!rawName) status = 'missing_name';

    let isCheckedIn = false;
    // Check if any status column indicates check-in already done
    for (const key of Object.keys(rawRow)) {
      const kNorm = key.toLowerCase();
      if (kNorm.includes('checkin') || kNorm.includes('check-in') || kNorm.includes('status') || kNorm.includes('situacao')) {
        const v = String(rawRow[key] ?? '').toLowerCase().trim();
        if (v === 'sim' || v === 'yes' || v === 'ok' || v === 'in' || v === 'checked in' || v === 'checked-in' || v === 'check-in ok' || v === 'checkin ok' || v === 'presente') {
          isCheckedIn = true;
          break;
        }
      }
    }

    return {
      id: `guest-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      apto: rawApto,
      originalName: rawName,
      formattedName: formattedName,
      checkIn: formatDateValue(rawCheckIn),
      checkOut: formatDateValue(rawCheckOut),
      status,
      isCheckedIn,
    };
  });

  // Filter out completely blank rows if both apto and name are empty
  const validOrPartialRows = rows.filter((r) => r.apto || r.originalName);

  // Sort by Apartment number (natural order), then by Guest Name
  validOrPartialRows.sort((a, b) => {
    const cmpApto = compareApartments(a.apto, b.apto);
    if (cmpApto !== 0) return cmpApto;
    return a.formattedName.localeCompare(b.formattedName);
  });

  return {
    rows: validOrPartialRows,
    headers,
    mapping,
    fileName: file.name,
  };
}

/**
 * Formats date values nicely if possible (e.g., 2026-08-04 or DD/MM/YYYY)
 */
function formatDateValue(val: string): string {
  if (!val) return '';
  // If date looks like ISO 2026-08-10T00:00:00.000Z
  if (val.includes('T')) {
    const dateObj = new Date(val);
    if (!isNaN(dateObj.getTime())) {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
  return val;
}

