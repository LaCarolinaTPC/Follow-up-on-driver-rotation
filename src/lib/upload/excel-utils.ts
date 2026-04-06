import * as XLSX from "xlsx";

export function parseSheet(
  data: ArrayBuffer | Uint8Array,
  sheetName?: string,
  headerRow = 1
): Record<string, unknown>[] {
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
  if (!sheet) throw new Error(`Hoja "${sheetName}" no encontrada`);
  return XLSX.utils.sheet_to_json(sheet, { range: headerRow - 1 });
}

export function excelDateToISO(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    if (d)
      return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(val).trim();
  if (s === "0000-00-00" || s === "00/00/0000" || s.startsWith("0000")) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const date = s.slice(0, 10);
    if (date < "1900-01-01") return null;
    return date;
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    const [d, m, y] = s.split("/");
    if (y === "0000") return null;
    return `${y}-${m}-${d}`;
  }
  return null;
}

export function toNum(val: unknown): number {
  if (val == null) return 0;
  const n = Number(String(val).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

export function toStr(val: unknown): string | null {
  if (val == null) return null;
  const s = String(val).trim();
  return s === "" || s === "None" ? null : s;
}

export function normalizeCedula(raw: unknown): string {
  return String(raw ?? "")
    .replace(/[.\s,-]/g, "")
    .trim();
}

export function findCol(
  row: Record<string, unknown>,
  ...keywords: string[]
): unknown {
  for (const key of Object.keys(row)) {
    const norm = key.toUpperCase().trim();
    for (const kw of keywords) {
      if (norm.includes(kw.toUpperCase())) return row[key];
    }
  }
  return null;
}
