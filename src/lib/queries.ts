import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const schemesQuery = queryOptions({
  queryKey: ["schemes"],
  queryFn: async () => {
    const { data, error } = await supabase.from("schemes").select("*").eq("status", "published").order("is_demo").order("title");
    if (error) throw error;
    return data;
  },
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
