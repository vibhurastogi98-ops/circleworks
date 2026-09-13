/**
 * Minimal RFC-4180 CSV parser. Handles:
 *   - quoted values with embedded commas and newlines
 *   - escaped double-quote inside quoted values ("")
 *   - CRLF and LF line endings
 * Does NOT handle:
 *   - alternate delimiters (semicolon, tab)
 *   - comment lines
 * Good enough for well-formed CSVs out of Excel / Sheets / CSV export tools.
 */

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const n = input.length;

  while (i < n) {
    const c = input[i];

    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\r") {
      // Consume optional \n as part of CRLF.
      if (input[i + 1] === "\n") i += 2; else i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }

  // Flush trailing field/row unless the input ended with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
