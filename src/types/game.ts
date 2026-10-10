export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GARAGE' | 'ROUTES' | 'SETTINGS' | 'HOW_TO_PLAY' | 'MAP_INSPECTOR';

export type CameraMode = 'CHASE' | 'COCKPIT' | 'BUMPER' | 'TOP_DOWN';

export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export type WeatherType = 'SUNNY' | 'CLOUDY' | 'RAIN';

export type GearMode = 'D' | 'N' | 'R' | 'P';

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export type TrafficDensity = 'LOW' | 'MEDIUM' | 'HIGH';

export type Language = 'BN' | 'EN';

export interface BusConfig {
  id: string;
  name: string;
  nameEn: string;
  category: 'LOCAL' | 'INTERCITY' | 'PREMIUM';
  description: string;
  descriptionEn: string;
  price: number;
  unlocked: boolean;
  maxSpeed: number; // km/h
  acceleration: number; // 0-100 rating
  braking: number;
  handling: number;
  passengerCapacity: number;
  fuelCapacity: number; // Litres
  fuelEfficiency: number; // km per Litre
  mass: number; // kg
  color: string;
  secondaryColor: string;
  roofCarrier: boolean;
  modelStyle: 'local' | 'deluxe' | 'luxury';
  upgrades: {
    engine: number; // 0 to 3
    brakes: number;
    handling: number;
    fuelTank: number;
  };
}

export interface RoadNode {
  id: string;
  x: number;
  z: number;
  name?: string;
  nameEn?: string;
  isIntersection?: boolean;
}

export interface RoadSegment {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  width: number;
  lanes: number;
  type: 'HIGHWAY' | 'RURAL_PAVED' | 'VILLAGE_BRICK' | 'BRIDGE';
  speedLimit: number;
  isOneWay?: boolean;
}

export interface BusStop {
  id: string;
  name: string;
  nameEn: string;
  nodeId: string;
  x: number;
  z: number;
  description: string;
  passengerCount: number;
}

export interface POILandmark {
  id: string;
  name: string;
  nameEn: string;
  type: 'MARKET' | 'MOSQUE' | 'TEA_STALL' | 'FERRY_GHAT' | 'BRIDGE' | 'VILLAGE';
  x: number;
  z: number;
  rotation?: number;
}

export interface RouteMission {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  fromStopId: string;
  toStopId: string;
  intermediateStopIds: string[];
  distanceKm: number;
  estimatedTimeMin: number;
  rewardTaka: number;
  rewardXp: number;
  difficulty: 'সহজ (Easy)' | 'মাঝারি (Medium)' | 'কঠিন (Hard)';
  difficultyRating: 1 | 2 | 3;
}

export interface PlayerProfile {
  name: string;
  money: number;
  xp: number;
  level: number;
  selectedBusId: string;
  ownedBusIds: string[];
  completedMissionIds: string[];
  busUpgrades: Record<string, { engine: number; brakes: number; handling: number; fuelTank: number }>;
  statistics: {
    totalTrips: number;
    totalDistanceKm: number;
    passengersCarried: number;
    totalEarnings: number;
    safeDrivingScore: number;
  };
}

export interface GameSettings {
  language: Language;
  graphicsQuality: GraphicsQuality;
  trafficDensity: TrafficDensity;
  soundVolume: number; // 0 to 1
  musicVolume: number;
  steeringSensitivity: number; // 0.5 to 1.5
  realisticDamage: boolean;
  fuelSimulation: boolean;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
}

export interface VehicleInputs {
  accelerate: boolean;
  brake: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  steerValue: number; // -1 to 1 for smooth analog or button lerp
  handbrake: boolean;
  gear: GearMode;
  horn: boolean;
  headlights: boolean;
  openDoor: boolean;
}

export interface ActiveTripState {
  mission: RouteMission;
  currentStopIndex: number;
  targetStop: BusStop;
  passengersOnBoard: number;
  isAtStopZone: boolean;
  doorOpen: boolean;
  completed: boolean;
  tripStartTime: number;
  distanceCovered: number;
  penalties: number;
}
