import { RoadNode, RoadSegment, BusStop, POILandmark } from '../types/game';

/**
 * AMINPUR MAP GRAPH SYSTEM
 * 
 * Geographic Context:
 * Aminpur (আমিনপুর) is located in Pabna District, Bangladesh near the Padma-Jamuna 
 * river network, Kashinathpur highway hub, Kazirhat Ferry, and Dhalarchar.
 * Coordinates are mapped to a local 3D Cartesian system (X, Z in meters) with Y as height (0).
 */

export const MAP_CENTER_LABEL = 'Aminpur Thana, Pabna, Bangladesh (আমিনপুর, পাবনা)';
export const MAP_BOUNDS = { minX: -600, maxX: 600, minZ: -600, maxZ: 600 };

// 1. Road Network Nodes (Key Intersections, Turns, and Terminals)
export const ROAD_NODES: RoadNode[] = [
  // Central Aminpur Highway Spine
  { id: 'node_aminpur_terminal', x: 0, z: -250, name: 'আমিনপুর বাস টার্মিনাল', nameEn: 'Aminpur Bus Terminal', isIntersection: true },
  { id: 'node_aminpur_bazar_mor', x: 0, z: -100, name: 'আমিনপুর বাজার মোড়', nameEn: 'Aminpur Bazar Mor', isIntersection: true },
  { id: 'node_aminpur_center', x: 0, z: 50, name: 'আমিনপুর সদর গোলচত্বর', nameEn: 'Aminpur Sadar Roundabout', isIntersection: true },
  { id: 'node_kashinathpur_junction', x: 0, z: 240, name: 'কাশীনাথপুর সংযোগ মোড়', nameEn: 'Kashinathpur Junction', isIntersection: true },
  { id: 'node_pabna_highway_north', x: 0, z: 450, name: 'পাবনা হাইওয়ে উত্তর প্রান্ত', nameEn: 'Pabna Highway North Point', isIntersection: false },

  // Eastern Branch: Purba Bazar, Shundorpur Village & Badolpur Bridge
  { id: 'node_east_link_1', x: 120, z: -100, name: 'পূর্ব বাজার লিংক রোড', nameEn: 'Purba Bazar Link' },
  { id: 'node_purba_bazar', x: 250, z: -100, name: 'পূর্ব আমিনপুর বাজার', nameEn: 'Purba Aminpur Bazar', isIntersection: true },
  { id: 'node_shundorpur_entry', x: 340, z: -20, name: 'সুন্দরপুর প্রবেশ মোড়', nameEn: 'Shundorpur Entry Mor', isIntersection: true },
  { id: 'node_shundorpur_center', x: 420, z: 120, name: 'সুন্দরপুর বটতলা মোড়', nameEn: 'Shundorpur Bottola', isIntersection: true },
  { id: 'node_badolpur_bridge_west', x: 260, z: 200, name: 'বাদলপুর ব্রিজ পশ্চিম সংযোগ', nameEn: 'Badolpur Bridge West' },
  { id: 'node_badolpur_bridge_east', x: 380, z: 200, name: 'বাদলপুর ব্রিজ পূর্ব সংযোগ', nameEn: 'Badolpur Bridge East' },

  // Western Branch: Dhalarchar River Road & Kazirhat Ghat Link
  { id: 'node_west_link_1', x: -120, z: 50, name: 'নদীমুখী সংযোগ সড়ক', nameEn: 'River Road Link' },
  { id: 'node_dhalarchar_mor', x: -260, z: 50, name: 'ঢালারচর সংযোগ মোড়', nameEn: 'Dhalarchar Mor', isIntersection: true },
  { id: 'node_dhalarchar_ghat', x: -440, z: -50, name: 'ঢালারচর নদীঘাট টার্মিনাল', nameEn: 'Dhalarchar River Ghat Terminal', isIntersection: true },
  { id: 'node_kazirhat_approach', x: -260, z: 240, name: 'কাজীরহাট সংযোগ মোড়', nameEn: 'Kazirhat Approach Mor', isIntersection: true },
  { id: 'node_kazirhat_ferry_ghat', x: -420, z: 360, name: 'কাজীরহাট ফেরিঘাট', nameEn: 'Kazirhat Ferry Ghat', isIntersection: false },

  // Southern Outer Loop connecting Kazirhat and Kashinathpur
  { id: 'node_south_bypass_west', x: -140, z: 240, name: 'বাইপাস পশ্চিম', nameEn: 'South Bypass West' },
  { id: 'node_south_rural_loop', x: 180, z: 360, name: 'দক্ষিণ গ্রামীণ সংযোগ', nameEn: 'South Rural Connector' },
];

// 2. Road Segments Connecting the Network
export const ROAD_SEGMENTS: RoadSegment[] = [
  // Highway Core (Asphalt, Dual-Lane, 60 km/h)
  {
    id: 'seg_terminal_to_bazar',
    fromNodeId: 'node_aminpur_terminal',
    toNodeId: 'node_aminpur_bazar_mor',
    width: 11,
    lanes: 2,
    type: 'HIGHWAY',
    speedLimit: 60,
  },
  {
    id: 'seg_bazar_to_center',
    fromNodeId: 'node_aminpur_bazar_mor',
    toNodeId: 'node_aminpur_center',
    width: 11,
    lanes: 2,
    type: 'HIGHWAY',
    speedLimit: 60,
  },
  {
    id: 'seg_center_to_kashinathpur',
    fromNodeId: 'node_aminpur_center',
    toNodeId: 'node_kashinathpur_junction',
    width: 11,
    lanes: 2,
    type: 'HIGHWAY',
    speedLimit: 60,
  },
  {
    id: 'seg_kashinathpur_to_highway_north',
    fromNodeId: 'node_kashinathpur_junction',
    toNodeId: 'node_pabna_highway_north',
    width: 12,
    lanes: 2,
    type: 'HIGHWAY',
    speedLimit: 80,
  },

  // East Route: Aminpur Bazar -> Purba Bazar -> Shundorpur
  {
    id: 'seg_bazar_to_east_link',
    fromNodeId: 'node_aminpur_bazar_mor',
    toNodeId: 'node_east_link_1',
    width: 8.5,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 45,
  },
  {
    id: 'seg_east_link_to_purba_bazar',
    fromNodeId: 'node_east_link_1',
    toNodeId: 'node_purba_bazar',
    width: 8.5,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 45,
  },
  {
    id: 'seg_purba_bazar_to_shundorpur_entry',
    fromNodeId: 'node_purba_bazar',
    toNodeId: 'node_shundorpur_entry',
    width: 7.5,
    lanes: 2,
    type: 'VILLAGE_BRICK',
    speedLimit: 40,
  },
  {
    id: 'seg_shundorpur_entry_to_center',
    fromNodeId: 'node_shundorpur_entry',
    toNodeId: 'node_shundorpur_center',
    width: 7.5,
    lanes: 2,
    type: 'VILLAGE_BRICK',
    speedLimit: 40,
  },
  {
    id: 'seg_shundorpur_center_to_bridge_east',
    fromNodeId: 'node_shundorpur_center',
    toNodeId: 'node_badolpur_bridge_east',
    width: 8,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 45,
  },

  // Bridge Section across River/Canal
  {
    id: 'seg_badolpur_bridge_span',
    fromNodeId: 'node_badolpur_bridge_east',
    toNodeId: 'node_badolpur_bridge_west',
    width: 9,
    lanes: 2,
    type: 'BRIDGE',
    speedLimit: 50,
  },
  {
    id: 'seg_bridge_west_to_kashinathpur',
    fromNodeId: 'node_badolpur_bridge_west',
    toNodeId: 'node_kashinathpur_junction',
    width: 8.5,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 50,
  },

  // West Route: Center -> Dhalarchar & Kazirhat
  {
    id: 'seg_center_to_west_link',
    fromNodeId: 'node_aminpur_center',
    toNodeId: 'node_west_link_1',
    width: 9,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 50,
  },
  {
    id: 'seg_west_link_to_dhalarchar_mor',
    fromNodeId: 'node_west_link_1',
    toNodeId: 'node_dhalarchar_mor',
    width: 9,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 50,
  },
  {
    id: 'seg_dhalarchar_mor_to_ghat',
    fromNodeId: 'node_dhalarchar_mor',
    toNodeId: 'node_dhalarchar_ghat',
    width: 8,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 45,
  },
  {
    id: 'seg_dhalarchar_mor_to_kazirhat_appr',
    fromNodeId: 'node_dhalarchar_mor',
    toNodeId: 'node_kazirhat_approach',
    width: 8.5,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 50,
  },
  {
    id: 'seg_kazirhat_appr_to_ferry',
    fromNodeId: 'node_kazirhat_approach',
    toNodeId: 'node_kazirhat_ferry_ghat',
    width: 8,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 40,
  },

  // South Bypass: Connecting Kazirhat Approach to Kashinathpur Junction
  {
    id: 'seg_kazirhat_appr_to_south_bypass',
    fromNodeId: 'node_kazirhat_approach',
    toNodeId: 'node_south_bypass_west',
    width: 8.5,
    lanes: 2,
    type: 'RURAL_PAVED',
    speedLimit: 50,
  },
  {
    id: 'seg_south_bypass_to_kashinathpur',
    fromNodeId: 'node_south_bypass_west',
    toNodeId: 'node_kashinathpur_junction',
    width: 9.5,
    lanes: 2,
    type: 'HIGHWAY',
    speedLimit: 60,
  },
  {
    id: 'seg_kashinathpur_to_south_rural',
    fromNodeId: 'node_kashinathpur_junction',
    toNodeId: 'node_south_rural_loop',
    width: 7.5,
    lanes: 2,
    type: 'VILLAGE_BRICK',
    speedLimit: 35,
  },
  {
    id: 'seg_south_rural_to_badolpur',
    fromNodeId: 'node_south_rural_loop',
    toNodeId: 'node_badolpur_bridge_west',
    width: 7.5,
    lanes: 2,
    type: 'VILLAGE_BRICK',
    speedLimit: 35,
  },
];

// 3. Official Bus Stops / Passenger Terminals
export const BUS_STOPS: BusStop[] = [
  {
    id: 'stop_aminpur_terminal',
    name: 'আমিনপুর কেন্দ্রীয় বাস টার্মিনাল',
    nameEn: 'Aminpur Central Bus Terminal',
    nodeId: 'node_aminpur_terminal',
    x: 0,
    z: -250,
    description: 'আমিনপুরের প্রধান বাসস্ট্যান্ড। যাত্রী ও স্থানীয় চায়ের দোকানের ব্যস্ত কোলাহল।',
    passengerCount: 16,
  },
  {
    id: 'stop_aminpur_bazar',
    name: 'আমিনপুর বাজার বাস স্টপ',
    nameEn: 'Aminpur Bazar Bus Stop',
    nodeId: 'node_aminpur_bazar_mor',
    x: 12,
    z: -95,
    description: 'কাঁচাবাজার ও মিষ্টির দোকানের সামনে নিয়মিত যাত্রী ছাউনি।',
    passengerCount: 12,
  },
  {
    id: 'stop_purba_bazar',
    name: 'পূর্ব আমিনপুর বাজার স্টপ',
    nameEn: 'Purba Aminpur Bazar Stop',
    nodeId: 'node_purba_bazar',
    x: 250,
    z: -88,
    description: 'পূর্ব আমিনপুরের গ্রামীণ হাট ও স্কুল সংলগ্ন যাত্রী পয়েন্ট।',
    passengerCount: 14,
  },
  {
    id: 'stop_shundorpur',
    name: 'সুন্দরপুর বটতলা যাত্রী ছাউনি',
    nameEn: 'Shundorpur Bottola Passenger Shed',
    nodeId: 'node_shundorpur_center',
    x: 420,
    z: 130,
    description: 'শতবর্ষী বটগাছ ও মসজিদের সামনে ছায়াঘেরা গ্রামীণ স্টপ।',
    passengerCount: 10,
  },
  {
    id: 'stop_kashinathpur',
    name: 'কাশীনাথপুর মোড় বাসস্টপ',
    nameEn: 'Kashinathpur Mor Bus Stop',
    nodeId: 'node_kashinathpur_junction',
    x: 15,
    z: 240,
    description: 'পাবনা মহাসড়ক ও আঞ্চলিক রুটের ব্যস্ততম সংযোগ মোড়।',
    passengerCount: 22,
  },
  {
    id: 'stop_dhalarchar_ghat',
    name: 'ঢালারচর নদীঘাট যাত্রী ছাউনি',
    nameEn: 'Dhalarchar River Ghat Terminal',
    nodeId: 'node_dhalarchar_ghat',
    x: -430,
    z: -45,
    description: 'পদ্মা-যমুনা নদীসংলগ্ন ঘাটে নৌকা ও ট্রলারের যাত্রী ওঠার টার্মিনাল।',
    passengerCount: 18,
  },
  {
    id: 'stop_kazirhat_ferry',
    name: 'কাজীরহাট ফেরিঘাট স্ট্যান্ড',
    nameEn: 'Kazirhat Ferry Ghat Stand',
    nodeId: 'node_kazirhat_ferry_ghat',
    x: -410,
    z: 350,
    description: 'আরিচা-কাজীরহাট নৌপথ সংযোগকারী প্রসিদ্ধ ফেরিঘাট টার্মিনাল।',
    passengerCount: 20,
  },
];

// 4. Cultural POIs and Landmarks
export const POI_LANDMARKS: POILandmark[] = [
  { id: 'poi_terminal_mosque', name: 'আমিনপুর কেন্দ্রীয় জামে মসজিদ', nameEn: 'Aminpur Central Mosque', type: 'MOSQUE', x: -35, z: -270 },
  { id: 'poi_aminpur_tea_stall_1', name: 'কালাম ভাইয়ের চায়ের টং', nameEn: 'Kalam Cha Stall', type: 'TEA_STALL', x: 22, z: -235 },
  { id: 'poi_aminpur_haat', name: 'আমিনপুর বড় বাজার', nameEn: 'Aminpur Grand Bazar', type: 'MARKET', x: -40, z: -110 },
  { id: 'poi_purba_bazar_stores', name: 'পূর্ব বাজার গ্রোসারি হাট', nameEn: 'Purba Bazar Market', type: 'MARKET', x: 275, z: -115 },
  { id: 'poi_shundorpur_banyan', name: 'সুন্দরপুর ঐতিহাসিক বটবৃক্ষ', nameEn: 'Shundorpur Heritage Banyan', type: 'VILLAGE', x: 440, z: 105 },
  { id: 'poi_badolpur_bridge', name: 'বাদলপুর সংযোগ সেতু', nameEn: 'Badolpur Bridge Crossing', type: 'BRIDGE', x: 320, z: 200 },
  { id: 'poi_dhalarchar_ghat_market', name: 'ঢালারচর ঘাট মাছের আড়ৎ', nameEn: 'Dhalarchar Fish Market', type: 'FERRY_GHAT', x: -465, z: -60 },
  { id: 'poi_kazirhat_ferry_hub', name: 'কাজীরহাট ফেরি টার্মিনাল পন্টুন', nameEn: 'Kazirhat Pontoon Terminal', type: 'FERRY_GHAT', x: -445, z: 375 },
  { id: 'poi_kashinathpur_refuel', name: 'কাশীনাথপুর ফিলিং স্টেশন ও রেস্তোরাঁ', nameEn: 'Kashinathpur Filling & Restaurant', type: 'MARKET', x: -40, z: 260 },
];

/**
 * Validates map integrity:
 * Checks for missing node references, orphan segments, and bus stop bindings.
 */
export function validateMapData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeMap = new Set(ROAD_NODES.map((n) => n.id));

  ROAD_SEGMENTS.forEach((seg) => {
    if (!nodeMap.has(seg.fromNodeId)) {
      errors.push(`Segment '${seg.id}' references missing fromNodeId: ${seg.fromNodeId}`);
    }
    if (!nodeMap.has(seg.toNodeId)) {
      errors.push(`Segment '${seg.id}' references missing toNodeId: ${seg.toNodeId}`);
    }
    if (seg.width <= 0) {
      errors.push(`Segment '${seg.id}' has invalid width: ${seg.width}`);
    }
  });

  BUS_STOPS.forEach((stop) => {
    if (!nodeMap.has(stop.nodeId)) {
      errors.push(`Bus stop '${stop.id}' references missing nodeId: ${stop.nodeId}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
