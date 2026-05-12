import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useSupabaseRealtime(table: string, queryKeys: string[]) {
  const queryClient = useQueryClient();
  const queryKeysString = JSON.stringify(queryKeys);

  useEffect(() => {
    const keys = JSON.parse(queryKeysString);
    const uniqueChannelId = `realtime-${table}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(uniqueChannelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: table },
        () => {
          keys.forEach((key: string) => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryKeysString, queryClient]);
}
