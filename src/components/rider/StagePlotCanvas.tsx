import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Circle, Text, FabricObject, Line } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Download, Undo, Redo } from "lucide-react";
import { toast } from "sonner";

interface Props {
  data: any;
  onChange: (data: any) => void;
}

const STAGE_ELEMENTS = [
  { id: "mic", label: "🎤 Mic", color: "#4A90E2", width: 40, height: 40, shape: "circle" },
  { id: "guitar", label: "🎸 Guitar", color: "#E94B3C", width: 60, height: 80, shape: "rect" },
  { id: "bass", label: "🎸 Bass", color: "#8B4513", width: 60, height: 80, shape: "rect" },
  { id: "drums", label: "🥁 Drums", color: "#FFB800", width: 120, height: 100, shape: "rect" },
  { id: "keyboard", label: "🎹 Keyboard", color: "#9B59B6", width: 100, height: 60, shape: "rect" },
  { id: "amp", label: "🔊 Amp", color: "#2C3E50", width: 70, height: 70, shape: "rect" },
  { id: "monitor", label: "📢 Monitor", color: "#16A085", width: 50, height: 50, shape: "rect" },
  { id: "di-box", label: "📦 DI Box", color: "#7F8C8D", width: 40, height: 40, shape: "rect" },
  { id: "cable", label: "🔌 Cable", color: "#34495E", width: 100, height: 10, shape: "rect" },
  { id: "stage", label: "🎭 Stage Area", color: "transparent", width: 400, height: 300, shape: "rect", stroke: "#000" },
];

export default function StagePlotCanvas({ data, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Load saved canvas data if exists
    if (data?.canvasData) {
      canvas.loadFromJSON(data.canvasData, () => {
        canvas.renderAll();
      });
    }

    // Add grid background
    addGrid(canvas);

    setFabricCanvas(canvas);

    // Save state on object modifications
    canvas.on("object:modified", () => saveCanvasState(canvas));
    canvas.on("object:added", () => saveCanvasState(canvas));
    canvas.on("object:removed", () => saveCanvasState(canvas));

    return () => {
      canvas.dispose();
    };
  }, []);

  const addGrid = (canvas: FabricCanvas) => {
    const gridSize = 50;
    const width = canvas.width || 800;
    const height = canvas.height || 600;

    for (let i = 0; i < width / gridSize; i++) {
      canvas.add(
        new Line([i * gridSize, 0, i * gridSize, height], {
          stroke: "#f0f0f0",
          selectable: false,
          evented: false,
        })
      );
    }

    for (let i = 0; i < height / gridSize; i++) {
      canvas.add(
        new Line([0, i * gridSize, width, i * gridSize], {
          stroke: "#f0f0f0",
          selectable: false,
          evented: false,
        })
      );
    }
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

    let obj: FabricObject;

    if (element.shape === "circle") {
      obj = new Circle({
        radius: element.width / 2,
        fill: element.color,
        left: 100,
        top: 100,
      });
    } else {
      obj = new Rect({
        width: element.width,
        height: element.height,
        fill: element.color,
        stroke: element.stroke || "",
        strokeWidth: element.stroke ? 2 : 0,
        left: 100,
        top: 100,
      });
    }

    const text = new Text(element.label, {
      fontSize: 12,
      left: 100,
      top: 100 + element.height + 5,
      fontFamily: "Arial",
    });

    fabricCanvas.add(obj);
    fabricCanvas.add(text);
    fabricCanvas.renderAll();
    toast.success(`Added ${element.label}`);
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    addGrid(fabricCanvas);
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
    <div className="space-y-4">
      {/* Element Library */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">Drag Elements</h4>
        <div className="grid grid-cols-5 gap-2">
          {STAGE_ELEMENTS.map((element) => (
            <Button
              key={element.id}
              variant="outline"
              size="sm"
              onClick={() => addElement(element)}
              className="h-auto py-2 flex flex-col items-center gap-1 text-xs"
            >
              <span>{element.label.split(" ")[0]}</span>
              <span className="text-[10px] text-muted-foreground">
                {element.label.split(" ").slice(1).join(" ")}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Canvas Controls */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= history.length - 1}>
          <Redo className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={deleteSelected}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Selected
        </Button>
        <Button variant="outline" size="sm" onClick={downloadCanvas}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button variant="destructive" size="sm" onClick={clearCanvas}>
          Clear Canvas
        </Button>
      </div>

      {/* Canvas */}
      <Card className="p-4 overflow-auto">
        <canvas ref={canvasRef} className="border border-border rounded" />
      </Card>

      <p className="text-xs text-muted-foreground">
        Click elements to add them to the canvas. Drag to move, resize with corners. Select and delete unwanted items.
      </p>
    </div>
  );
}
