import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameState,
  CameraMode,
  GearMode,
  BusConfig,
  RouteMission,
  ActiveTripState,
  PlayerProfile,
  GameSettings,
} from './types/game';
import { INITIAL_BUSES } from './data/busData';
import { ROUTE_MISSIONS } from './data/routeData';
import {
  loadProfile,
  saveProfile,
  loadSettings,
  saveSettings,
  resetGameProgress,
} from './utils/storage';
import { GameEngine } from './game/GameEngine';
import { soundEngine } from './utils/audio';

// UI Components
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { MobileControls } from './components/MobileControls';
import { PauseMenu } from './components/PauseMenu';
import { RouteSelectModal } from './components/RouteSelectModal';
import { GarageModal } from './components/GarageModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { MapInspectorModal } from './components/MapInspectorModal';
import { MissionCompleteModal } from './components/MissionCompleteModal';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);

  // In-Game Live HUD Telemetry
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [engineRpm, setEngineRpm] = useState<number>(800);
  const [gear, setGear] = useState<GearMode>('D');
  const [fuelLiters, setFuelLiters] = useState<number>(80);
  const [damagePercent, setDamagePercent] = useState<number>(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('CHASE');
  const [isHeadlightsOn, setIsHeadlightsOn] = useState<boolean>(false);
  const [isHandbrakeOn, setIsHandbrakeOn] = useState<boolean>(false);

  // Active Mission & Passenger State
  const [activeTrip, setActiveTrip] = useState<ActiveTripState | null>(null);
  const [completedTripToReward, setCompletedTripToReward] = useState<ActiveTripState | null>(null);
  const [playerPos, setPlayerPos] = useState<{ x: number; z: number; rotationY: number }>({
    x: 0,
    z: -235,
    rotationY: 0,
  });

  // Current active bus
  const currentBus = INITIAL_BUSES.find((b) => b.id === profile.selectedBusId) || INITIAL_BUSES[0];

  // 1. Initialize Three.js Game Engine once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(
      containerRef.current,
      currentBus,
      settings,
      {
        onSpeedChange: (speed, rpm) => {
          setSpeedKmh(speed);
          setEngineRpm(rpm);
          if (engineRef.current) {
            setPlayerPos(engineRef.current.getPlayerPosition());
          }
        },
        onFuelChange: (fuel) => setFuelLiters(fuel),
        onDamageChange: (dmg) => setDamagePercent(dmg),
        onTripUpdate: (trip) => setActiveTrip({ ...trip }),
        onTripCompleted: (trip) => {
          setCompletedTripToReward({ ...trip });
          setActiveTrip(null);
        },
      }
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update Settings to Game Engine
  const handleUpdateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    engineRef.current?.applySettings(newSettings);
  }, []);

  // Select Route and begin trip
  const handleSelectRoute = useCallback((mission: RouteMission) => {
    setGameState('PLAYING');
    soundEngine.playButtonClick();
    engineRef.current?.resume();
    engineRef.current?.startTrip(mission);
  }, []);

  // Free Drive
  const handleFreeDrive = useCallback(() => {
    setGameState('PLAYING');
    soundEngine.playButtonClick();
    engineRef.current?.cancelTrip();
    engineRef.current?.resume();
  }, []);

  // Reward and Level-Up Handler on Mission Completion
  const handleClaimMissionReward = useCallback(() => {
    if (!completedTripToReward) return;

    const mission = completedTripToReward.mission;
    const baseReward = mission.rewardTaka;
    const penalties = completedTripToReward.penalties || 0;
    const safeDrivingBonus = penalties === 0 ? 150 : 50;
    const netEarnings = Math.max(100, baseReward + safeDrivingBonus - penalties);

    setProfile((prev) => {
      const newMoney = prev.money + netEarnings;
      const newXp = prev.xp + mission.rewardXp;
      const newLevel = Math.floor(newXp / 500) + 1;
      const completedIds = prev.completedMissionIds.includes(mission.id)
        ? prev.completedMissionIds
        : [...prev.completedMissionIds, mission.id];

      const updated: PlayerProfile = {
        ...prev,
        money: newMoney,
        xp: newXp,
        level: newLevel,
        completedMissionIds: completedIds,
        statistics: {
          ...prev.statistics,
          totalTrips: prev.statistics.totalTrips + 1,
          totalDistanceKm: prev.statistics.totalDistanceKm + mission.distanceKm,
          passengersCarried: prev.statistics.passengersCarried + mission.rewardXp / 10,
          totalEarnings: prev.statistics.totalEarnings + netEarnings,
        },
      };

      saveProfile(updated);
      return updated;
    });

    setCompletedTripToReward(null);
    setGameState('ROUTES');
  }, [completedTripToReward]);

  // Bus Purchase & Garage Tuning Handlers
  const handleSelectBus = useCallback((busId: string) => {
    setProfile((prev) => {
      const updated = { ...prev, selectedBusId: busId };
      saveProfile(updated);
      return updated;
    });

    const busConfig = INITIAL_BUSES.find((b) => b.id === busId);
    if (busConfig) {
      engineRef.current?.spawnPlayerBus(busConfig);
    }
  }, []);

  const handleBuyBus = useCallback((bus: BusConfig) => {
    if (profile.money < bus.price) return;

    setProfile((prev) => {
      const updated: PlayerProfile = {
        ...prev,
        money: prev.money - bus.price,
        ownedBusIds: [...prev.ownedBusIds, bus.id],
        selectedBusId: bus.id,
      };
      saveProfile(updated);
      return updated;
    });

    engineRef.current?.spawnPlayerBus(bus);
    soundEngine.playMissionSuccess();
  }, [profile.money]);

  const handleUpgradeBus = useCallback((busId: string, upgradeType: 'engine' | 'brakes' | 'handling' | 'fuelTank') => {
    const cost = 1200;
    if (profile.money < cost) return;

    setProfile((prev) => {
      const busUpg = { ...(prev.busUpgrades[busId] || { engine: 0, brakes: 0, handling: 0, fuelTank: 0 }) };
      busUpg[upgradeType] = Math.min(3, (busUpg[upgradeType] || 0) + 1);

      const updated: PlayerProfile = {
        ...prev,
        money: prev.money - cost,
        busUpgrades: {
          ...prev.busUpgrades,
          [busId]: busUpg,
        },
      };
      saveProfile(updated);
      return updated;
    });

    soundEngine.playGearShift();
  }, [profile.money]);

  // Reset Progress
  const handleResetProgress = useCallback(() => {
    resetGameProgress();
    setProfile(loadProfile());
  }, []);

  // Gear Shift
  const handleGearChange = useCallback((newGear: GearMode) => {
    setGear(newGear);
    engineRef.current?.setInputs({ gear: newGear });
  }, []);

  // Handbrake Toggle
  const handleHandbrakeToggle = useCallback(() => {
    setIsHandbrakeOn((prev) => {
      const next = !prev;
      engineRef.current?.setInputs({ handbrake: next });
      if (next) soundEngine.playAirBrake();
      return next;
    });
  }, []);

  // Headlights Toggle
  const handleHeadlightsToggle = useCallback(() => {
    setIsHeadlightsOn((prev) => {
      const next = !prev;
      engineRef.current?.setInputs({ headlights: next });
      return next;
    });
  }, []);

  // Camera Cycle
  const handleCameraCycle = useCallback(() => {
    engineRef.current?.cycleCamera();
    if (engineRef.current) {
      setCameraMode(engineRef.current.getCameraMode());
    }
  }, []);

  // Passenger Pickup / Dropoff Trigger
  const handlePassengerAction = useCallback(() => {
    engineRef.current?.triggerPassengerAction();
  }, []);

  // Keyboard Driving Controls Listeners
  useEffect(() => {
    const activeKeys = new Set<string>();

    const updateInputs = () => {
      if (!engineRef.current || gameState !== 'PLAYING') return;

      const accel = activeKeys.has('KeyW') || activeKeys.has('ArrowUp');
      const brake = activeKeys.has('KeyS') || activeKeys.has('ArrowDown');
      const left = activeKeys.has('KeyA') || activeKeys.has('ArrowLeft');
      const right = activeKeys.has('KeyD') || activeKeys.has('ArrowRight');
      const handbrake = activeKeys.has('Space');

      let steerVal = 0;
      if (left) steerVal -= 1;
      if (right) steerVal += 1;

      engineRef.current.setInputs({
        accelerate: accel,
        brake: brake,
        steerLeft: left,
        steerRight: right,
        steerValue: steerVal,
        handbrake: handbrake || isHandbrakeOn,
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Toggle Pause
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
          setGameState('PLAYING');
        }
        return;
      }

      if (gameState !== 'PLAYING') return;

      if (!activeKeys.has(e.code)) {
        activeKeys.add(e.code);

        // One-shot triggers
        if (e.code === 'KeyH') {
          engineRef.current?.setInputs({ horn: true });
        } else if (e.code === 'KeyC') {
          handleCameraCycle();
        } else if (e.code === 'KeyL') {
          handleHeadlightsToggle();
        } else if (e.code === 'KeyE') {
          handlePassengerAction();
        }

        updateInputs();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (activeKeys.has(e.code)) {
        activeKeys.delete(e.code);

        if (e.code === 'KeyH') {
          engineRef.current?.setInputs({ horn: false });
        }

        updateInputs();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState, handleCameraCycle, handleHeadlightsToggle, handlePassengerAction, isHandbrakeOn]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* 3D WebGL Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* In-Game HUD (shown during active driving) */}
      {gameState === 'PLAYING' && (
        <>
          <GameHUD
            speedKmh={speedKmh}
            engineRpm={engineRpm}
            gear={gear}
            fuelLiters={fuelLiters}
            maxFuel={currentBus.fuelCapacity}
            damagePercent={damagePercent}
            activeTrip={activeTrip}
            playerPos={playerPos}
            onPause={() => {
              engineRef.current?.pause();
              setGameState('PAUSED');
            }}
            onCameraCycle={handleCameraCycle}
            cameraMode={cameraMode}
            money={profile.money}
          />

          <MobileControls
            onAccelerateChange={(active) => engineRef.current?.setInputs({ accelerate: active })}
            onBrakeChange={(active) => engineRef.current?.setInputs({ brake: active })}
            onSteerLeftChange={(active) => engineRef.current?.setInputs({ steerLeft: active })}
            onSteerRightChange={(active) => engineRef.current?.setInputs({ steerRight: active })}
            onHandbrakeToggle={handleHandbrakeToggle}
            onHornChange={(active) => engineRef.current?.setInputs({ horn: active })}
            onHeadlightsToggle={handleHeadlightsToggle}
            onGearChange={handleGearChange}
            onCameraCycle={handleCameraCycle}
            onPassengerAction={handlePassengerAction}
            currentGear={gear}
            currentCamera={cameraMode}
            isHeadlightsOn={isHeadlightsOn}
            canBoardPassengers={activeTrip ? activeTrip.isAtStopZone : false}
            isHandbrakeOn={isHandbrakeOn}
          />
        </>
      )}

      {/* Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartCareer={() => setGameState('ROUTES')}
          onFreeDrive={handleFreeDrive}
          onOpenGarage={() => setGameState('GARAGE')}
          onOpenRoutes={() => setGameState('ROUTES')}
          onOpenSettings={() => setGameState('SETTINGS')}
          onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onOpenMapInspector={() => setGameState('MAP_INSPECTOR')}
          profile={profile}
        />
      )}

      {/* Route Selector Modal */}
      {gameState === 'ROUTES' && (
        <RouteSelectModal
          onSelectRoute={handleSelectRoute}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* Garage Modal */}
      {gameState === 'GARAGE' && (
        <GarageModal
          profile={profile}
          onSelectBus={handleSelectBus}
          onBuyBus={handleBuyBus}
          onUpgradeBus={handleUpgradeBus}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* Settings Modal */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* How to Play Modal */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={() => setGameState('MENU')} />
      )}

      {/* Map Inspector Modal */}
      {gameState === 'MAP_INSPECTOR' && (
        <MapInspectorModal onClose={() => setGameState('MENU')} />
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={() => {
            engineRef.current?.resume();
            setGameState('PLAYING');
          }}
          onRestartTrip={() => {
            if (activeTrip) {
              engineRef.current?.startTrip(activeTrip.mission);
            }
            engineRef.current?.resume();
            setGameState('PLAYING');
          }}
          onOpenSettings={() => setGameState('SETTINGS')}
          onExitToMenu={() => {
            engineRef.current?.cancelTrip();
            setGameState('MENU');
          }}
        />
      )}

      {/* Mission Complete Victory Modal */}
      {completedTripToReward && (
        <MissionCompleteModal
          tripState={completedTripToReward}
          onContinue={handleClaimMissionReward}
        />
      )}
    </div>
  );
};

export default App;
