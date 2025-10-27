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
import GuitarCSVG from "@/assets/stage-equipment/Guitar C.svg";
import BassGuitarSVG from "@/assets/stage-equipment/Bass Guitar.svg";
import FoldbackSpeakerSVG from "@/assets/stage-equipment/Foldback Speaker.svg";
import FoldbackSpeakerLeftSVG from "@/assets/stage-equipment/Foldback Speaker Left.svg";
import FoldbackSpeakerRightSVG from "@/assets/stage-equipment/Foldback Speaker Right.svg";
import DJDecksSVG from "@/assets/stage-equipment/DJ Decks.svg";
import DrumMachineSVG from "@/assets/stage-equipment/Drum Machine.svg";
import PedalBoardSVG from "@/assets/stage-equipment/Pedal Board.svg";
import DIMonoSVG from "@/assets/stage-equipment/DI Mono.svg";
import DIStereoSVG from "@/assets/stage-equipment/DI Stereo.svg";
import BoomMicLeftSVG from "@/assets/stage-equipment/Boom Mic Left.svg";
import BoomMicRightSVG from "@/assets/stage-equipment/Boom Mic Right.svg";
import ShortBoomMicLeftSVG from "@/assets/stage-equipment/Short Boom Mic Left.svg";
import ShortBoomMicRightSVG from "@/assets/stage-equipment/Short Boom Mic Right.svg";
import ClampMicLeftSVG from "@/assets/stage-equipment/Clamp Mic Left.svg";
import ClampMicRightSVG from "@/assets/stage-equipment/Clamp Mic Right.svg";
import ClipMicLeftSVG from "@/assets/stage-equipment/Clip Mic Left.svg";
import ClipMicRightSVG from "@/assets/stage-equipment/Clip Mic Right.svg";
import PersonASVG from "@/assets/stage-equipment/Person A.svg";
import PersonBSVG from "@/assets/stage-equipment/Person B.svg";
import PersonCSVG from "@/assets/stage-equipment/Person C.svg";
import PersonDSVG from "@/assets/stage-equipment/Person D.svg";
import PersonESVG from "@/assets/stage-equipment/Person E.svg";
import LaptopSVG from "@/assets/stage-equipment/Laptop.svg";
import SoundcardSVG from "@/assets/stage-equipment/Soundcard.svg";
import RiserSVG from "@/assets/stage-equipment/Riser.svg";
import StandSVG from "@/assets/stage-equipment/Stand.svg";
import KeyboardStandSVG from "@/assets/stage-equipment/Keyboard Stand.svg";
import GuitarStandSVG from "@/assets/stage-equipment/Guitar Stand.svg";
import PowerDropSVG from "@/assets/stage-equipment/Power Drop.svg";
import SamplePadSVG from "@/assets/stage-equipment/Sample Pad.svg";

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
  addElement: (element: typeof STAGE_ELEMENTS[0], position?: { x: number; y: number }) => void;
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
  { id: "short-boom-mic-left", label: "Short Boom Mic Left", svg: ShortBoomMicLeftSVG, scale: 0.8 },
  { id: "short-boom-mic-right", label: "Short Boom Mic Right", svg: ShortBoomMicRightSVG, scale: 0.8 },
  { id: "clamp-mic-left", label: "Clamp Mic Left", svg: ClampMicLeftSVG, scale: 0.8 },
  { id: "clamp-mic-right", label: "Clamp Mic Right", svg: ClampMicRightSVG, scale: 0.8 },
  { id: "clip-mic-left", label: "Clip Mic Left", svg: ClipMicLeftSVG, scale: 0.8 },
  { id: "clip-mic-right", label: "Clip Mic Right", svg: ClipMicRightSVG, scale: 0.8 },
  { id: "guitar-amp", label: "Guitar Amp", svg: GuitarAmpSVG, scale: 0.6 },
  { id: "bass-amp", label: "Bass Amp", svg: BassAmpSVG, scale: 0.6 },
  { id: "drums", label: "Drums", svg: DrumsSVG, scale: 0.5 },
  { id: "midi-keyboard", label: "MIDI Keyboard", svg: MIDIKeyboardSVG, scale: 0.5 },
  { id: "electric-piano", label: "Electric Piano", svg: ElectricPianoSVG, scale: 0.5 },
  { id: "synth", label: "Synth", svg: SynthSVG, scale: 0.5 },
  { id: "guitar-a", label: "Guitar A", svg: GuitarASVG, scale: 0.6 },
  { id: "guitar-b", label: "Guitar B", svg: GuitarBSVG, scale: 0.6 },
  { id: "guitar-c", label: "Guitar C", svg: GuitarCSVG, scale: 0.6 },
  { id: "bass-guitar", label: "Bass Guitar", svg: BassGuitarSVG, scale: 0.6 },
  { id: "foldback-speaker", label: "Foldback Speaker", svg: FoldbackSpeakerSVG, scale: 0.6 },
  { id: "foldback-speaker-left", label: "Foldback Speaker Left", svg: FoldbackSpeakerLeftSVG, scale: 0.6 },
  { id: "foldback-speaker-right", label: "Foldback Speaker Right", svg: FoldbackSpeakerRightSVG, scale: 0.6 },
  { id: "dj-decks", label: "DJ Decks", svg: DJDecksSVG, scale: 0.5 },
  { id: "drum-machine", label: "Drum Machine", svg: DrumMachineSVG, scale: 0.6 },
  { id: "pedal-board", label: "Pedal Board", svg: PedalBoardSVG, scale: 0.7 },
  { id: "di-mono", label: "DI Mono", svg: DIMonoSVG, scale: 0.8 },
  { id: "di-stereo", label: "DI Stereo", svg: DIStereoSVG, scale: 0.8 },
  { id: "person-a", label: "Person A", svg: PersonASVG, scale: 0.5 },
  { id: "person-b", label: "Person B", svg: PersonBSVG, scale: 0.5 },
  { id: "person-c", label: "Person C", svg: PersonCSVG, scale: 0.5 },
  { id: "person-d", label: "Person D", svg: PersonDSVG, scale: 0.5 },
  { id: "person-e", label: "Person E", svg: PersonESVG, scale: 0.5 },
  { id: "laptop", label: "Laptop", svg: LaptopSVG, scale: 0.7 },
  { id: "soundcard", label: "Soundcard", svg: SoundcardSVG, scale: 0.6 },
  { id: "riser", label: "Riser", svg: RiserSVG, scale: 0.4 },
  { id: "stand", label: "Stand", svg: StandSVG, scale: 0.8 },
  { id: "keyboard-stand", label: "Keyboard Stand", svg: KeyboardStandSVG, scale: 0.5 },
  { id: "guitar-stand", label: "Guitar Stand", svg: GuitarStandSVG, scale: 0.7 },
  { id: "power-drop", label: "Power Drop", svg: PowerDropSVG, scale: 0.7 },
  { id: "sample-pad", label: "Sample Pad", svg: SamplePadSVG, scale: 0.6 },
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

  const addElement = async (element: typeof STAGE_ELEMENTS[0], position?: { x: number; y: number }) => {
    await addElementToCanvas(element, position);
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

  const addElementToCanvas = async (element: typeof STAGE_ELEMENTS[0], position?: { x: number; y: number }) => {
    if (!fabricCanvas) return;

    try {
      // Load the SVG image
      const imgElement = await FabricImage.fromURL(element.svg, {
        crossOrigin: 'anonymous'
      });

      // Scale and position the image
      imgElement.scale(element.scale);
      
      // Use provided position or default to random placement
      const left = position ? position.x : 300 + Math.random() * 200;
      const top = position ? position.y : 150 + Math.random() * 200;
      
      imgElement.set({
        left,
        top,
        selectable: true,
        hasControls: true,
      });

      fabricCanvas.add(imgElement);
      fabricCanvas.renderAll();
      
      if (!position) {
        toast.success(`Added ${element.label}`);
      }
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
