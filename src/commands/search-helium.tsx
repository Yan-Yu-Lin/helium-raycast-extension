import { List, Icon } from "@raycast/api";
import { useState, useMemo } from "react";
import { useHeliumTabs } from "../hooks/useHeliumTabs";
import { useHeliumHistory } from "../hooks/useHeliumHistory";
import { TabListItem } from "../components/TabListItem";
import { HistoryListItem } from "../components/HistoryListItem";
import { searchEngine } from "../lib/search";
import { SearchResult, HeliumTab, HeliumHistoryEntry } from "../lib/types";

export default function SearchHelium() {
  const [searchText, setSearchText] = useState("");

  const { tabs, isLoading: isLoadingTabs, refresh } = useHeliumTabs();
  // Pass searchText to history hook - SQL will filter in database (top 100 results)
  const { data: history, isLoading: isLoadingHistory, error } = useHeliumHistory(searchText);

  const isLoading = isLoadingTabs || isLoadingHistory;

  // Combine tabs and history - history is already filtered by SQL
  const { tabResults, historyResults } = useMemo(() => {
    const results = searchEngine.search(searchText, tabs, history);
    const tabResults: SearchResult[] = [];
    const historyResults: SearchResult[] = [];

    results.forEach((result) => {
      if (result.type === "tab") {
        tabResults.push(result);
      } else {
        historyResults.push(result);
      }
    });

    return { tabResults, historyResults };
  }, [searchText, tabs, history]);

  const totalResults = tabResults.length + historyResults.length;

  if (error) {
    console.warn("History access error:", error);
    // Continue without history if there's an error
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search tabs and history in Helium..."
      searchText={searchText}
      filtering={false}
    >
      {totalResults === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No results found"
          description={searchText ? "Try a different search term" : "No tabs or history available"}
        />
      ) : (
        <>
          {/* Tabs Section */}
          {tabResults.length > 0 && (
            <List.Section
              title="Open Tabs"
              subtitle={`${tabResults.length} ${tabResults.length === 1 ? "tab" : "tabs"}`}
            >
              {tabResults.map((result) => (
                <TabListItem key={`tab-${result.data.id}`} tab={result.data as HeliumTab} onRefresh={refresh} />
              ))}
            </List.Section>
          )}

          {/* History Section */}
          {historyResults.length > 0 && (
            <List.Section
              title="History"
              subtitle={`${historyResults.length} ${historyResults.length === 1 ? "entry" : "entries"}`}
            >
              {historyResults.map((result) => (
                <HistoryListItem key={`history-${result.data.id}`} entry={result.data as HeliumHistoryEntry} />
              ))}
            </List.Section>
          )}
        </>
      )}
    </List>
  );
}
