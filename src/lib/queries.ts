import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SchemeRow = Database["public"]["Tables"]["schemes"]["Row"];

// The Supabase REST API caps every response at 1000 rows, so page until exhausted.
async function fetchAllPublishedSchemes(): Promise<SchemeRow[]> {
  const pageSize = 1000;
  const rows: SchemeRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .eq("status", "published")
      .order("is_demo")
      .order("title")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

export const schemesQuery = queryOptions({
  queryKey: ["schemes"],
  queryFn: fetchAllPublishedSchemes,
});

export const schemeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["scheme", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("schemes").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const systemsQuery = queryOptions({
  queryKey: ["ai_systems"],
  queryFn: async () => {
    const { data, error } = await supabase.from("ai_systems").select("*, departments(name, level, state_name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const incidentsQuery = queryOptions({
  queryKey: ["incidents"],
  queryFn: async () => {
    const { data, error } = await supabase.from("incidents").select("*, ai_systems(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const departmentsQuery = queryOptions({
  queryKey: ["departments"],
  queryFn: async () => {
    const { data, error } = await supabase.from("departments").select("*").order("name");
    if (error) throw error;
    return data;
  },
});
