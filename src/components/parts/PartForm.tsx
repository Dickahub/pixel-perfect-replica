import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Part, PartInput } from "@/hooks/use-parts";

type Props = {
  initial?: Partial<Part>;
  submitting?: boolean;
  onSubmit: (values: Partial<PartInput> & { sku: string; name: string }) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function PartForm({ initial, submitting, onSubmit, onCancel, submitLabel = "Save" }: Props) {
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "unit");
  const [unitCost, setUnitCost] = useState(String(initial?.unit_cost ?? 0));
  const [unitPrice, setUnitPrice] = useState(String(initial?.unit_price ?? 0));
  const [qty, setQty] = useState(String(initial?.quantity_on_hand ?? 0));
  const [reorder, setReorder] = useState(String(initial?.reorder_level ?? 0));
  const [location, setLocation] = useState(initial?.location ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!sku.trim() || !name.trim()) return;
        onSubmit({
          sku: sku.trim(),
          name: name.trim(),
          description: description?.trim() || null,
          category: category?.trim() || null,
          unit: unit.trim() || "unit",
          unit_cost: Number(unitCost) || 0,
          unit_price: Number(unitPrice) || 0,
          quantity_on_hand: Number(qty) || 0,
          reorder_level: Number(reorder) || 0,
          location: location?.trim() || null,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" required value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. FLT-1024" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={2} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category ?? ""} onChange={(e) => setCategory(e.target.value)} placeholder="Filters, Belts, Motors…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unit, m, kg, box" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Unit cost</Label>
          <Input id="cost" type="number" step="0.01" min="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Unit price</Label>
          <Input id="price" type="number" step="0.01" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">Quantity on hand</Label>
          <Input id="qty" type="number" step="1" min="0" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reorder">Reorder level</Label>
          <Input id="reorder" type="number" step="1" min="0" value={reorder} onChange={(e) => setReorder(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location">Storage location</Label>
          <Input id="location" value={location ?? ""} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shelf A-3" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting || !sku.trim() || !name.trim()}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}