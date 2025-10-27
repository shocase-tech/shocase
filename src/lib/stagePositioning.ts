// Stage positioning utility for auto-placing elements on the stage plot canvas
// Canvas dimensions: ~1000x600px

export interface StageZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Define stage zones (coordinates for ~1000x600 canvas)
export const STAGE_ZONES = {
  upstageLeft: { x: 100, y: 80, width: 250, height: 150 },
  upstageCenter: { x: 375, y: 80, width: 250, height: 150 },
  upstageRight: { x: 650, y: 80, width: 250, height: 150 },
  midstageLeft: { x: 100, y: 250, width: 250, height: 150 },
  midstageCenter: { x: 375, y: 250, width: 250, height: 150 },
  midstageRight: { x: 650, y: 250, width: 250, height: 150 },
  downstageLeft: { x: 100, y: 420, width: 250, height: 120 },
  downstageCenter: { x: 375, y: 420, width: 250, height: 120 },
  downstageRight: { x: 650, y: 420, width: 250, height: 120 },
};

export type ZoneName = keyof typeof STAGE_ZONES;

// Get center point of a zone
export function getZoneCenter(zone: ZoneName): { x: number; y: number } {
  const z = STAGE_ZONES[zone];
  return {
    x: z.x + z.width / 2,
    y: z.y + z.height / 2,
  };
}

// Calculate position with offset from zone center
export function getPositionInZone(
  zone: ZoneName,
  offsetX: number = 0,
  offsetY: number = 0
): { x: number; y: number } {
  const center = getZoneCenter(zone);
  return {
    x: center.x + offsetX,
    y: center.y + offsetY,
  };
}

export interface BandMemberPosition {
  memberId: string;
  memberName: string;
  instruments: string[];
  zone: ZoneName;
  elements: Array<{
    type: string;
    x: number;
    y: number;
  }>;
}

// Determine the primary zone for a band member based on their instruments
export function determineMemberZone(
  instruments: string[],
  memberIndex: number,
  totalMembers: number
): ZoneName {
  const instLower = instruments.map((i) => i.toLowerCase()).join(" ");

  // Drummer always goes upstage center
  if (instLower.includes("drum") && !instLower.includes("machine")) {
    return "upstageCenter";
  }

  // Keyboards/Piano typically upstage left or right
  if (instLower.includes("keyboard") || instLower.includes("piano") || instLower.includes("synth")) {
    return totalMembers <= 3 ? "upstageLeft" : memberIndex % 2 === 0 ? "upstageLeft" : "upstageRight";
  }

  // DJ goes upstage center or midstage center
  if (instLower.includes("dj")) {
    return totalMembers <= 2 ? "midstageCenter" : "upstageCenter";
  }

  // Lead vocals (no other instruments) go downstage center
  if (instLower.includes("lead vocal") && instruments.length === 1) {
    return "downstageCenter";
  }

  // Guitarists typically go midstage left or right
  if (instLower.includes("guitar") && !instLower.includes("bass")) {
    return memberIndex % 2 === 0 ? "midstageLeft" : "midstageRight";
  }

  // Bass guitar typically midstage right
  if (instLower.includes("bass")) {
    return "midstageRight";
  }

  // Vocals with other instruments
  if (instLower.includes("vocal")) {
    // Distribute across downstage
    if (totalMembers <= 2) return "downstageCenter";
    if (memberIndex === 0) return "downstageLeft";
    if (memberIndex === 1) return "downstageCenter";
    return "downstageRight";
  }

  // Default: distribute across midstage
  if (memberIndex % 3 === 0) return "midstageLeft";
  if (memberIndex % 3 === 1) return "midstageCenter";
  return "midstageRight";
}

// Get element type from instrument name
export function getElementsForInstrument(instrument: string): string[] {
  const inst = instrument.toLowerCase();
  const elements: string[] = [];

  if (inst.includes("drum") && !inst.includes("machine")) {
    elements.push("Drums", "Riser", "Short Boom Mic Left", "Short Boom Mic Right");
  } else if (inst.includes("drum") && inst.includes("machine")) {
    elements.push("Drum Machine", "Stand");
  } else if (inst.includes("electric guitar") || (inst.includes("guitar") && !inst.includes("acoustic") && !inst.includes("bass"))) {
    elements.push("Guitar A", "Guitar Amp", "Pedal Board");
  } else if (inst.includes("acoustic guitar")) {
    elements.push("Guitar B", "DI Mono", "Guitar Stand");
  } else if (inst.includes("bass")) {
    elements.push("Bass Guitar", "Bass Amp", "DI Mono");
  } else if (inst.includes("keyboard") || inst.includes("piano")) {
    elements.push("Electric Piano", "Keyboard Stand", "DI Stereo");
  } else if (inst.includes("synth")) {
    elements.push("Synth", "Keyboard Stand", "DI Stereo");
  } else if (inst.includes("dj")) {
    elements.push("DJ Decks", "Laptop");
  } else if (inst.includes("lead vocal") && instrument.length < 20) {
    elements.push("Standing Mic");
  } else if (inst.includes("vocal")) {
    elements.push("Standing Mic");
  }

  return elements;
}

// Calculate positions for all elements for a band member
export function calculateMemberPositions(
  memberName: string,
  memberId: string,
  instruments: string[],
  zone: ZoneName,
  needsMonitor: boolean,
  personIcon: string // "Person A", "Person B", etc.
): BandMemberPosition {
  const center = getZoneCenter(zone);
  const elements: Array<{ type: string; x: number; y: number }> = [];

  // Add person icon at center
  elements.push({
    type: personIcon,
    x: center.x,
    y: center.y,
  });

  // Track offsets
  let leftOffset = -80;
  let rightOffset = 80;
  let backOffset = -60;
  let frontOffset = 50;

  // Add monitor if needed (slightly in front and to the side)
  if (needsMonitor) {
    elements.push({
      type: "Foldback Speaker",
      x: center.x + 40,
      y: center.y + frontOffset,
    });
    frontOffset += 40;
  }

  // Process each instrument
  instruments.forEach((instrument) => {
    const inst = instrument.toLowerCase();

    if (inst.includes("drum") && !inst.includes("machine")) {
      // Drums setup
      elements.push(
        { type: "Riser", x: center.x, y: center.y - 20 },
        { type: "Drums", x: center.x, y: center.y },
        { type: "Short Boom Mic Left", x: center.x - 60, y: center.y - 10 },
        { type: "Short Boom Mic Right", x: center.x + 60, y: center.y - 10 }
      );
    } else if (inst.includes("electric guitar") || (inst.includes("guitar") && !inst.includes("acoustic") && !inst.includes("bass"))) {
      // Electric guitar setup
      elements.push(
        { type: "Guitar A", x: center.x + leftOffset, y: center.y },
        { type: "Guitar Amp", x: center.x + backOffset, y: center.y },
        { type: "Pedal Board", x: center.x, y: center.y + frontOffset }
      );
      backOffset -= 40;
      leftOffset -= 30;
    } else if (inst.includes("acoustic guitar")) {
      elements.push(
        { type: "Guitar B", x: center.x + leftOffset, y: center.y },
        { type: "Guitar Stand", x: center.x + leftOffset - 30, y: center.y },
        { type: "DI Mono", x: center.x, y: center.y + frontOffset - 20 }
      );
      leftOffset -= 40;
    } else if (inst.includes("bass")) {
      elements.push(
        { type: "Bass Guitar", x: center.x + rightOffset, y: center.y },
        { type: "Bass Amp", x: center.x + backOffset, y: center.y },
        { type: "DI Mono", x: center.x, y: center.y + frontOffset - 20 }
      );
      backOffset -= 40;
    } else if (inst.includes("keyboard") || inst.includes("piano")) {
      elements.push(
        { type: "Electric Piano", x: center.x, y: center.y },
        { type: "Keyboard Stand", x: center.x, y: center.y + 5 },
        { type: "DI Stereo", x: center.x + rightOffset, y: center.y }
      );
      rightOffset += 50;
    } else if (inst.includes("synth")) {
      elements.push(
        { type: "Synth", x: center.x, y: center.y },
        { type: "Keyboard Stand", x: center.x, y: center.y + 5 },
        { type: "DI Stereo", x: center.x + rightOffset, y: center.y }
      );
      rightOffset += 50;
    } else if (inst.includes("dj")) {
      elements.push(
        { type: "DJ Decks", x: center.x, y: center.y },
        { type: "Laptop", x: center.x + 40, y: center.y }
      );
    } else if (inst.includes("vocal")) {
      // Add mic if they have vocals
      elements.push({
        type: "Standing Mic",
        x: center.x + 30,
        y: center.y + frontOffset + 20,
      });
    }
  });

  return {
    memberId,
    memberName,
    instruments,
    zone,
    elements,
  };
}

// Generate positions for all band members
export function generateStageLayout(
  members: Array<{
    id: string;
    name: string;
    instruments: string[];
    needsMonitor: boolean;
  }>
): BandMemberPosition[] {
  const positions: BandMemberPosition[] = [];
  const personIcons = ["Person A", "Person B", "Person C", "Person D", "Person E"];

  members.forEach((member, index) => {
    const zone = determineMemberZone(member.instruments, index, members.length);
    const personIcon = personIcons[index % personIcons.length];

    const memberPos = calculateMemberPositions(
      member.name,
      member.id,
      member.instruments,
      zone,
      member.needsMonitor,
      personIcon
    );

    positions.push(memberPos);
  });

  return positions;
}
