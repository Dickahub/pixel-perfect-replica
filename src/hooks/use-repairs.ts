import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RepairStatus = "pending" | "in_progress" | "awaiting_parts" | "completed" | "cancelled";
export type RepairPriority = "low" | "normal" | "high" | "urgent";

export const REPAIR_STATUSES: RepairStatus[] = [
  "pending",
  "in_progress",
  "awaiting_parts",
  "completed",
  "cancelled",
];
export const REPAIR_PRIORITIES: RepairPriority[] = ["low", "normal", "high", "urgent"];

export const STATUS_LABEL: Record<RepairStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  awaiting_parts: "Awaiting parts",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITY_LABEL: Record<RepairPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export type Repair = {
  id: string;
  order_number: string;
  client_id: string;
  machine_id: string | null;
  title: string;
  description: string | null;
  status: RepairStatus;
  priority: RepairPriority;
  assigned_to: string | null;
  intake_date: string;
  due_date: string | null;
  completed_at: string | null;
  diagnosis: string | null;
  resolution: string | null;
  cost: number | null;
  created_at: string;
  updated_at: string;
};

export type RepairWithRelations = Repair & {
  client: { id: string; name: string } | null;
  machine: { id: string; brand: string | null; model: string | null; serial_number: string | null } | null;
};

export type RepairInput = Omit<Repair, "id" | "order_number" | "created_at" | "updated_at">;

export function useRepairs(filters?: { status?: RepairStatus | "all"; search?: string }) {
  return useQuery({
    queryKey: ["repairs", filters ?? {}],
    queryFn: async () => {
      let q = supabase
        .from("repairs")
        .select("*, client:clients(id,name), machine:machines(id,brand,model,serial_number)")
        .order("created_at", { ascending: false });
      if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status);
      if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        q = q.or(`order_number.ilike.${s},title.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as RepairWithRelations[];
    },
  });
}

export function useRepair(id: string | undefined) {
  return useQuery({
    queryKey: ["repairs", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repairs")
        .select("*, client:clients(id,name,phone,email), machine:machines(id,brand,model,serial_number,machine_type)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as (RepairWithRelations & { client: { id: string; name: string; phone: string | null; email: string | null } | null }) | null;
    },
  });
}

export function useCreateRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<RepairInput> & { client_id: string; title: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("repairs")
        .insert({ ...input, created_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data as Repair;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repairs"] }),
  });
}

export function useUpdateRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<RepairInput> }) => {
      const finalPatch = { ...patch };
      if (patch.status === "completed" && !patch.completed_at) {
        finalPatch.completed_at = new Date().toISOString();
      }
      const { data, error } = await supabase.from("repairs").update(finalPatch).eq("id", id).select().single();
      if (error) throw error;
      return data as Repair;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({ queryKey: ["repairs", "detail", v.id] });
    },
  });
}

export function useDeleteRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("repairs").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repairs"] }),
  });
}