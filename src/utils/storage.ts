import { PlayerProfile, GameSettings } from '../types/game';

const SAVE_KEY = 'aminpur_bus_sim_v1_save';
const SETTINGS_KEY = 'aminpur_bus_sim_v1_settings';

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'ড্রাইভার ভাই (Driver Bhai)',
  money: 2500, // Starting money in Taka
  xp: 0,
  level: 1,
  selectedBusId: 'aminpur_local_01',
  ownedBusIds: ['aminpur_local_01'],
  completedMissionIds: [],
  busUpgrades: {
    aminpur_local_01: { engine: 0, brakes: 0, handling: 0, fuelTank: 0 },
    pabna_deluxe_02: { engine: 0, brakes: 0, handling: 0, fuelTank: 0 },
    padma_royal_03: { engine: 0, brakes: 0, handling: 0, fuelTank: 0 },
  },
  statistics: {
    totalTrips: 0,
    totalDistanceKm: 0,
    passengersCarried: 0,
    totalEarnings: 0,
    safeDrivingScore: 100,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'BN',
  graphicsQuality: 'MEDIUM',
  trafficDensity: 'MEDIUM',
  soundVolume: 0.8,
  musicVolume: 0.6,
  steeringSensitivity: 1.0,
  realisticDamage: true,
  fuelSimulation: true,
  timeOfDay: 'AFTERNOON',
  weather: 'SUNNY',
};

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage:', err);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function resetGameProgress(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error('Failed to reset progress:', err);
  }
}
