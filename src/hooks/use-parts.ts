import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Part = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  unit_cost: number;
  unit_price: number;
  quantity_on_hand: number;
  reorder_level: number;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type PartInput = Omit<Part, "id" | "created_at" | "updated_at">;

export function useParts(filters?: { search?: string; lowStockOnly?: boolean }) {
  return useQuery({
    queryKey: ["parts", filters ?? {}],
    queryFn: async () => {
      let q = supabase.from("parts").select("*").order("name", { ascending: true });
      if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        q = q.or(`name.ilike.${s},sku.ilike.${s},category.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as Part[];
      if (filters?.lowStockOnly) rows = rows.filter((p) => p.quantity_on_hand <= p.reorder_level);
      return rows;
    },
  });
}

export function usePart(id: string | undefined) {
  return useQuery({
    queryKey: ["parts", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("parts").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Part | null;
    },
  });
}

export function useCreatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<PartInput> & { sku: string; name: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("parts")
        .insert({ ...input, created_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data as Part;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parts"] }),
  });
}

export function useUpdatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PartInput> }) => {
      const { data, error } = await supabase.from("parts").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data as Part;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["parts"] });
      qc.invalidateQueries({ queryKey: ["parts", "detail", v.id] });
    },
  });
}

export function useDeletePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parts").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parts"] }),
  });
}