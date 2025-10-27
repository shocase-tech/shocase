import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
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
  onUndo?: () => void;
  onRedo?: () => void;
  onDeleteSelected?: () => void;
  onClear?: () => void;
  onDownload?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export interface StagePlotCanvasRef {
  addElement: (element: typeof STAGE_ELEMENTS[0]) => void;
  clearCanvas: () => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
  downloadCanvas: () => void;
}

export { STAGE_ELEMENTS };

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

const StagePlotCanvas = forwardRef<StagePlotCanvasRef, Props>(({ 
  data, 
  onChange,
  onUndo,
  onRedo,
  onDeleteSelected,
  onClear,
  onDownload,
  canUndo,
  canRedo,
}, ref) => {
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

    // Add keyboard event listener for Delete key
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && canvas.getActiveObjects().length > 0) {
        const activeObjects = canvas.getActiveObjects();
        activeObjects.forEach((obj) => {
          if (!(obj as any).isStageSetup) {
            canvas.remove(obj);
          }
        });
        canvas.discardActiveObject();
        canvas.renderAll();
        toast.success("Deleted selected elements");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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

    // Position labels
    const labelStyle = {
      fontSize: 14,
      fontFamily: "Inter, system-ui, sans-serif",
      fill: "#64748b",
      selectable: false,
      evented: false,
      fontWeight: "500",
    };

    // Swapped: "Upstage Right" on the left, "Upstage Left" on the right
    const upstageRight = new FabricText("Upstage Right", {
      ...labelStyle,
      left: 120,
      top: 30,
    });
    (upstageRight as any).isStageSetup = true;
    canvas.add(upstageRight);

    const upstageCenter = new FabricText("Upstage Center", {
      ...labelStyle,
      left: width / 2 - 60,
      top: 30,
    });
    (upstageCenter as any).isStageSetup = true;
    canvas.add(upstageCenter);

    const upstageLeft = new FabricText("Upstage Left", {
      ...labelStyle,
      left: width - 220,
      top: 30,
    });
    (upstageLeft as any).isStageSetup = true;
    canvas.add(upstageLeft);

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
    canvas.sendObjectToBack(upstageLeft);
    canvas.sendObjectToBack(upstageCenter);
    canvas.sendObjectToBack(upstageRight);
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
    await addElementToCanvas(element);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    addElement,
    clearCanvas,
    deleteSelected,
    undo,
    redo,
    downloadCanvas,
  }));

  const addElementToCanvas = async (element: typeof STAGE_ELEMENTS[0]) => {
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
    onClear?.();
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
    onDeleteSelected?.();
  };

  const undo = () => {
    if (historyStep > 0 && fabricCanvas) {
      setHistoryStep(historyStep - 1);
      fabricCanvas.loadFromJSON(history[historyStep - 1], () => {
        fabricCanvas.renderAll();
      });
      onUndo?.();
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1 && fabricCanvas) {
      setHistoryStep(historyStep + 1);
      fabricCanvas.loadFromJSON(history[historyStep + 1], () => {
        fabricCanvas.renderAll();
      });
      onRedo?.();
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
    onDownload?.();
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2">
      <canvas ref={canvasRef} className="rounded-lg shadow-lg border border-border w-full" />
    </Card>
  );
});

StagePlotCanvas.displayName = "StagePlotCanvas";

export default StagePlotCanvas;
