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
  const { data: history, isLoading: isLoadingHistory, error } = useHeliumHistory("", 100); // Increased limit for better unified search

  const isLoading = isLoadingTabs || isLoadingHistory;

  // Combine and search tabs and history with search text directly
  const searchResults = useMemo(() => {
    return searchEngine.search(searchText, tabs, history);
  }, [searchText, tabs, history]);

  // Group results by type
  const { tabResults, historyResults } = useMemo(() => {
    const tabResults: SearchResult[] = [];
    const historyResults: SearchResult[] = [];

    searchResults.forEach((result) => {
      if (result.type === "tab") {
        tabResults.push(result);
      } else {
        historyResults.push(result);
      }
    });

    return { tabResults, historyResults };
  }, [searchResults]);

  if (error) {
    console.warn("History access error:", error);
    // Continue without history if there's an error
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search tabs and history in Helium..."
      throttle
      searchText={searchText}
      filtering={false}
    >
      {searchResults.length === 0 && !isLoading ? (
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
