import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Machine = {
  id: string;
  client_id: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  machine_type: string | null;
  year: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MachineInput = Omit<Machine, "id" | "created_at" | "updated_at">;

export function useClientMachines(clientId: string | undefined) {
  return useQuery({
    queryKey: ["machines", "by-client", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .eq("client_id", clientId!)
        .order("brand");
      if (error) throw error;
      return (data ?? []) as Machine[];
    },
  });
}

export function useMachine(id: string | undefined) {
  return useQuery({
    queryKey: ["machines", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machines")
        .select("*, client:clients(id,name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as (Machine & { client: { id: string; name: string } | null }) | null;
    },
  });
}

export function useCreateMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<MachineInput> & { client_id: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("machines")
        .insert({ ...input, created_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data as Machine;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["machines", "by-client", d.client_id] });
    },
  });
}

export function useUpdateMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<MachineInput> }) => {
      const { data, error } = await supabase.from("machines").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data as Machine;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["machines", "detail", d.id] });
      qc.invalidateQueries({ queryKey: ["machines", "by-client", d.client_id] });
    },
  });
}

export function useDeleteMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) throw error;
      return { id, clientId };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["machines", "by-client", r.clientId] });
    },
  });
}