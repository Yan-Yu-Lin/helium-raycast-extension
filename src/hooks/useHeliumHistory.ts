import { useHeliumHistoryDB } from "../lib/database";
import { HeliumHistoryEntry } from "../lib/types";
import { handleError } from "../lib/utils";
import { useState, useEffect } from "react";

export function useHeliumHistory(searchText: string) {
  const [data, setData] = useState<HeliumHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use the database hook
  const { data: dbData, isLoading: dbLoading, error: dbError } = useHeliumHistoryDB(searchText);

  useEffect(() => {
    setData(dbData || []);
    setError(dbError ?? null);
    setIsLoading(dbLoading);

    if (dbError) {
      handleError(dbError, "getting history");
    }
  }, [dbData, dbLoading, dbError]);

  return {
    data,
    isLoading,
    error,
  };
}
