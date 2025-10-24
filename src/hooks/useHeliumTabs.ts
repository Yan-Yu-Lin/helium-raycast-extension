import { useCachedPromise } from "@raycast/utils";
import { heliumBrowser } from "../lib/helium";
import { HeliumTab } from "../lib/types";
import { handleError } from "../lib/utils";

export function useHeliumTabs() {
  const { data, isLoading, error, revalidate } = useCachedPromise(
    async (): Promise<HeliumTab[]> => {
      try {
        const isRunning = await heliumBrowser.isHeliumRunning();
        if (!isRunning) {
          throw new Error("Helium browser is not running");
        }

        return await heliumBrowser.getTabs();
      } catch (error) {
        await handleError(error, "getting tabs");
        return [];
      }
    },
    [],
    {
      keepPreviousData: true,
      initialData: [],
      // Optimized caching strategy for better performance
      // Cache for 30 seconds for better performance
    },
  );

  return {
    tabs: data || [],
    isLoading,
    error,
    refresh: revalidate,
  };
}
