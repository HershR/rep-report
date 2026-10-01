export const nowUtc = (): string => new Date().toISOString();

export const createUuid = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

/**
 * Rows per multi-row INSERT. Comfortably under SQLite's bound-parameter limit
 * and the compound-select limit a long VALUES list can route through.
 */
export const INSERT_BATCH_ROWS = 80;

export function chunk<T>(rows: T[], size: number = INSERT_BATCH_ROWS): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    batches.push(rows.slice(index, index + size));
  }
  return batches;
}
