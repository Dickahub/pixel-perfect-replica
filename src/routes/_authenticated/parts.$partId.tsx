import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePart, useDeletePart } from "@/hooks/use-parts";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/parts/$partId")({
  head: () => ({ meta: [{ title: "Part — SRMMS" }] }),
  component: PartDetail,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function PartDetail() {
  const { partId } = Route.useParams();
  const navigate = useNavigate();
  const { data: part, isLoading } = usePart(partId);
  const { hasAny } = useCurrentUser();
  const canManage = hasAny(["Admin", "Receptionist"]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useDeletePart();

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!part) return <div className="text-muted-foreground">Part not found.</div>;
  const low = part.quantity_on_hand <= part.reorder_level;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/parts"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
        {canManage && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/parts/$partId/edit" params={{ partId }}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </Button>
          </div>
        )}
      </div>

      <div>
        <div className="font-mono text-xs text-muted-foreground">{part.sku}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{part.name}</h1>
        {low && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> Low stock — at or below reorder level
          </div>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Row label="Category" value={part.category} />
          <Row label="Unit" value={part.unit} />
          <Row label="Location" value={part.location} />
          <Row label="On hand" value={<span className={low ? "text-destructive font-semibold" : ""}>{part.quantity_on_hand} {part.unit}</span>} />
          <Row label="Reorder level" value={part.reorder_level} />
          <Row label="Unit cost" value={`€ ${Number(part.unit_cost).toFixed(2)}`} />
          <Row label="Unit price" value={`€ ${Number(part.unit_price).toFixed(2)}`} />
          {part.description && (
            <div className="sm:col-span-3"><Row label="Description" value={<p className="whitespace-pre-wrap">{part.description}</p>} /></div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this part?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {part.name}. Parts already used on repairs cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() =>
              del.mutate(part.id, {
                onSuccess: () => { toast.success("Part deleted"); navigate({ to: "/parts" }); },
                onError: (e) => toast.error(e.message),
              })
            }>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}