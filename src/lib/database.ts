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

    // Build safe SQL query
    const searchPattern = searchText.trim().replace(/'/g, "''"); // Basic SQL injection protection

    let query: string;
    if (searchText.trim()) {
      query = `
        SELECT 
          id,
          url,
          title,
          visit_count,
          last_visit_time,
          typed_count
        FROM urls
        WHERE (
          title LIKE '%${searchPattern}%' 
          OR url LIKE '%${searchPattern}%'
        )
        AND title != ''
        AND title != 'New Tab'
        ORDER BY last_visit_time DESC
        LIMIT ${limit}
      `;
    } else {
      query = `
        SELECT 
          id,
          url,
          title,
          visit_count,
          last_visit_time,
          typed_count
        FROM urls
        WHERE title != ''
        AND title != 'New Tab'
        ORDER BY last_visit_time DESC
        LIMIT ${limit}
      `;
    }

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
