import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InputRow {
  id: string;
  instrument: string;
  mic: string;
  notes: string;
}

interface Props {
  data: InputRow[];
  onChange: (data: InputRow[]) => void;
}

export default function InputListTable({ data, onChange }: Props) {
  const [rows, setRows] = useState<InputRow[]>(
    data.length > 0
      ? data
      : Array.from({ length: 8 }, (_, i) => ({
          id: crypto.randomUUID(),
          instrument: "",
          mic: "",
          notes: "",
        }))
  );

  const updateRow = (id: string, field: keyof InputRow, value: string) => {
    const updated = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setRows(updated);
    onChange(updated);
  };

  const addRow = () => {
    const newRow = {
      id: crypto.randomUUID(),
      instrument: "",
      mic: "",
      notes: "",
    };
    const updated = [...rows, newRow];
    setRows(updated);
    onChange(updated);
  };

  const deleteRow = (id: string) => {
    if (rows.length <= 1) return; // Keep at least one row
    const updated = rows.filter((row) => row.id !== id);
    setRows(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 font-semibold">Input</TableHead>
              <TableHead className="font-semibold">Instrument</TableHead>
              <TableHead className="font-semibold">Mic (preferred)</TableHead>
              <TableHead className="font-semibold">Notes</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm text-center">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Input
                    value={row.instrument}
                    onChange={(e) =>
                      updateRow(row.id, "instrument", e.target.value)
                    }
                    placeholder="e.g., Lead Vocals"
                    className="border-0 shadow-none focus-visible:ring-1"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.mic}
                    onChange={(e) => updateRow(row.id, "mic", e.target.value)}
                    placeholder="e.g., Shure SM58"
                    className="border-0 shadow-none focus-visible:ring-1"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.notes}
                    onChange={(e) => updateRow(row.id, "notes", e.target.value)}
                    placeholder="e.g., Marshall Amp (mic'd)"
                    className="border-0 shadow-none focus-visible:ring-1"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRow(row.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button
        onClick={addRow}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Row
      </Button>
    </div>
  );
}
