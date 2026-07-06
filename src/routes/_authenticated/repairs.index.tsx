import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRepairs, REPAIR_STATUSES, STATUS_LABEL, type RepairStatus } from "@/hooks/use-repairs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PriorityBadge, StatusBadge } from "@/components/repairs/StatusBadge";

export const Route = createFileRoute("/_authenticated/repairs/")({
  head: () => ({ meta: [{ title: "Repairs — SRMMS" }] }),
  component: RepairsIndex,
});

function RepairsIndex() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RepairStatus | "all">("all");
  const { data: repairs, isLoading } = useRepairs({ status, search });
  const { hasAny } = useCurrentUser();
  const canCreate = hasAny(["Admin", "Receptionist"]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Repairs</h1>
          <p className="text-sm text-muted-foreground">All service orders and their status.</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/repairs/new"><Plus className="mr-2 h-4 w-4" />New repair</Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or title…"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as RepairStatus | "all")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {REPAIR_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Intake</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : !repairs || repairs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No repairs found.</TableCell></TableRow>
              ) : (
                repairs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/repairs/$repairId" params={{ repairId: r.id }} className="hover:underline">
                        {r.order_number}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to="/repairs/$repairId" params={{ repairId: r.id }} className="hover:underline">
                        {r.title}
                      </Link>
                    </TableCell>
                    <TableCell>{r.client?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.machine ? [r.machine.brand, r.machine.model].filter(Boolean).join(" ") || "Machine" : "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell><PriorityBadge priority={r.priority} /></TableCell>
                    <TableCell className="text-muted-foreground">{r.intake_date}</TableCell>
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