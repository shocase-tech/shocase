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
      width: 1000,
      height: 700,
      backgroundColor: "#fafafa",
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
    const width = canvas.width || 1000;
    const height = canvas.height || 700;

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
    const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    iconSvg.setAttribute("width", "24");
    iconSvg.setAttribute("height", "24");
    iconSvg.setAttribute("viewBox", "0 0 24 24");
    iconSvg.setAttribute("fill", "none");
    iconSvg.setAttribute("stroke", element.color);
    iconSvg.setAttribute("stroke-width", "2");
    iconSvg.setAttribute("stroke-linecap", "round");
    iconSvg.setAttribute("stroke-linejoin", "round");

    // Create a temporary div to render the icon
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${element.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>`;
    
    // Get icon path from Lucide
    const iconElement = document.createElement("div");
    iconElement.style.position = "absolute";
    iconElement.style.left = "-9999px";
    document.body.appendChild(iconElement);
    
    // Create the group with circle background and text
    const group = new Group([], {
      left: 200,
      top: 150,
      selectable: true,
      hasControls: true,
    });

    // Background circle
    const bgCircle = new Path(
      `M ${element.size / 2} 0 
       A ${element.size / 2} ${element.size / 2} 0 0 1 ${element.size / 2} ${element.size}
       A ${element.size / 2} ${element.size / 2} 0 0 1 ${element.size / 2} 0 Z`,
      {
        fill: element.color + "20",
        stroke: element.color,
        strokeWidth: 2,
      }
    );

    // Icon path (centered)
    const iconPath = new Path(
      `M ${element.size / 2 - 6} ${element.size / 2 - 6} l 4 0 l 0 8 l -4 0 Z M ${element.size / 2 + 2} ${element.size / 2 - 6} l 4 0 l 0 8 l -4 0 Z`,
      {
        fill: element.color,
        stroke: element.color,
        strokeWidth: 1,
      }
    );

    // Label below
    const label = new FabricText(element.label, {
      fontSize: 11,
      fontFamily: "Inter, system-ui, sans-serif",
      fill: "#1e293b",
      fontWeight: "500",
      left: element.size / 2,
      top: element.size + 5,
      originX: "center",
    });

    group.add(bgCircle);
    group.add(iconPath);
    group.add(label);

    fabricCanvas.add(group);
    fabricCanvas.renderAll();
    
    document.body.removeChild(iconElement);
    toast.success(`Added ${element.label}`);
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#fafafa";
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
        <canvas ref={canvasRef} className="w-full rounded-lg shadow-lg bg-white" />
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
