import * as THREE from 'three';
import { BusConfig } from '../types/game';

// Shared Materials Cache for High-Performance Rendering & Memory Efficiency
const MAT = {
  tire: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.1 }),
  rim: new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.3, metalness: 0.7 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x67e8f9, roughness: 0.1, transmission: 0.85, transparent: true, opacity: 0.65 }),
  mirror: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.05, metalness: 0.95 }),
  headlightLens: new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 }),
  headlightOff: new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.2 }),
  taillight: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.6 }),
  indicator: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.85 }),
  tinRoof: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.4 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }),
  bamboo: new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 }),
  brick: new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.9 }),
  bark: new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }),
  palmFoliage: new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8 }),
  water: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.8 }),
  interior: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }),
  seatCloth: new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.8 }),
  steelBumper: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 }),
};

/**
 * Creates full 3D Player Bus with exterior, wheels, glass, roof racks, and cabin interior
 */
export function createBusMesh(config: BusConfig): {
  group: THREE.Group;
  frontWheels: THREE.Group[];
  rearWheels: THREE.Group[];
  headlightsGroup: THREE.Group;
  cockpitAnchor: THREE.Object3D;
  destinationSign: THREE.Mesh;
} {
  const busGroup = new THREE.Group();
  busGroup.name = `bus_${config.id}`;

  const busWidth = 2.7;
  const busHeight = 3.3;
  const busLength = 9.8;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.color),
    roughness: 0.35,
    metalness: 0.2,
  });

  const secondaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.secondaryColor),
    roughness: 0.35,
    metalness: 0.2,
  });

  // 1. Lower Chassis / Floor
  const chassisGeo = new THREE.BoxGeometry(busWidth - 0.2, 0.4, busLength);
  const chassis = new THREE.Mesh(chassisGeo, MAT.tire);
  chassis.position.y = 0.55;
  busGroup.add(chassis);

  // 2. Main Bus Body Shell
  const bodyGeo = new THREE.BoxGeometry(busWidth, busHeight - 0.9, busLength);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 1.9;
  busGroup.add(bodyMesh);

  // 3. Side Decorative Racing/Cultural Stripes (Bangladeshi bus artwork aesthetic)
  const stripeGeo = new THREE.BoxGeometry(busWidth + 0.04, 0.4, busLength - 0.6);
  const stripeMesh = new THREE.Mesh(stripeGeo, secondaryMat);
  stripeMesh.position.y = 1.6;
  busGroup.add(stripeMesh);

  // Lower Skirt Stripe
  const lowerStripeGeo = new THREE.BoxGeometry(busWidth + 0.02, 0.25, busLength - 0.4);
  const lowerStripeMesh = new THREE.Mesh(lowerStripeGeo, secondaryMat);
  lowerStripeMesh.position.y = 0.95;
  busGroup.add(lowerStripeMesh);

  // 4. Roof Curved Cap
  const roofGeo = new THREE.BoxGeometry(busWidth - 0.1, 0.35, busLength - 0.1);
  const roofMesh = new THREE.Mesh(roofGeo, secondaryMat);
  roofMesh.position.y = 3.25;
  busGroup.add(roofMesh);

  // 5. Front Windshield (Angled & realistic)
  const windshieldGeo = new THREE.BoxGeometry(busWidth - 0.3, 1.25, 0.1);
  const windshield = new THREE.Mesh(windshieldGeo, MAT.glass);
  windshield.position.set(0, 2.2, busLength * 0.5 + 0.02);
  busGroup.add(windshield);

  // Rear Window
  const rearWindowGeo = new THREE.BoxGeometry(busWidth - 0.4, 0.9, 0.1);
  const rearWindow = new THREE.Mesh(rearWindowGeo, MAT.glass);
  rearWindow.position.set(0, 2.3, -busLength * 0.5 - 0.02);
  busGroup.add(rearWindow);

  // 6. Side Passenger Windows (Continuous Tinted Strip)
  const sideWindowLeftGeo = new THREE.BoxGeometry(0.1, 0.95, busLength - 2.2);
  const sideWindowLeft = new THREE.Mesh(sideWindowLeftGeo, MAT.glass);
  sideWindowLeft.position.set(busWidth * 0.5 + 0.02, 2.35, -0.4);
  busGroup.add(sideWindowLeft);

  const sideWindowRight = sideWindowLeft.clone();
  sideWindowRight.position.x = -busWidth * 0.5 - 0.02;
  busGroup.add(sideWindowRight);

  // 7. Destination Board above Windshield (e.g., "আমিনপুর ➔ পাবনা")
  const signGeo = new THREE.BoxGeometry(1.8, 0.45, 0.15);
  const signMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
  });
  const destinationSign = new THREE.Mesh(signGeo, signMat);
  destinationSign.position.set(0, 3.05, busLength * 0.5 + 0.04);
  busGroup.add(destinationSign);

  // 8. Front Radiator Grill and Heavy Steel Bumper
  const grillGeo = new THREE.BoxGeometry(1.8, 0.7, 0.15);
  const grill = new THREE.Mesh(grillGeo, MAT.chrome);
  grill.position.set(0, 1.15, busLength * 0.5 + 0.05);
  busGroup.add(grill);

  const bumperGeo = new THREE.BoxGeometry(busWidth + 0.1, 0.45, 0.35);
  const bumperMat = config.modelStyle === 'local' ? MAT.steelBumper : MAT.chrome;
  const bumper = new THREE.Mesh(bumperGeo, bumperMat);
  bumper.position.set(0, 0.65, busLength * 0.5 + 0.1);
  busGroup.add(bumper);

  // Rear Bumper
  const rearBumper = bumper.clone();
  rearBumper.position.set(0, 0.65, -busLength * 0.5 - 0.1);
  busGroup.add(rearBumper);

  // 9. Headlights and Taillights
  const headlightsGroup = new THREE.Group();

  const lightGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
  lightGeo.rotateX(Math.PI / 2);

  const leftHeadlight = new THREE.Mesh(lightGeo, MAT.headlightLens);
  leftHeadlight.position.set(1.05, 1.1, busLength * 0.5 + 0.08);
  headlightsGroup.add(leftHeadlight);

  const rightHeadlight = leftHeadlight.clone();
  rightHeadlight.position.x = -1.05;
  headlightsGroup.add(rightHeadlight);

  // Taillights
  const tailGeo = new THREE.BoxGeometry(0.3, 0.4, 0.1);
  const leftTail = new THREE.Mesh(tailGeo, MAT.taillight);
  leftTail.position.set(1.1, 1.2, -busLength * 0.5 - 0.06);
  busGroup.add(leftTail);

  const rightTail = leftTail.clone();
  rightTail.position.x = -1.1;
  busGroup.add(rightTail);

  busGroup.add(headlightsGroup);

  // 10. Wheels Setup
  const frontWheels: THREE.Group[] = [];
  const rearWheels: THREE.Group[] = [];

  const wheelZFront = busLength * 0.32;
  const wheelZRear = -busLength * 0.28;
  const wheelX = busWidth * 0.5;

  const createWheel = (isFront: boolean, isLeft: boolean) => {
    const wheelPivot = new THREE.Group();
    wheelPivot.position.set(isLeft ? wheelX : -wheelX, 0.55, isFront ? wheelZFront : wheelZRear);

    const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.38, 20);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, MAT.tire);

    const rimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.4, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, MAT.rim);

    tire.add(rim);
    wheelPivot.add(tire);
    busGroup.add(wheelPivot);

    if (isFront) frontWheels.push(wheelPivot);
    else rearWheels.push(wheelPivot);
  };

  createWheel(true, true);
  createWheel(true, false);
  createWheel(false, true);
  createWheel(false, false);

  // 11. Roof Luggage Carrier or AC Unit depending on style
  if (config.roofCarrier || config.modelStyle === 'local') {
    // Authentic Bangladeshi Local Bus Roof Carrier (ছাদের ক্যারিয়ার ও বস্তা/মালামাল)
    const rackGeo = new THREE.BoxGeometry(busWidth - 0.4, 0.3, busLength * 0.6);
    const rack = new THREE.Mesh(rackGeo, MAT.chrome);
    rack.position.set(0, 3.55, -0.2);
    busGroup.add(rack);

    // Colored luggage sacks / barrels on roof
    const sackColors = [0x0284c7, 0xd97706, 0x16a34a, 0xdc2626];
    for (let i = 0; i < 6; i++) {
      const sackGeo = new THREE.BoxGeometry(0.65, 0.4, 0.7);
      const sackMat = new THREE.MeshStandardMaterial({ color: sackColors[i % sackColors.length] });
      const sack = new THREE.Mesh(sackGeo, sackMat);
      sack.position.set((i % 2 === 0 ? 0.45 : -0.45), 3.85, -1.8 + Math.floor(i / 2) * 1.0);
      busGroup.add(sack);
    }

    // Rear Roof Access Ladder
    const ladderGeo = new THREE.BoxGeometry(0.4, 2.2, 0.1);
    const ladder = new THREE.Mesh(ladderGeo, MAT.chrome);
    ladder.position.set(0.9, 2.1, -busLength * 0.5 - 0.1);
    busGroup.add(ladder);
  } else {
    // Modern Intercity / Luxury AC Unit on Roof
    const acGeo = new THREE.BoxGeometry(1.6, 0.4, 3.2);
    const acMesh = new THREE.Mesh(acGeo, MAT.chrome);
    acMesh.position.set(0, 3.6, 0);
    busGroup.add(acMesh);
  }

  // 12. Cockpit Interior Anchor (Driver View)
  const cockpitAnchor = new THREE.Object3D();
  // In Bangladesh (right-hand drive / British legacy system), driver sits on RIGHT side!
  cockpitAnchor.position.set(-0.65, 2.2, busLength * 0.5 - 1.2);
  busGroup.add(cockpitAnchor);

  // Driver Steering Wheel & Dashboard inside
  const dashGeo = new THREE.BoxGeometry(busWidth - 0.4, 0.4, 0.8);
  const dash = new THREE.Mesh(dashGeo, MAT.interior);
  dash.position.set(0, 1.45, busLength * 0.5 - 0.8);
  busGroup.add(dash);

  const steerWheelGeo = new THREE.TorusGeometry(0.24, 0.04, 8, 20);
  const steerWheel = new THREE.Mesh(steerWheelGeo, MAT.interior);
  steerWheel.position.set(-0.65, 1.8, busLength * 0.5 - 0.85);
  steerWheel.rotation.x = Math.PI / 4;
  busGroup.add(steerWheel);

  return {
    group: busGroup,
    frontWheels,
    rearWheels,
    headlightsGroup,
    cockpitAnchor,
    destinationSign,
  };
}

/**
 * 3D Green CNG Auto-Rickshaw (সিএনজি অটো-রিকশা)
 * Iconic Bangladeshi 3-wheeler green body with black canvas hood and side grille
 */
export function createCngMesh(): THREE.Group {
  const cng = new THREE.Group();

  const cngGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
  const hoodBlackMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });

  // Body Base
  const bodyGeo = new THREE.BoxGeometry(1.4, 0.7, 2.6);
  const body = new THREE.Mesh(bodyGeo, cngGreenMat);
  body.position.y = 0.65;
  cng.add(body);

  // Yellow front bonnet accent
  const bonnetGeo = new THREE.BoxGeometry(1.2, 0.4, 0.7);
  const bonnet = new THREE.Mesh(bonnetGeo, yellowMat);
  bonnet.position.set(0, 0.7, 1.0);
  cng.add(bonnet);

  // Canvas Top Canopy
  const roofGeo = new THREE.BoxGeometry(1.35, 0.95, 2.0);
  const roof = new THREE.Mesh(roofGeo, hoodBlackMat);
  roof.position.set(0, 1.45, -0.2);
  cng.add(roof);

  // Front Windshield
  const glassGeo = new THREE.BoxGeometry(1.15, 0.65, 0.08);
  const glass = new THREE.Mesh(glassGeo, MAT.glass);
  glass.position.set(0, 1.35, 0.85);
  cng.add(glass);

  // Single Front Wheel & Two Rear Wheels
  const tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 14);
  tireGeo.rotateZ(Math.PI / 2);

  const frontWheel = new THREE.Mesh(tireGeo, MAT.tire);
  frontWheel.position.set(0, 0.3, 1.1);
  cng.add(frontWheel);

  const rearLeftWheel = new THREE.Mesh(tireGeo, MAT.tire);
  rearLeftWheel.position.set(0.65, 0.3, -0.8);
  cng.add(rearLeftWheel);

  const rearRightWheel = new THREE.Mesh(tireGeo, MAT.tire);
  rearRightWheel.position.set(-0.65, 0.3, -0.8);
  cng.add(rearRightWheel);

  // Headlight
  const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
  lightGeo.rotateX(Math.PI / 2);
  const light = new THREE.Mesh(lightGeo, MAT.headlightLens);
  light.position.set(0, 0.85, 1.35);
  cng.add(light);

  return cng;
}

/**
 * 3D Easy-Bike / Tom-Tom (ইজিবাইক / টমটম)
 */
export function createEasyBikeMesh(): THREE.Group {
  const bike = new THREE.Group();
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

  const bodyGeo = new THREE.BoxGeometry(1.3, 0.5, 2.5);
  const body = new THREE.Mesh(bodyGeo, blueMat);
  body.position.y = 0.55;
  bike.add(body);

  const roofGeo = new THREE.BoxGeometry(1.3, 0.85, 2.3);
  const roof = new THREE.Mesh(roofGeo, yellowMat);
  roof.position.set(0, 1.35, -0.1);
  bike.add(roof);

  const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 12);
  tireGeo.rotateZ(Math.PI / 2);
  const fw = new THREE.Mesh(tireGeo, MAT.tire);
  fw.position.set(0, 0.28, 1.0);
  bike.add(fw);

  const rw1 = new THREE.Mesh(tireGeo, MAT.tire);
  rw1.position.set(0.6, 0.28, -0.7);
  bike.add(rw1);

  const rw2 = new THREE.Mesh(tireGeo, MAT.tire);
  rw2.position.set(-0.6, 0.28, -0.7);
  bike.add(rw2);

  return bike;
}

/**
 * 3D Bangladeshi Rural Pickup / Chander Gari (চান্দের গাড়ি)
 */
export function createPickupTruckMesh(): THREE.Group {
  const truck = new THREE.Group();
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });

  // Cabin
  const cabGeo = new THREE.BoxGeometry(1.8, 1.4, 1.6);
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 1.2, 1.2);
  truck.add(cab);

  // Wooden Cargo Bed
  const bedGeo = new THREE.BoxGeometry(1.9, 0.7, 2.8);
  const bed = new THREE.Mesh(bedGeo, MAT.wood);
  bed.position.set(0, 0.9, -1.0);
  truck.add(bed);

  // 4 Wheels
  const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.25, 14);
  tireGeo.rotateZ(Math.PI / 2);

  [
    [0.9, 1.2],
    [-0.9, 1.2],
    [0.9, -1.2],
    [-0.9, -1.2],
  ].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(tireGeo, MAT.tire);
    wheel.position.set(x, 0.42, z);
    truck.add(wheel);
  });

  return truck;
}

/**
 * Bangladeshi Rural House (টিনের দোচালা বা চৌচালা ঘর)
 * Corrugated zinc/tin pitched roof, wooden veranda, clay plinth
 */
export function createRuralHouseMesh(): THREE.Group {
  const house = new THREE.Group();

  // Raised earthen plinth
  const plinthGeo = new THREE.BoxGeometry(7, 0.5, 6);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.25;
  house.add(plinth);

  // House Walls (bamboo woven/wood)
  const wallGeo = new THREE.BoxGeometry(5.8, 2.6, 4.8);
  const walls = new THREE.Mesh(wallGeo, MAT.bamboo);
  walls.position.y = 1.8;
  house.add(walls);

  // Front Veranda Pillars
  for (let x = -2.6; x <= 2.6; x += 2.6) {
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
    const post = new THREE.Mesh(postGeo, MAT.wood);
    post.position.set(x, 1.75, 2.7);
    house.add(post);
  }

  // Corrugated Pitch Tin Roof
  const roofGeo = new THREE.ConeGeometry(5.2, 1.8, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, MAT.tinRoof);
  roof.position.y = 3.8;
  house.add(roof);

  return house;
}

/**
 * Roadside Tea Stall / Tong Dokan (কালাম ভাইয়ের চায়ের টং)
 */
export function createTeaStallMesh(shopName: string = 'চা স্টল'): THREE.Group {
  const stall = new THREE.Group();

  // Wooden counter and shelf
  const counterGeo = new THREE.BoxGeometry(3.5, 1.1, 2.2);
  const counter = new THREE.Mesh(counterGeo, MAT.wood);
  counter.position.y = 0.55;
  stall.add(counter);

  // Slanted tin shed canopy
  const canopyGeo = new THREE.BoxGeometry(4.2, 0.15, 3.2);
  const canopy = new THREE.Mesh(canopyGeo, MAT.tinRoof);
  canopy.position.set(0, 2.5, 0.2);
  canopy.rotation.x = 0.12;
  stall.add(canopy);

  // Posts
  [
    [-1.8, 1.4],
    [1.8, 1.4],
  ].forEach(([x, z]) => {
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8);
    const post = new THREE.Mesh(postGeo, MAT.bamboo);
    post.position.set(x, 1.25, z);
    stall.add(post);
  });

  // Long wooden customer bench (টং বেঞ্চ)
  const benchGeo = new THREE.BoxGeometry(3.2, 0.45, 0.5);
  const bench = new THREE.Mesh(benchGeo, MAT.wood);
  bench.position.set(0, 0.25, 1.8);
  stall.add(bench);

  // Colorful signboard
  const signGeo = new THREE.BoxGeometry(2.8, 0.55, 0.05);
  const signMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 2.65, 1.55);
  stall.add(sign);

  return stall;
}

/**
 * Rural Mosque (মসজিদ) with central dome and corner minaret
 */
export function createMosqueMesh(): THREE.Group {
  const mosque = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 });

  // Main Prayer Hall
  const hallGeo = new THREE.BoxGeometry(10, 5, 10);
  const hall = new THREE.Mesh(hallGeo, whiteMat);
  hall.position.y = 2.5;
  mosque.add(hall);

  // Central Green Dome
  const domeGeo = new THREE.SphereGeometry(2.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, greenMat);
  dome.position.y = 5.0;
  mosque.add(dome);

  // Minaret Tower
  const minaretGeo = new THREE.CylinderGeometry(0.7, 0.9, 11, 12);
  const minaret = new THREE.Mesh(minaretGeo, whiteMat);
  minaret.position.set(4.2, 5.5, 4.2);
  mosque.add(minaret);

  const spireGeo = new THREE.ConeGeometry(0.8, 2.5, 12);
  const spire = new THREE.Mesh(spireGeo, greenMat);
  spire.position.set(4.2, 11.8, 4.2);
  mosque.add(spire);

  return mosque;
}

/**
 * Passenger Waiting Shed (যাত্রী ছাউনি) at bus stops
 */
export function createBusStopShedMesh(name: string): THREE.Group {
  const shed = new THREE.Group();

  // Floor pad
  const padGeo = new THREE.BoxGeometry(6, 0.2, 3.5);
  const pad = new THREE.Mesh(padGeo, MAT.concrete);
  pad.position.y = 0.1;
  shed.add(pad);

  // Curved or slanted roof canopy
  const roofGeo = new THREE.BoxGeometry(6.4, 0.15, 3.8);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 2.8, 0);
  shed.add(roof);

  // Support columns
  [
    [-2.6, -1.2],
    [2.6, -1.2],
    [-2.6, 1.2],
    [2.6, 1.2],
  ].forEach(([x, z]) => {
    const colGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.7, 8);
    const col = new THREE.Mesh(colGeo, MAT.chrome);
    col.position.set(x, 1.4, z);
    shed.add(col);
  });

  // Waiting bench
  const benchGeo = new THREE.BoxGeometry(4.8, 0.45, 0.6);
  const bench = new THREE.Mesh(benchGeo, MAT.wood);
  bench.position.set(0, 0.35, -0.8);
  shed.add(bench);

  // Prominent Bus Stop Sign Pole (বাস স্টপ)
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 8);
  const pole = new THREE.Mesh(poleGeo, MAT.chrome);
  pole.position.set(-3.2, 1.75, 1.5);
  shed.add(pole);

  const signGeo = new THREE.BoxGeometry(1.6, 0.7, 0.08);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(-3.2, 3.2, 1.5);
  shed.add(sign);

  return shed;
}

/**
 * Banyan Tree (বটগাছ) with lush leafy canopy
 */
export function createBanyanTreeMesh(): THREE.Group {
  const tree = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(1.1, 1.6, 4.5, 8);
  const trunk = new THREE.Mesh(trunkGeo, MAT.bark);
  trunk.position.y = 2.25;
  tree.add(trunk);

  // Broad spreading foliage puffs
  const puffGeo1 = new THREE.SphereGeometry(3.8, 8, 8);
  const puff1 = new THREE.Mesh(puffGeo1, MAT.foliage);
  puff1.position.set(0, 5.5, 0);
  puff1.scale.set(1.4, 0.8, 1.3);
  tree.add(puff1);

  const puffGeo2 = new THREE.SphereGeometry(2.8, 7, 7);
  const puff2 = new THREE.Mesh(puffGeo2, MAT.foliage);
  puff2.position.set(2.2, 5.2, 1.2);
  tree.add(puff2);

  const puff3 = new THREE.Mesh(puffGeo2, MAT.foliage);
  puff3.position.set(-2.2, 5.2, -1.2);
  tree.add(puff3);

  return tree;
}

/**
 * Coconut / Date Palm Tree (নারিকেল / খেজুর গাছ)
 */
export function createPalmTreeMesh(): THREE.Group {
  const palm = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 7.5, 7);
  const trunk = new THREE.Mesh(trunkGeo, MAT.bark);
  trunk.position.set(0, 3.75, 0);
  trunk.rotation.z = 0.08; // natural curve
  palm.add(trunk);

  // Crown Fronds
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const frondGeo = new THREE.BoxGeometry(0.4, 0.1, 2.6);
    const frond = new THREE.Mesh(frondGeo, MAT.palmFoliage);
    frond.position.set(Math.sin(angle) * 1.0, 7.4, Math.cos(angle) * 1.0);
    frond.rotation.y = angle;
    frond.rotation.x = 0.35;
    palm.add(frond);
  }

  return palm;
}

/**
 * Concrete River Bridge Span with safety guardrails
 */
export function createBridgeMesh(length: number, width: number): THREE.Group {
  const bridge = new THREE.Group();

  // Deck
  const deckGeo = new THREE.BoxGeometry(width, 0.8, length);
  const deck = new THREE.Mesh(deckGeo, MAT.concrete);
  deck.position.y = 0.4;
  bridge.add(deck);

  // Guardrails
  const railGeo = new THREE.BoxGeometry(0.3, 1.1, length);
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });

  const leftRail = new THREE.Mesh(railGeo, railMat);
  leftRail.position.set(width * 0.5 - 0.15, 1.2, 0);
  bridge.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, railMat);
  rightRail.position.set(-width * 0.5 + 0.15, 1.2, 0);
  bridge.add(rightRail);

  // Support Pillars underneath
  for (let z = -length * 0.35; z <= length * 0.35; z += length * 0.35) {
    const pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.5, 10);
    const pillar = new THREE.Mesh(pillarGeo, MAT.concrete);
    pillar.position.set(0, -2.0, z);
    bridge.add(pillar);
  }

  return bridge;
}
