import { useSQL } from "@raycast/utils";
import { HeliumHistoryEntry } from "./types";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";

const HELIUM_HISTORY_PATH = join(homedir(), "Library", "Application Support", "net.imput.helium", "Default", "History");

export function getHeliumHistoryPath(): string {
  if (existsSync(HELIUM_HISTORY_PATH)) {
    return HELIUM_HISTORY_PATH;
  }
  throw new Error("Helium history database not found");
}

// React hook for accessing history with proper SQL integration
export function useHeliumHistoryDB(searchText: string, limit = 100) {
  try {
    const dbPath = getHeliumHistoryPath();

    // Build SQL-based search query (inspired by Arc extension)
    // Split search into words and create AND conditions for each
    const whereClause = searchText.trim()
      ? searchText
          .trim()
          .split(" ")
          .filter((word) => word.length > 0)
          .map((term) => {
            const escapedTerm = term.replace(/'/g, "''"); // SQL injection protection
            return `(url LIKE '%${escapedTerm}%' OR title LIKE '%${escapedTerm}%')`;
          })
          .join(" AND ")
      : undefined;

    const query = `
      SELECT
        id,
        url,
        title,
        visit_count,
        last_visit_time,
        typed_count
      FROM urls
      WHERE ${whereClause || "1=1"}
        AND title != ''
        AND title != 'New Tab'
      GROUP BY url
      ORDER BY last_visit_time DESC
      LIMIT ${limit}
    `;

    return useSQL<HeliumHistoryEntry>(dbPath, query);
  } catch (error) {
    console.warn("Failed to access Helium history database:", error);
    // Return a mock useSQL result for error cases
    return {
      data: [],
      isLoading: false,
      error: error as Error,
    };
  }
}
