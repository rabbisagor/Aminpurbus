import * as THREE from 'three';
import { BusStop, ActiveTripState } from '../types/game';
import { soundEngine } from '../utils/audio';

export class PassengerManager {
  private scene: THREE.Scene;
  private stopZoneMarker: THREE.Mesh | null = null;
  private passengerPedsGroup: THREE.Group | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initStopZoneMarker();
  }

  private initStopZoneMarker() {
    // Glowing pulsing passenger stop area cylinder ring on road
    const geo = new THREE.CylinderGeometry(6.5, 6.5, 0.3, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // vibrant emerald green
      emissive: 0x16a34a,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.65,
    });
    this.stopZoneMarker = new THREE.Mesh(geo, mat);
    this.stopZoneMarker.position.y = 0.15;
    this.stopZoneMarker.visible = false;
    this.scene.add(this.stopZoneMarker);

    this.passengerPedsGroup = new THREE.Group();
    this.scene.add(this.passengerPedsGroup);
  }

  public setTargetStop(stop: BusStop) {
    if (this.stopZoneMarker) {
      this.stopZoneMarker.position.set(stop.x, 0.15, stop.z);
      this.stopZoneMarker.visible = true;
    }
    this.spawnWaitingPedestrians(stop);
  }

  public hideStopZone() {
    if (this.stopZoneMarker) {
      this.stopZoneMarker.visible = false;
    }
    this.clearPedestrians();
  }

  private clearPedestrians() {
    if (!this.passengerPedsGroup) return;
    while (this.passengerPedsGroup.children.length > 0) {
      const child = this.passengerPedsGroup.children[0];
      this.passengerPedsGroup.remove(child);
    }
  }

  private spawnWaitingPedestrians(stop: BusStop) {
    this.clearPedestrians();
    if (!this.passengerPedsGroup) return;

    // Stylized low-poly Bangladeshi pedestrians in traditional shirts/panjabi/sari
    const clothesColors = [0x0284c7, 0x16a34a, 0xd97706, 0x9333ea, 0xef4444, 0xf8fafc];

    for (let i = 0; i < Math.min(8, stop.passengerCount); i++) {
      const ped = new THREE.Group();
      const color = clothesColors[i % clothesColors.length];

      // Body / Torso
      const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.9, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.0;
      ped.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x78350f }); // Brown complexion
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.65;
      ped.add(head);

      // Legs / Lungi or trousers
      const legsGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.8, 8);
      const legsMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const legs = new THREE.Mesh(legsGeo, legsMat);
      legs.position.y = 0.4;
      ped.add(legs);

      // Spread pedestrians near waiting shed
      const angle = (i / 8) * Math.PI * 2;
      const radius = 2.5 + (i % 2) * 1.2;
      ped.position.set(stop.x + Math.cos(angle) * radius, 0, stop.z + Math.sin(angle) * radius);
      ped.rotation.y = Math.random() * Math.PI * 2;

      this.passengerPedsGroup.add(ped);
    }
  }

  public update(tripState: ActiveTripState | null, playerX: number, playerZ: number, playerSpeedKmh: number, timeSeconds: number) {
    if (!tripState || !this.stopZoneMarker || !this.stopZoneMarker.visible) return;

    // Subtle pulsing animation on marker
    const pulse = 1 + Math.sin(timeSeconds * 4) * 0.08;
    this.stopZoneMarker.scale.set(pulse, 1, pulse);

    // Check distance between bus and stop zone
    const target = tripState.targetStop;
    const distToZone = Math.hypot(playerX - target.x, playerZ - target.z);

    const isInsideZone = distToZone < 8.0;
    const isStopped = Math.abs(playerSpeedKmh) <= 5;

    tripState.isAtStopZone = isInsideZone && isStopped;
  }

  /**
   * Performs passenger boarding or alighting action
   */
  public handleBoardingAction(tripState: ActiveTripState, maxCapacity: number): {
    success: boolean;
    passengersDelta: number;
    completed: boolean;
  } {
    if (!tripState.isAtStopZone) {
      return { success: false, passengersDelta: 0, completed: false };
    }

    soundEngine.playBoardingChime();

    // If passengers on board is 0, this is a PICKUP stop
    if (tripState.passengersOnBoard === 0) {
      const needed = Math.min(tripState.targetStop.passengerCount, maxCapacity);
      tripState.passengersOnBoard = needed;
      this.clearPedestrians(); // passengers board bus
      return { success: true, passengersDelta: needed, completed: false };
    } else {
      // Alighting at destination!
      const delivered = tripState.passengersOnBoard;
      tripState.passengersOnBoard = 0;
      tripState.completed = true;
      this.hideStopZone();
      soundEngine.playMissionSuccess();
      return { success: true, passengersDelta: -delivered, completed: true };
    }
  }
}
