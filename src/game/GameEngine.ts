import * as THREE from 'three';
import {
  BusConfig,
  CameraMode,
  VehicleInputs,
  ActiveTripState,
  GameSettings,
  BusStop,
} from '../types/game';
import { ROAD_NODES, ROAD_SEGMENTS, BUS_STOPS, POI_LANDMARKS } from '../data/mapData';
import { RoadGraph } from './RoadGraph';
import { VehiclePhysics } from './VehiclePhysics';
import {
  createBusMesh,
  createRuralHouseMesh,
  createTeaStallMesh,
  createMosqueMesh,
  createBusStopShedMesh,
  createBanyanTreeMesh,
  createPalmTreeMesh,
  createBridgeMesh,
} from './ProceduralModels';
import { TrafficManager } from './TrafficManager';
import { PassengerManager } from './PassengerManager';
import { WeatherManager } from './WeatherManager';
import { soundEngine } from '../utils/audio';

export interface GameEngineCallbacks {
  onSpeedChange: (speedKmh: number, rpm: number) => void;
  onFuelChange: (fuelLiters: number, maxCapacity: number) => void;
  onDamageChange: (damagePercent: number) => void;
  onTripUpdate: (tripState: ActiveTripState) => void;
  onTripCompleted: (tripState: ActiveTripState) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private roadGraph: RoadGraph;

  public physics: VehiclePhysics;
  private trafficManager: TrafficManager;
  private passengerManager: PassengerManager;
  private weatherManager: WeatherManager;

  private currentBusConfig: BusConfig;
  private busMeshGroup: THREE.Group | null = null;
  private frontWheels: THREE.Group[] = [];
  private rearWheels: THREE.Group[] = [];
  private cockpitAnchor: THREE.Object3D | null = null;
  private leftHeadlightSpot: THREE.SpotLight | null = null;
  private rightHeadlightSpot: THREE.SpotLight | null = null;

  private cameraMode: CameraMode = 'CHASE';
  private inputs: VehicleInputs = {
    accelerate: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    steerValue: 0,
    handbrake: false,
    gear: 'D',
    horn: false,
    headlights: false,
    openDoor: false,
  };

  private activeTrip: ActiveTripState | null = null;
  private callbacks: GameEngineCallbacks;
  private settings: GameSettings;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor(container: HTMLElement, busConfig: BusConfig, settings: GameSettings, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.currentBusConfig = busConfig;
    this.settings = settings;
    this.callbacks = callbacks;

    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.3, 1200);

    // 2. Renderer with performance optimizations
    this.renderer = new THREE.WebGLRenderer({ antialias: settings.graphicsQuality !== 'LOW', powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'HIGH' ? 2 : 1.25));
    this.renderer.shadowMap.enabled = settings.graphicsQuality === 'HIGH';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 3. Subsystems
    this.roadGraph = new RoadGraph();
    this.physics = new VehiclePhysics(busConfig, 0, -235, Math.PI); // Facing forward from Aminpur Terminal
    this.trafficManager = new TrafficManager(this.scene, this.roadGraph);
    this.passengerManager = new PassengerManager(this.scene);
    this.weatherManager = new WeatherManager(this.scene);

    // 4. Build 3D World (Terrain, Roads, Buildings, Vegetation)
    this.buildWorld();

    // 5. Build Player Bus
    this.spawnPlayerBus(busConfig);

    // 6. Init Traffic & Weather
    this.trafficManager.setDensity(settings.trafficDensity);
    this.weatherManager.applyEnvironment(settings.timeOfDay, settings.weather);

    // 7. Resize handling
    window.addEventListener('resize', this.onWindowResize);

    // 8. Start Game Loop
    this.start();
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Generates the entire Aminpur 3D environment
   */
  private buildWorld() {
    // A. Lush Bangladeshi Green Agricultural Ground & Ponds
    const groundGeo = new THREE.PlaneGeometry(1600, 1600, 1, 1);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Rich emerald green lush paddy color
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // B. River / Canal Crossing (Jamuna-Padma tributary near Dhalarchar & Badolpur)
    const riverGeo = new THREE.PlaneGeometry(120, 1000);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(320, 0.08, 150);
    river.rotation.y = 0.25;
    this.scene.add(river);

    // C. Generate Roads from Graph Segments
    this.buildRoadNetworkMeshes();

    // D. Populate Bangladeshi Landmarks & Scenery
    this.populateLandmarksAndFoliage();
  }

  /**
   * Builds road ribbons dynamically from the Aminpur Road Graph
   */
  private buildRoadNetworkMeshes() {
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x27272a, // dark weathered asphalt
      roughness: 0.85,
      metalness: 0.1,
    });

    const brickMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Herringbone brick red
      roughness: 0.9,
      metalness: 0.05,
    });

    const shoulderMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e, // Earthen dirt/mud roadside shoulder
      roughness: 0.95,
    });

    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a, // Yellow/white road divider line
    });

    ROAD_SEGMENTS.forEach((seg) => {
      const from = this.roadGraph.getNode(seg.fromNodeId);
      const to = this.roadGraph.getNode(seg.toNodeId);
      if (!from || !to) return;

      const dx = to.x - from.x;
      const dz = to.z - from.z;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (from.x + to.x) * 0.5;
      const midZ = (from.z + to.z) * 0.5;

      if (seg.type === 'BRIDGE') {
        const bridge = createBridgeMesh(length, seg.width);
        bridge.position.set(midX, 0, midZ);
        bridge.rotation.y = angle;
        this.scene.add(bridge);
        return;
      }

      // Main Road Surface
      const roadGeo = new THREE.PlaneGeometry(seg.width, length);
      roadGeo.rotateX(-Math.PI / 2);
      const roadMesh = new THREE.Mesh(roadGeo, seg.type === 'VILLAGE_BRICK' ? brickMat : asphaltMat);
      roadMesh.position.set(midX, 0.1, midZ);
      roadMesh.rotation.y = angle;
      roadMesh.receiveShadow = true;
      this.scene.add(roadMesh);

      // Earthen Shoulders on both sides
      const shoulderGeo = new THREE.PlaneGeometry(seg.width + 3.2, length);
      shoulderGeo.rotateX(-Math.PI / 2);
      const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      shoulder.position.set(midX, 0.05, midZ);
      shoulder.rotation.y = angle;
      shoulder.receiveShadow = true;
      this.scene.add(shoulder);

      // Center Yellow / White Lane Divider (Highway segments)
      if (seg.type === 'HIGHWAY') {
        const lineGeo = new THREE.PlaneGeometry(0.2, length);
        lineGeo.rotateX(-Math.PI / 2);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(midX, 0.12, midZ);
        line.rotation.y = angle;
        this.scene.add(line);
      }
    });

    // Circular Intersection Pads at major nodes
    const junctionMat = asphaltMat;
    ROAD_NODES.filter((n) => n.isIntersection).forEach((node) => {
      const circleGeo = new THREE.CircleGeometry(8.5, 24);
      circleGeo.rotateX(-Math.PI / 2);
      const junction = new THREE.Mesh(circleGeo, junctionMat);
      junction.position.set(node.x, 0.11, node.z);
      this.scene.add(junction);
    });
  }

  /**
   * Spawns village houses, tea stalls, mosques, waiting sheds, and trees
   */
  private populateLandmarksAndFoliage() {
    // 1. Bus Stop Waiting Sheds
    BUS_STOPS.forEach((stop) => {
      const shed = createBusStopShedMesh(stop.name);
      shed.position.set(stop.x + 4.5, 0, stop.z);
      this.scene.add(shed);
    });

    // 2. Cultural POIs
    POI_LANDMARKS.forEach((poi) => {
      if (poi.type === 'MOSQUE') {
        const mosque = createMosqueMesh();
        mosque.position.set(poi.x, 0, poi.z);
        this.scene.add(mosque);
      } else if (poi.type === 'TEA_STALL') {
        const stall = createTeaStallMesh(poi.name);
        stall.position.set(poi.x, 0, poi.z);
        this.scene.add(stall);
      } else if (poi.type === 'VILLAGE') {
        const banyan = createBanyanTreeMesh();
        banyan.position.set(poi.x, 0, poi.z);
        banyan.scale.set(1.4, 1.4, 1.4);
        this.scene.add(banyan);
      }
    });

    // 3. Rural Village Settlements (Clusters of tin houses and tea stalls)
    const villageClusters = [
      { x: 30, z: -150, count: 5 },
      { x: -50, z: -80, count: 6 },
      { x: 260, z: -160, count: 7 },
      { x: 380, z: 80, count: 6 },
      { x: -300, z: 80, count: 5 },
      { x: -180, z: 270, count: 6 },
      { x: 60, z: 320, count: 7 },
    ];

    villageClusters.forEach((cluster) => {
      for (let i = 0; i < cluster.count; i++) {
        const house = createRuralHouseMesh();
        const offsetX = (Math.random() - 0.5) * 45;
        const offsetZ = (Math.random() - 0.5) * 45;
        house.position.set(cluster.x + offsetX, 0, cluster.z + offsetZ);
        house.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(house);
      }

      // Add a tea stall to the village cluster
      const stall = createTeaStallMesh();
      stall.position.set(cluster.x + 12, 0, cluster.z - 8);
      this.scene.add(stall);
    });

    // 4. Lush Coconut Palms and Banyan Trees lining roads
    for (let i = 0; i < 90; i++) {
      const palm = createPalmTreeMesh();
      const node = ROAD_NODES[i % ROAD_NODES.length];
      const dist = 12 + Math.random() * 28;
      const angle = Math.random() * Math.PI * 2;
      palm.position.set(node.x + Math.cos(angle) * dist, 0, node.z + Math.sin(angle) * dist);
      this.scene.add(palm);
    }

    for (let i = 0; i < 28; i++) {
      const banyan = createBanyanTreeMesh();
      const node = ROAD_NODES[(i * 2) % ROAD_NODES.length];
      const dist = 22 + Math.random() * 35;
      const angle = Math.random() * Math.PI * 2;
      banyan.position.set(node.x + Math.cos(angle) * dist, 0, node.z + Math.sin(angle) * dist);
      this.scene.add(banyan);
    }
  }

  /**
   * Spawns or swaps player's active bus model
   */
  public spawnPlayerBus(busConfig: BusConfig) {
    if (this.busMeshGroup) {
      this.scene.remove(this.busMeshGroup);
    }

    this.currentBusConfig = busConfig;
    this.physics.setBusConfig(busConfig);

    const busData = createBusMesh(busConfig);
    this.busMeshGroup = busData.group;
    this.frontWheels = busData.frontWheels;
    this.rearWheels = busData.rearWheels;
    this.cockpitAnchor = busData.cockpitAnchor;

    // Spotlights for bus headlights
    this.leftHeadlightSpot = new THREE.SpotLight(0xfef9c3, 0, 90, Math.PI / 5, 0.4, 1.2);
    this.leftHeadlightSpot.position.set(1.1, 1.2, 5.0);
    this.busMeshGroup.add(this.leftHeadlightSpot);

    const leftTarget = new THREE.Object3D();
    leftTarget.position.set(1.1, 0, 25.0);
    this.busMeshGroup.add(leftTarget);
    this.leftHeadlightSpot.target = leftTarget;

    this.rightHeadlightSpot = new THREE.SpotLight(0xfef9c3, 0, 90, Math.PI / 5, 0.4, 1.2);
    this.rightHeadlightSpot.position.set(-1.1, 1.2, 5.0);
    this.busMeshGroup.add(this.rightHeadlightSpot);

    const rightTarget = new THREE.Object3D();
    rightTarget.position.set(-1.1, 0, 25.0);
    this.busMeshGroup.add(rightTarget);
    this.rightHeadlightSpot.target = rightTarget;

    this.scene.add(this.busMeshGroup);
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  public getCameraMode(): CameraMode {
    return this.cameraMode;
  }

  public cycleCamera() {
    const modes: CameraMode[] = ['CHASE', 'COCKPIT', 'BUMPER', 'TOP_DOWN'];
    const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
    this.setCameraMode(modes[nextIdx]);
    soundEngine.playButtonClick();
  }

  public setInputs(inputs: Partial<VehicleInputs>) {
    const prevHorn = this.inputs.horn;
    const prevHeadlights = this.inputs.headlights;
    const prevGear = this.inputs.gear;

    this.inputs = { ...this.inputs, ...inputs };

    // Horn trigger
    if (this.inputs.horn && !prevHorn) {
      soundEngine.playHydraulicHorn();
    } else if (!this.inputs.horn && prevHorn) {
      soundEngine.stopHydraulicHorn();
    }

    // Headlight toggle
    if (this.inputs.headlights !== prevHeadlights) {
      soundEngine.playButtonClick();
      const intensity = this.inputs.headlights ? 4.5 : 0;
      if (this.leftHeadlightSpot) this.leftHeadlightSpot.intensity = intensity;
      if (this.rightHeadlightSpot) this.rightHeadlightSpot.intensity = intensity;
    }

    // Gear shift sound
    if (this.inputs.gear !== prevGear) {
      soundEngine.playGearShift();
    }
  }

  public startTrip(mission: ActiveTripState['mission']) {
    const startStop = this.roadGraph.getBusStop(mission.fromStopId) || BUS_STOPS[0];
    const targetStop = this.roadGraph.getBusStop(mission.toStopId) || BUS_STOPS[1];

    // Place bus neatly in front of start bus stop
    this.physics.resetPosition(startStop.x, startStop.z - 12, 0);

    this.activeTrip = {
      mission,
      currentStopIndex: 0,
      targetStop,
      passengersOnBoard: 0,
      isAtStopZone: false,
      doorOpen: false,
      completed: false,
      tripStartTime: Date.now(),
      distanceCovered: 0,
      penalties: 0,
    };

    // Show pickup zone marker at target or start
    this.passengerManager.setTargetStop(startStop);
    this.callbacks.onTripUpdate(this.activeTrip);
  }

  public cancelTrip() {
    this.activeTrip = null;
    this.passengerManager.hideStopZone();
  }

  public triggerPassengerAction() {
    if (!this.activeTrip) return;

    const result = this.passengerManager.handleBoardingAction(
      this.activeTrip,
      this.currentBusConfig.passengerCapacity
    );

    if (result.success) {
      if (result.completed) {
        this.callbacks.onTripCompleted(this.activeTrip);
        this.activeTrip = null;
      } else {
        // Now head toward destination stop!
        const destStop = this.roadGraph.getBusStop(this.activeTrip.mission.toStopId);
        if (destStop) {
          this.activeTrip.targetStop = destStop;
          this.passengerManager.setTargetStop(destStop);
        }
        this.callbacks.onTripUpdate(this.activeTrip);
      }
    }
  }

  public applySettings(settings: GameSettings) {
    this.settings = settings;
    this.trafficManager.setDensity(settings.trafficDensity);
    this.weatherManager.applyEnvironment(settings.timeOfDay, settings.weather);
    soundEngine.setVolume(settings.soundVolume);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    soundEngine.startEngine();
    this.animate(this.lastTime);
  }

  public pause() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    soundEngine.stopEngine();
  }

  public resume() {
    if (this.isRunning) return;
    this.start();
  }

  private animate = (currentTime: number) => {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt, currentTime / 1000);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private update(dt: number, timeSec: number) {
    // 1. Update Vehicle Physics
    this.physics.update(this.inputs, dt, {
      enableFuel: this.settings.fuelSimulation,
      enableDamage: this.settings.realisticDamage,
    });

    const vState = this.physics.state;

    // 2. Audio Update (Engine RPM & Throttle)
    soundEngine.updateEngine(vState.speedKmh, this.inputs.accelerate);

    // 3. Sync Bus 3D Mesh
    if (this.busMeshGroup) {
      this.busMeshGroup.position.set(vState.x, vState.y, vState.z);
      this.busMeshGroup.rotation.set(vState.pitch, vState.rotationY, vState.roll);

      // Rotate front wheels according to steer angle
      this.frontWheels.forEach((w) => {
        w.rotation.y = vState.steerAngle;
        w.rotation.x += (vState.speedKmh / 3.6) * dt * 2.2;
      });

      // Roll rear wheels
      this.rearWheels.forEach((w) => {
        w.rotation.x += (vState.speedKmh / 3.6) * dt * 2.2;
      });
    }

    // 4. Update AI Traffic & Check Player Collisions
    this.trafficManager.update(dt, vState.x, vState.z);

    const collision = this.trafficManager.checkPlayerCollision(vState.x, vState.z);
    if (collision.collided) {
      this.physics.handleCollision(collision.normalX, collision.normalZ, 4.0);
      soundEngine.playAirBrake();
      if (this.activeTrip) {
        this.activeTrip.penalties += 20;
      }
    }

    // 5. Update Passenger Stop Zone Logic
    this.passengerManager.update(this.activeTrip, vState.x, vState.z, vState.speedKmh, timeSec);

    // 6. Update Weather Particles & Rain
    this.weatherManager.update(dt, vState.x, vState.z);

    // 7. Update Camera Position according to Camera Mode
    this.updateCamera(dt);

    // 8. Fire Callbacks to React HUD
    this.callbacks.onSpeedChange(vState.speedKmh, vState.engineRpm);
    this.callbacks.onFuelChange(vState.fuelLiters, this.currentBusConfig.fuelCapacity);
    this.callbacks.onDamageChange(vState.damagePercent);
    if (this.activeTrip) {
      this.callbacks.onTripUpdate(this.activeTrip);
    }
  }

  private updateCamera(dt: number) {
    const vState = this.physics.state;

    if (this.cameraMode === 'CHASE') {
      // Smooth Third-Person Spring Camera behind bus
      const cameraDistance = 14.5;
      const cameraHeight = 5.2;

      const targetX = vState.x - Math.sin(vState.rotationY) * cameraDistance;
      const targetZ = vState.z - Math.cos(vState.rotationY) * cameraDistance;
      const targetY = vState.y + cameraHeight;

      // Smooth lerp
      const lerpFactor = Math.min(1, 8.5 * dt);
      this.camera.position.x += (targetX - this.camera.position.x) * lerpFactor;
      this.camera.position.y += (targetY - this.camera.position.y) * lerpFactor;
      this.camera.position.z += (targetZ - this.camera.position.z) * lerpFactor;

      const lookTarget = new THREE.Vector3(
        vState.x + Math.sin(vState.rotationY) * 6,
        vState.y + 2.0,
        vState.z + Math.cos(vState.rotationY) * 6
      );
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'COCKPIT') {
      // Inside driver's seat looking out windshield
      if (this.cockpitAnchor && this.busMeshGroup) {
        const worldPos = new THREE.Vector3();
        this.cockpitAnchor.getWorldPosition(worldPos);
        this.camera.position.copy(worldPos);

        const lookAtPoint = new THREE.Vector3(
          worldPos.x + Math.sin(vState.rotationY) * 20,
          worldPos.y - 0.2,
          worldPos.z + Math.cos(vState.rotationY) * 20
        );
        this.camera.lookAt(lookAtPoint);
      }
    } else if (this.cameraMode === 'BUMPER') {
      // Low front bumper view
      const bumperX = vState.x + Math.sin(vState.rotationY) * 5.2;
      const bumperZ = vState.z + Math.cos(vState.rotationY) * 5.2;
      this.camera.position.set(bumperX, vState.y + 0.9, bumperZ);

      const lookTarget = new THREE.Vector3(
        bumperX + Math.sin(vState.rotationY) * 30,
        vState.y + 0.8,
        bumperZ + Math.cos(vState.rotationY) * 30
      );
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'TOP_DOWN') {
      // Aerial bird's eye view
      this.camera.position.set(vState.x, vState.y + 55, vState.z - 0.1);
      this.camera.lookAt(new THREE.Vector3(vState.x, vState.y, vState.z));
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public getPlayerPosition() {
    return {
      x: this.physics.state.x,
      z: this.physics.state.z,
      rotationY: this.physics.state.rotationY,
    };
  }

  public getActiveTrip() {
    return this.activeTrip;
  }

  public dispose() {
    this.pause();
    window.removeEventListener('resize', this.onWindowResize);
    soundEngine.stopHydraulicHorn();

    if (this.renderer && this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
