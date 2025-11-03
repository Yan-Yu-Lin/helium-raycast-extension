import { HeliumTab, HeliumHistoryEntry, SearchResult } from "./types";

export class SearchEngine {
  search(query: string, tabs: HeliumTab[], history: HeliumHistoryEntry[]): SearchResult[] {
    const normalizedQuery = query.trim().toLowerCase();
    const searchedTabs = normalizedQuery ? this.searchTabs(normalizedQuery, tabs) : tabs;

    // History is already filtered and sorted by SQL - use it directly
    // SQL does: word splitting, LIKE matching, ordering by last_visit_time, LIMIT 100
    const tabResults = searchedTabs.map((tab) => ({ type: "tab" as const, data: tab, score: 0 }));
    const historyResults = history.map((entry) => ({ type: "history" as const, data: entry, score: 0 }));

    // Tabs always come first, then history (already sorted by SQL)
    return [...tabResults, ...historyResults];
  }

  searchTabs(query: string, tabs: HeliumTab[]): HeliumTab[] {
    if (!query.trim()) {
      return tabs;
    }

    const lowerQuery = query.toLowerCase();
    return tabs.filter((tab) => {
      const title = tab.title?.toLowerCase() ?? "";
      const url = tab.url?.toLowerCase() ?? "";
      return title.includes(lowerQuery) || url.includes(lowerQuery);
    });
  }

  searchHistory(query: string, history: HeliumHistoryEntry[]): HeliumHistoryEntry[] {
    // History is already filtered by SQL - no need for Fuse.js
    // SQL handles word splitting, LIKE matching, and ordering
    return history;
  }
}

export const searchEngine = new SearchEngine();
