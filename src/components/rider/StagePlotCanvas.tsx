import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Group, Path, Text as FabricText, FabricObject, Line, FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Download, Undo, Redo } from "lucide-react";
import { toast } from "sonner";

// Import SVG assets
import StandingMicSVG from "@/assets/stage-equipment/Standing Mic.svg";
import GuitarAmpSVG from "@/assets/stage-equipment/Guitar Amp.svg";
import BassAmpSVG from "@/assets/stage-equipment/Bass Amp.svg";
import DrumsSVG from "@/assets/stage-equipment/Drums.svg";
import MIDIKeyboardSVG from "@/assets/stage-equipment/MIDI Keyboard.svg";
import ElectricPianoSVG from "@/assets/stage-equipment/Electric Piano.svg";
import SynthSVG from "@/assets/stage-equipment/Synth.svg";
import GuitarASVG from "@/assets/stage-equipment/Guitar A.svg";
import GuitarBSVG from "@/assets/stage-equipment/Guitar B.svg";
import BassGuitarSVG from "@/assets/stage-equipment/Bass Guitar.svg";
import FoldbackSpeakerSVG from "@/assets/stage-equipment/Foldback Speaker.svg";
import DJDecksSVG from "@/assets/stage-equipment/DJ Decks.svg";
import DrumMachineSVG from "@/assets/stage-equipment/Drum Machine.svg";
import PedalBoardSVG from "@/assets/stage-equipment/Pedal Board.svg";
import DIMonoSVG from "@/assets/stage-equipment/DI Mono.svg";
import DIStereoSVG from "@/assets/stage-equipment/DI Stereo.svg";
import BoomMicLeftSVG from "@/assets/stage-equipment/Boom Mic Left.svg";
import BoomMicRightSVG from "@/assets/stage-equipment/Boom Mic Right.svg";
import PersonASVG from "@/assets/stage-equipment/Person A.svg";
import PersonBSVG from "@/assets/stage-equipment/Person B.svg";
import PersonCSVG from "@/assets/stage-equipment/Person C.svg";
import LaptopSVG from "@/assets/stage-equipment/Laptop.svg";
import SoundcardSVG from "@/assets/stage-equipment/Soundcard.svg";
import RiserSVG from "@/assets/stage-equipment/Riser.svg";
import StandSVG from "@/assets/stage-equipment/Stand.svg";
import KeyboardStandSVG from "@/assets/stage-equipment/Keyboard Stand.svg";
import GuitarStandSVG from "@/assets/stage-equipment/Guitar Stand.svg";

interface Props {
  data: any;
  onChange: (data: any) => void;
}

const STAGE_ELEMENTS = [
  { id: "standing-mic", label: "Standing Mic", svg: StandingMicSVG, scale: 0.8 },
  { id: "boom-mic-left", label: "Boom Mic Left", svg: BoomMicLeftSVG, scale: 0.8 },
  { id: "boom-mic-right", label: "Boom Mic Right", svg: BoomMicRightSVG, scale: 0.8 },
  { id: "guitar-amp", label: "Guitar Amp", svg: GuitarAmpSVG, scale: 0.6 },
  { id: "bass-amp", label: "Bass Amp", svg: BassAmpSVG, scale: 0.6 },
  { id: "drums", label: "Drum Kit", svg: DrumsSVG, scale: 0.5 },
  { id: "midi-keyboard", label: "MIDI Keyboard", svg: MIDIKeyboardSVG, scale: 0.5 },
  { id: "electric-piano", label: "Electric Piano", svg: ElectricPianoSVG, scale: 0.5 },
  { id: "synth", label: "Synth", svg: SynthSVG, scale: 0.5 },
  { id: "guitar-a", label: "Guitar A", svg: GuitarASVG, scale: 0.6 },
  { id: "guitar-b", label: "Guitar B", svg: GuitarBSVG, scale: 0.6 },
  { id: "bass-guitar", label: "Bass Guitar", svg: BassGuitarSVG, scale: 0.6 },
  { id: "foldback-speaker", label: "Floor Monitor", svg: FoldbackSpeakerSVG, scale: 0.6 },
  { id: "dj-decks", label: "DJ Decks", svg: DJDecksSVG, scale: 0.5 },
  { id: "drum-machine", label: "Drum Machine", svg: DrumMachineSVG, scale: 0.6 },
  { id: "pedal-board", label: "Pedal Board", svg: PedalBoardSVG, scale: 0.7 },
  { id: "di-mono", label: "DI Box Mono", svg: DIMonoSVG, scale: 0.8 },
  { id: "di-stereo", label: "DI Box Stereo", svg: DIStereoSVG, scale: 0.8 },
  { id: "person-a", label: "Person A", svg: PersonASVG, scale: 0.5 },
  { id: "person-b", label: "Person B", svg: PersonBSVG, scale: 0.5 },
  { id: "person-c", label: "Person C", svg: PersonCSVG, scale: 0.5 },
  { id: "laptop", label: "Laptop", svg: LaptopSVG, scale: 0.7 },
  { id: "soundcard", label: "Audio Interface", svg: SoundcardSVG, scale: 0.6 },
  { id: "riser", label: "Riser", svg: RiserSVG, scale: 0.4 },
  { id: "stand", label: "Stand", svg: StandSVG, scale: 0.8 },
  { id: "keyboard-stand", label: "Keyboard Stand", svg: KeyboardStandSVG, scale: 0.5 },
  { id: "guitar-stand", label: "Guitar Stand", svg: GuitarStandSVG, scale: 0.7 },
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

  const addElement = async (element: typeof STAGE_ELEMENTS[0]) => {
    if (!fabricCanvas) return;

    try {
      // Load the SVG image
      const imgElement = await FabricImage.fromURL(element.svg, {
        crossOrigin: 'anonymous'
      });

      // Create a group to hold the image and label
      const group = new Group([], {
        left: 300 + Math.random() * 200,
        top: 150 + Math.random() * 200,
        selectable: true,
        hasControls: true,
      });

      // Scale the image
      imgElement.scale(element.scale);

      // Label below the image
      const imgWidth = (imgElement.width || 100) * element.scale;
      const imgHeight = (imgElement.height || 100) * element.scale;
      
      const label = new FabricText(element.label, {
        fontSize: 11,
        fontFamily: "Inter, system-ui, sans-serif",
        fill: "#1e293b",
        fontWeight: "600",
        left: imgWidth / 2,
        top: imgHeight + 5,
        originX: "center",
      });

      group.add(imgElement);
      group.add(label);

      fabricCanvas.add(group);
      fabricCanvas.renderAll();
      
      toast.success(`Added ${element.label}`);
    } catch (error) {
      console.error("Error loading SVG:", error);
      toast.error(`Failed to add ${element.label}`);
    }
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
            return (
              <Button
                key={element.id}
                variant="outline"
                size="lg"
                onClick={() => addElement(element)}
                className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform border-2 hover:border-primary"
              >
                <img src={element.svg} alt={element.label} className="w-10 h-10 object-contain" />
                <span className="text-xs font-medium text-center leading-tight">{element.label}</span>
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
