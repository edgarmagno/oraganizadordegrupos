/**
 * Reformats guest names from "SOBRENOME;NOME" or "SOBRENOME, NOME" or "SOBRENOME / NOME"
 * into "NOME SOBRENOME".
 */

export function reformatGuestName(
  rawName: string,
  casing: 'uppercase' | 'titlecase' = 'uppercase'
): string {
  if (!rawName) return '';

  let cleaned = rawName.trim().replace(/\s+/g, ' ');

  let resultName = '';

  // Check for common delimiters between Last Name and First Name
  if (cleaned.includes(';')) {
    const parts = cleaned.split(';').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      // parts[0] = SOBRENOME, parts[1] = NOME (or remaining)
      const lastName = parts[0];
      const firstName = parts.slice(1).join(' ');
      resultName = `${firstName} ${lastName}`;
    } else {
      resultName = parts[0] || '';
    }
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const lastName = parts[0];
      const firstName = parts.slice(1).join(' ');
      resultName = `${firstName} ${lastName}`;
    } else {
      resultName = parts[0] || '';
    }
  } else if (cleaned.includes(' / ')) {
    const parts = cleaned.split(' / ').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const lastName = parts[0];
      const firstName = parts.slice(1).join(' ');
      resultName = `${firstName} ${lastName}`;
    } else {
      resultName = parts[0] || '';
    }
  } else {
    // Already single string, no semicolon/comma/slash
    resultName = cleaned;
  }

  // Clean extra spaces
  resultName = resultName.trim().replace(/\s+/g, ' ');

  if (casing === 'uppercase') {
    return resultName.toUpperCase();
  } else if (casing === 'titlecase') {
    return toTitleCasePortuguese(resultName);
  }

  return resultName;
}

/**
 * Converts text to Portuguese Title Case respecting prepositions like de, da, do, dos, e.
 */
export function toTitleCasePortuguese(str: string): string {
  if (!str) return '';
  const lowercaseWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return '';
      if (index > 0 && lowercaseWords.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Natural sorting for apartment numbers (e.g., 1, 2, 10, 10A, 10B, 100, 101, 200, 1000)
 */
export function compareApartments(a: string, b: string): number {
  const cleanA = (a || '').toString().trim();
  const cleanB = (b || '').toString().trim();

  // Extract leading digits if any
  return cleanA.localeCompare(cleanB, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}
