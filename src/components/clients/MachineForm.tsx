import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Machine, MachineInput } from "@/hooks/use-machines";

type Props = {
  clientId: string;
  initial?: Partial<Machine>;
  submitting?: boolean;
  onSubmit: (values: Partial<MachineInput> & { client_id: string }) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function MachineForm({ clientId, initial, submitting, onSubmit, onCancel, submitLabel = "Save" }: Props) {
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [serial, setSerial] = useState(initial?.serial_number ?? "");
  const [type, setType] = useState(initial?.machine_type ?? "");
  const [year, setYear] = useState<string>(initial?.year ? String(initial.year) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          client_id: clientId,
          brand: brand.trim() || null,
          model: model.trim() || null,
          serial_number: serial.trim() || null,
          machine_type: type.trim() || null,
          year: year.trim() ? Number(year) : null,
          notes: notes.trim() || null,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" value={brand ?? ""} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" value={model ?? ""} onChange={(e) => setModel(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serial">Serial number</Label>
          <Input id="serial" value={serial ?? ""} onChange={(e) => setSerial(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input id="type" value={type ?? ""} placeholder="e.g. CNC, Lathe, Press" onChange={(e) => setType(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" min={1900} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} value={notes ?? ""} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}