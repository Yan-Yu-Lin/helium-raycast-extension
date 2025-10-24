export interface HeliumTab {
  id: string;
  url: string;
  title: string;
  loading: boolean;
  windowId?: string;
  isActive?: boolean;
}

export interface HeliumHistoryEntry {
  id: number;
  url: string;
  title: string;
  visit_count: number;
  last_visit_time: number;
  typed_count: number;
}

export interface HeliumWindow {
  id: string;
  name: string;
  bounds: string;
  visible: boolean;
  minimized: boolean;
  activeTabIndex: number;
  tabs: HeliumTab[];
}

export interface SearchResult {
  type: "tab" | "history";
  score?: number;
  data: HeliumTab | HeliumHistoryEntry;
}

export interface BrowserIntegration {
  getTabs(): Promise<HeliumTab[]>;
  getHistory(): Promise<HeliumHistoryEntry[]>;
  switchToTab(tabId: string): Promise<void>;
  openUrl(url: string): Promise<void>;
  openInNewTab(url: string): Promise<void>;
}

export type IntegrationMethod = "applescript" | "database" | "basic";

export interface HeliumError extends Error {
  code?: string;
  recoverable?: boolean;
}
