import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteLocation, useLocation } from "@/hooks/use-locations";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/locations/$locationId")({
  head: () => ({ meta: [{ title: "Location — SRMMS" }] }),
  component: LocationDetail,
});

function LocationDetail() {
  const { locationId } = Route.useParams();
  const navigate = useNavigate();
  const { data: l, isLoading } = useLocation(locationId);
  const del = useDeleteLocation();
  const { hasRole, hasAny } = useCurrentUser();

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!l) return <div className="text-muted-foreground">Location not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/locations"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
        <div className="flex gap-2">
          {hasAny(["Admin", "Technician"]) && (
            <Button asChild variant="outline" size="sm">
              <Link to="/locations/$locationId/edit" params={{ locationId }}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
            </Button>
          )}
          {hasRole("Admin") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!confirm("Delete this location?")) return;
                del.mutate(l.id, {
                  onSuccess: () => { toast.success("Location deleted"); navigate({ to: "/locations" }); },
                  onError: (e) => toast.error(e.message),
                });
              }}
            ><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{l.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Code:</span> <span className="font-mono">{l.code ?? "—"}</span></div>
          <div><span className="text-muted-foreground">Description:</span> {l.description ?? "—"}</div>
        </CardContent>
      </Card>
    </div>
  );
}