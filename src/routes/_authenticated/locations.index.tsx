import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocations } from "@/hooks/use-locations";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/locations/")({
  head: () => ({ meta: [{ title: "Storage locations — SRMMS" }] }),
  component: LocationsIndex,
});

function LocationsIndex() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useLocations(search);
  const { hasAny } = useCurrentUser();
  const canCreate = hasAny(["Admin", "Technician"]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Storage locations</h1>
          <p className="text-sm text-muted-foreground">Warehouses, shelves and bins.</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/locations/new"><Plus className="mr-2 h-4 w-4" />New location</Link>
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or code…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="py-10 text-center text-muted-foreground">No locations yet.</TableCell></TableRow>
              ) : (
                data.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">
                      <Link to="/locations/$locationId" params={{ locationId: l.id }} className="inline-flex items-center gap-2 hover:underline">
                        <MapPin className="h-4 w-4 text-muted-foreground" />{l.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{l.code ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.description ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}