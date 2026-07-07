import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRepair, useDeleteRepair, useUpdateRepair, REPAIR_STATUSES, STATUS_LABEL, type RepairStatus } from "@/hooks/use-repairs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PriorityBadge, StatusBadge } from "@/components/repairs/StatusBadge";
import { RepairPartsSection } from "@/components/repairs/RepairPartsSection";

export const Route = createFileRoute("/_authenticated/repairs/$repairId")({
  head: () => ({ meta: [{ title: "Repair — SRMMS" }] }),
  component: RepairDetail,
});

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function RepairDetail() {
  const { repairId } = Route.useParams();
  const navigate = useNavigate();
  const { data: repair, isLoading } = useRepair(repairId);
  const { hasAny } = useCurrentUser();
  const canEdit = hasAny(["Admin", "Receptionist", "Technician"]);
  const canDelete = hasAny(["Admin", "Receptionist"]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateRepair = useUpdateRepair();
  const deleteRepair = useDeleteRepair();

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!repair) return <div className="text-muted-foreground">Repair not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/repairs"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
        <div className="flex gap-2">
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link to="/repairs/$repairId/edit" params={{ repairId }}>
                <Pencil className="mr-2 h-4 w-4" />Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-muted-foreground">{repair.order_number}</div>
          <h1 className="text-2xl font-semibold tracking-tight">{repair.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={repair.status} />
            <PriorityBadge priority={repair.priority} />
          </div>
        </div>
        {canEdit && (
          <div className="w-56">
            <div className="mb-1 text-xs text-muted-foreground">Quick status change</div>
            <Select
              value={repair.status}
              onValueChange={(v) =>
                updateRepair.mutate(
                  { id: repair.id, patch: { status: v as RepairStatus } },
                  { onSuccess: () => toast.success("Status updated"), onError: (e) => toast.error(e.message) },
                )
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REPAIR_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Client" value={
              repair.client ? (
                <Link to="/clients/$clientId" params={{ clientId: repair.client.id }} className="hover:underline">
                  {repair.client.name}
                </Link>
              ) : null
            } />
            <InfoRow label="Machine" value={
              repair.machine ? (
                <Link to="/machines/$machineId" params={{ machineId: repair.machine.id }} className="hover:underline">
                  {[repair.machine.brand, repair.machine.model].filter(Boolean).join(" ") || "Machine"}
                </Link>
              ) : null
            } />
            <InfoRow label="Intake date" value={repair.intake_date} />
            <InfoRow label="Due date" value={repair.due_date} />
            <InfoRow label="Completed" value={repair.completed_at ? new Date(repair.completed_at).toLocaleString() : null} />
            <InfoRow label="Cost" value={repair.cost != null ? `€ ${Number(repair.cost).toFixed(2)}` : null} />
            {repair.description && (
              <div className="sm:col-span-2"><InfoRow label="Description" value={<p className="whitespace-pre-wrap">{repair.description}</p>} /></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Work log</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Diagnosis" value={repair.diagnosis ? <p className="whitespace-pre-wrap">{repair.diagnosis}</p> : null} />
            <InfoRow label="Resolution" value={repair.resolution ? <p className="whitespace-pre-wrap">{repair.resolution}</p> : null} />
          </CardContent>
        </Card>
      </div>

      <RepairPartsSection repairId={repair.id} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this repair?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete repair {repair.order_number}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteRepair.mutate(repair.id, {
                  onSuccess: () => { toast.success("Repair deleted"); navigate({ to: "/repairs" }); },
                  onError: (e) => toast.error(e.message),
                })
              }
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}