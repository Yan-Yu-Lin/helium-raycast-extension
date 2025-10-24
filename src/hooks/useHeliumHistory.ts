import { useHeliumHistoryDB } from "../lib/database";
import { HeliumHistoryEntry } from "../lib/types";
import { handleError } from "../lib/utils";
import { useState, useEffect } from "react";

export function useHeliumHistory(searchText: string, limit = 100) {
  const [data, setData] = useState<HeliumHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use the database hook
  const { data: dbData, isLoading: dbLoading, error: dbError } = useHeliumHistoryDB(searchText, limit);

  useEffect(() => {
    if (dbError) {
      handleError(dbError, "getting history");
      setError(dbError);
      setData([]);
      setIsLoading(false);
    } else {
      setData(dbData || []);
      setError(null);
      setIsLoading(dbLoading);
    }
  }, [dbData, dbLoading, dbError]);

  return {
    data,
    isLoading,
    error,
  };
}
