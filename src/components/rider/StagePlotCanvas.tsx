import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Group, Path, Text as FabricText, FabricObject, Line } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Download, Undo, Redo, Mic, Guitar, Music, Disc3, Piano, Volume2, Speaker, Repeat, Cable, Square } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: any;
  onChange: (data: any) => void;
}

const STAGE_ELEMENTS = [
  { id: "mic", label: "Vocal Mic", icon: Mic, color: "#8b5cf6", size: 50 },
  { id: "guitar-amp", label: "Guitar Amp", icon: Volume2, color: "#ef4444", size: 60 },
  { id: "bass-amp", label: "Bass Amp", icon: Volume2, color: "#dc2626", size: 60 },
  { id: "drums", label: "Drum Kit", icon: Disc3, color: "#f59e0b", size: 80 },
  { id: "keyboard", label: "Keyboard", icon: Piano, color: "#a855f7", size: 70 },
  { id: "guitar", label: "Guitar", icon: Guitar, color: "#ec4899", size: 50 },
  { id: "bass", label: "Bass", icon: Music, color: "#be123c", size: 50 },
  { id: "monitor", label: "Floor Monitor", icon: Speaker, color: "#14b8a6", size: 45 },
  { id: "di-box", label: "DI Box", icon: Square, color: "#64748b", size: 35 },
  { id: "cable", label: "Cable Run", icon: Cable, color: "#475569", size: 40 },
];

export default function StagePlotCanvas({ data, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 900,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Add stage indicators and grid first
    addStageSetup(canvas);

    // Load saved canvas data if exists
    if (data?.canvasData) {
      canvas.loadFromJSON(data.canvasData, () => {
        // Re-add stage setup after loading
        addStageSetup(canvas);
        canvas.renderAll();
      });
    }

    setFabricCanvas(canvas);

    // Save state on object modifications
    canvas.on("object:modified", () => saveCanvasState(canvas));
    canvas.on("object:added", () => saveCanvasState(canvas));
    canvas.on("object:removed", () => saveCanvasState(canvas));

    return () => {
      canvas.dispose();
    };
  }, []);

  const addStageSetup = (canvas: FabricCanvas) => {
    const width = canvas.width || 900;
    const height = canvas.height || 600;

    // Remove existing stage setup elements
    canvas.getObjects().forEach(obj => {
      if ((obj as any).isStageSetup) {
        canvas.remove(obj);
      }
    });

    // Add subtle grid
    const gridSize = 40;
    for (let i = 0; i < width / gridSize; i++) {
      const line = new Line([i * gridSize, 0, i * gridSize, height], {
        stroke: "#e5e5e5",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      (line as any).isStageSetup = true;
      canvas.add(line);
    }

    for (let i = 0; i < height / gridSize; i++) {
      const line = new Line([0, i * gridSize, width, i * gridSize], {
        stroke: "#e5e5e5",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      (line as any).isStageSetup = true;
      canvas.add(line);
    }

    // Stage platform outline
    const stagePath = new Path(
      `M 150 ${height - 150} L ${width - 150} ${height - 150} L ${width - 100} ${height - 50} L 100 ${height - 50} Z`,
      {
        fill: "rgba(139, 92, 246, 0.05)",
        stroke: "#8b5cf6",
        strokeWidth: 3,
        selectable: false,
        evented: false,
      }
    );
    (stagePath as any).isStageSetup = true;
    canvas.add(stagePath);

    // Position labels
    const labelStyle = {
      fontSize: 14,
      fontFamily: "Inter, system-ui, sans-serif",
      fill: "#64748b",
      selectable: false,
      evented: false,
      fontWeight: "500",
    };

    const upstageLeft = new FabricText("Upstage Left", {
      ...labelStyle,
      left: 120,
      top: 30,
    });
    (upstageLeft as any).isStageSetup = true;
    canvas.add(upstageLeft);

    const upstageCenter = new FabricText("Upstage Center", {
      ...labelStyle,
      left: width / 2 - 60,
      top: 30,
    });
    (upstageCenter as any).isStageSetup = true;
    canvas.add(upstageCenter);

    const upstageRight = new FabricText("Upstage Right", {
      ...labelStyle,
      left: width - 220,
      top: 30,
    });
    (upstageRight as any).isStageSetup = true;
    canvas.add(upstageRight);

    const audience = new FabricText("Audience", {
      ...labelStyle,
      fontSize: 16,
      fontWeight: "600",
      left: width / 2 - 40,
      top: height - 25,
    });
    (audience as any).isStageSetup = true;
    canvas.add(audience);

    canvas.sendObjectToBack(audience);
    canvas.sendObjectToBack(upstageRight);
    canvas.sendObjectToBack(upstageCenter);
    canvas.sendObjectToBack(upstageLeft);
    canvas.sendObjectToBack(stagePath);
  };

  const saveCanvasState = (canvas: FabricCanvas) => {
    const json = JSON.stringify(canvas.toJSON());
    onChange({
      ...data,
      canvasData: json,
    });

    // Update history for undo/redo
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const addElement = (element: typeof STAGE_ELEMENTS[0]) => {
    if (!fabricCanvas) return;

    const Icon = element.icon;
    
    // Icon path mappings for each instrument/equipment type
    const iconPaths: Record<string, string> = {
      "mic": "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8",
      "guitar-amp": "M11 5v4M5 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5M14 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2 M21 15h-6 M18 12v6",
      "bass-amp": "M11 5v4M5 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5M14 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2 M21 15h-6 M18 12v6",
      "drums": "M12 2v20 M2 12h20",
      "keyboard": "M2 14h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z M6 10v4 M10 10v4 M14 10v4 M18 10v4",
      "guitar": "M8 12l-4-4 M16 4l4 4 M12 8l4 4-4 4-4-4 4-4z M7 17l-3 3",
      "bass": "M9 18V5l12-2v13 M9 9l12-2",
      "monitor": "M11 5L6 9l2 7 4-3-4-8z M13 5l5 4-2 7-4-3 4-8z",
      "di-box": "M3 3h18v18H3z M9 9h6v6H9z",
      "cable": "M8 12h8 M12 8v8"
    };

    const iconScale = element.size / 30;
    const scaledIconPath = iconPaths[element.id] || iconPaths["mic"];
    
    // Create the group
    const group = new Group([], {
      left: 300 + Math.random() * 200,
      top: 150 + Math.random() * 200,
      selectable: true,
      hasControls: true,
    });

    // Background circle
    const bgCircle = new Path(
      `M ${element.size / 2} 0 
       A ${element.size / 2} ${element.size / 2} 0 0 1 ${element.size / 2} ${element.size}
       A ${element.size / 2} ${element.size / 2} 0 0 1 ${element.size / 2} 0 Z`,
      {
        fill: element.color + "15",
        stroke: element.color,
        strokeWidth: 2.5,
      }
    );

    // Create icon using path
    const iconPath = new Path(scaledIconPath, {
      fill: "none",
      stroke: element.color,
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      scaleX: iconScale,
      scaleY: iconScale,
      left: element.size / 2 - 12 * iconScale,
      top: element.size / 2 - 12 * iconScale,
    });

    // Label below
    const label = new FabricText(element.label, {
      fontSize: 12,
      fontFamily: "Inter, system-ui, sans-serif",
      fill: "#1e293b",
      fontWeight: "600",
      left: element.size / 2,
      top: element.size + 8,
      originX: "center",
    });

    group.add(bgCircle);
    group.add(iconPath);
    group.add(label);

    fabricCanvas.add(group);
    fabricCanvas.renderAll();
    
    toast.success(`Added ${element.label}`);
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    addStageSetup(fabricCanvas);
    fabricCanvas.renderAll();
    onChange({ ...data, canvasData: null });
    toast.success("Canvas cleared");
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) {
      toast.error("No objects selected");
      return;
    }
    activeObjects.forEach((obj) => fabricCanvas.remove(obj));
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    toast.success("Deleted selected objects");
  };

  const undo = () => {
    if (historyStep > 0 && fabricCanvas) {
      setHistoryStep(historyStep - 1);
      fabricCanvas.loadFromJSON(history[historyStep - 1], () => {
        fabricCanvas.renderAll();
      });
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1 && fabricCanvas) {
      setHistoryStep(historyStep + 1);
      fabricCanvas.loadFromJSON(history[historyStep + 1], () => {
        fabricCanvas.renderAll();
      });
    }
  };

  const downloadCanvas = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.download = "stage-plot.png";
    link.href = dataURL;
    link.click();
    toast.success("Stage plot downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Canvas */}
      <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="rounded-lg shadow-lg border border-border" />
        </div>
      </Card>

      {/* Element Library */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Add Stage Elements</h4>
        <div className="grid grid-cols-5 gap-3">
          {STAGE_ELEMENTS.map((element) => {
            const Icon = element.icon;
            return (
              <Button
                key={element.id}
                variant="outline"
                size="lg"
                onClick={() => addElement(element)}
                className="h-auto py-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform border-2 hover:border-primary"
              >
                <Icon className="w-6 h-6" style={{ color: element.color }} />
                <span className="text-xs font-medium text-center">{element.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Canvas Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
          <Undo className="w-4 h-4 mr-1" />
          Undo
        </Button>
        <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= history.length - 1}>
          <Redo className="w-4 h-4 mr-1" />
          Redo
        </Button>
        <Button variant="outline" size="sm" onClick={deleteSelected}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete Selected
        </Button>
        <Button variant="outline" size="sm" onClick={downloadCanvas}>
          <Download className="w-4 h-4 mr-1" />
          Export as Image
        </Button>
        <Button variant="destructive" size="sm" onClick={clearCanvas} className="ml-auto">
          Clear All
        </Button>
      </div>

      <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
        Click elements above to add them to your stage plot. Drag to reposition, and use corners to resize. Select items and click "Delete Selected" to remove them.
      </p>
    </div>
  );
}
