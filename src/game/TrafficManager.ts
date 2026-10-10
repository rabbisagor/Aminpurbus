import * as THREE from 'three';
import { TrafficDensity } from '../types/game';
import { RoadGraph } from './RoadGraph';
import {
  createCngMesh,
  createEasyBikeMesh,
  createPickupTruckMesh,
} from './ProceduralModels';

export interface TrafficVehicle {
  id: string;
  type: 'cng' | 'easybike' | 'pickup';
  mesh: THREE.Group;
  currentSegmentId: string;
  fromNodeId: string;
  toNodeId: string;
  progress: number; // 0 to 1 along the segment
  speed: number; // current m/s
  desiredSpeed: number; // target m/s (20-45 km/h)
  x: number;
  z: number;
  rotationY: number;
  width: number;
  length: number;
  laneOffset: number; // offset from center line (left or right lane)
}

export class TrafficManager {
  private scene: THREE.Scene;
  private roadGraph: RoadGraph;
  public vehicles: TrafficVehicle[] = [];
  private density: TrafficDensity = 'MEDIUM';

  constructor(scene: THREE.Scene, roadGraph: RoadGraph) {
    this.scene = scene;
    this.roadGraph = roadGraph;
  }

  public setDensity(density: TrafficDensity) {
    this.density = density;
    this.repopulate();
  }

  public initTraffic() {
    this.repopulate();
  }

  private getVehicleCount(): number {
    switch (this.density) {
      case 'LOW':
        return 6;
      case 'HIGH':
        return 18;
      case 'MEDIUM':
      default:
        return 11;
    }
  }

  public repopulate() {
    // Clear existing
    this.vehicles.forEach((v) => {
      this.scene.remove(v.mesh);
    });
    this.vehicles = [];

    const targetCount = this.getVehicleCount();
    const segmentList = Array.from(this.roadGraph.segments.values());

    if (segmentList.length === 0) return;

    for (let i = 0; i < targetCount; i++) {
      const seg = segmentList[i % segmentList.length];
      const fromNode = this.roadGraph.getNode(seg.fromNodeId);
      const toNode = this.roadGraph.getNode(seg.toNodeId);
      if (!fromNode || !toNode) continue;

      const types: Array<'cng' | 'easybike' | 'pickup'> = ['cng', 'easybike', 'pickup'];
      const vType = types[i % types.length];

      let mesh: THREE.Group;
      let width = 1.6;
      let length = 2.8;

      if (vType === 'cng') {
        mesh = createCngMesh();
        width = 1.5;
        length = 2.6;
      } else if (vType === 'easybike') {
        mesh = createEasyBikeMesh();
        width = 1.4;
        length = 2.5;
      } else {
        mesh = createPickupTruckMesh();
        width = 2.0;
        length = 4.2;
      }

      const progress = (i * 0.27) % 0.9;
      // In Bangladesh (left side of road is standard driving lane):
      // laneOffset is around 1.8 to 2.2 meters from center
      const laneOffset = i % 2 === 0 ? 1.8 : -1.8;

      const dx = toNode.x - fromNode.x;
      const dz = toNode.z - fromNode.z;
      const angle = Math.atan2(dx, dz);

      const forwardX = dx * progress;
      const forwardZ = dz * progress;

      // Normal perpendicular to road direction
      const normalX = -Math.cos(angle);
      const normalZ = Math.sin(angle);

      const posX = fromNode.x + forwardX + normalX * laneOffset;
      const posZ = fromNode.z + forwardZ + normalZ * laneOffset;

      mesh.position.set(posX, 0, posZ);
      mesh.rotation.y = angle;
      this.scene.add(mesh);

      // Desired speed in m/s (25 to 45 km/h for authentic rural rickshaws & pickups)
      const baseSpeedKmh = vType === 'easybike' ? 24 : vType === 'cng' ? 36 : 42;
      const desiredSpeed = (baseSpeedKmh + (Math.random() * 8 - 4)) / 3.6;

      this.vehicles.push({
        id: `traffic_${i}`,
        type: vType,
        mesh,
        currentSegmentId: seg.id,
        fromNodeId: seg.fromNodeId,
        toNodeId: seg.toNodeId,
        progress,
        speed: desiredSpeed,
        desiredSpeed,
        x: posX,
        z: posZ,
        rotationY: angle,
        width,
        length,
        laneOffset,
      });
    }
  }

  public update(dt: number, playerX: number, playerZ: number, playerRadius: number = 3.5) {
    const clampedDt = Math.min(dt, 0.1);

    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      const fromNode = this.roadGraph.getNode(v.fromNodeId);
      const toNode = this.roadGraph.getNode(v.toNodeId);

      if (!fromNode || !toNode) continue;

      const segDx = toNode.x - fromNode.x;
      const segDz = toNode.z - fromNode.z;
      const segDist = Math.hypot(segDx, segDz);

      if (segDist < 1) continue;

      // Check for obstacles ahead (Player bus or another AI car ahead)
      let obstacleAhead = false;

      // 1. Check distance to player bus
      const distToPlayer = Math.hypot(playerX - v.x, playerZ - v.z);
      if (distToPlayer < playerRadius + 8) {
        // Check if player is directly ahead within vehicle cone
        const forwardX = Math.sin(v.rotationY);
        const forwardZ = Math.cos(v.rotationY);
        const toPlayerX = playerX - v.x;
        const toPlayerZ = playerZ - v.z;
        const dot = forwardX * toPlayerX + forwardZ * toPlayerZ;

        if (dot > 0 && dot < 12) {
          obstacleAhead = true;
        }
      }

      // 2. Check distance to other AI traffic vehicles ahead
      for (let j = 0; j < this.vehicles.length; j++) {
        if (i === j) continue;
        const other = this.vehicles[j];
        if (other.currentSegmentId === v.currentSegmentId) {
          const distToOther = Math.hypot(other.x - v.x, other.z - v.z);
          if (distToOther < 7 && other.progress > v.progress) {
            obstacleAhead = true;
            break;
          }
        }
      }

      // Adjust speed
      if (obstacleAhead) {
        // Slow down smoothly / stop
        v.speed = Math.max(0, v.speed - 9.0 * clampedDt);
      } else {
        // Resume cruising speed
        if (v.speed < v.desiredSpeed) {
          v.speed = Math.min(v.desiredSpeed, v.speed + 4.5 * clampedDt);
        }
      }

      // Advance along road segment
      const progressDelta = (v.speed * clampedDt) / segDist;
      v.progress += progressDelta;

      // When reaching end of segment, transition to a connected segment!
      if (v.progress >= 1.0) {
        v.progress = 0;
        const nextNeighbors = this.roadGraph.adjacency.get(v.toNodeId) || [];
        if (nextNeighbors.length > 0) {
          // Choose a connected segment (avoid immediately turning 180 degrees back if possible)
          const validChoices = nextNeighbors.filter((e) => e.toNodeId !== v.fromNodeId);
          const chosen = validChoices.length > 0
            ? validChoices[Math.floor(Math.random() * validChoices.length)]
            : nextNeighbors[0];

          v.fromNodeId = v.toNodeId;
          v.toNodeId = chosen.toNodeId;
          v.currentSegmentId = chosen.segment.id;
        } else {
          // Reverse direction if dead end
          const temp = v.fromNodeId;
          v.fromNodeId = v.toNodeId;
          v.toNodeId = temp;
        }
      }

      // Update position and rotation
      const currFrom = this.roadGraph.getNode(v.fromNodeId);
      const currTo = this.roadGraph.getNode(v.toNodeId);
      if (currFrom && currTo) {
        const dx = currTo.x - currFrom.x;
        const dz = currTo.z - currFrom.z;
        const angle = Math.atan2(dx, dz);

        // Smooth rotation interpolation
        v.rotationY = angle;

        const normalX = -Math.cos(angle);
        const normalZ = Math.sin(angle);

        v.x = currFrom.x + dx * v.progress + normalX * v.laneOffset;
        v.z = currFrom.z + dz * v.progress + normalZ * v.laneOffset;

        v.mesh.position.set(v.x, 0, v.z);
        v.mesh.rotation.y = v.rotationY;
      }
    }
  }

  /**
   * Collision check between player bus and AI vehicles
   */
  public checkPlayerCollision(playerX: number, playerZ: number, playerRadius: number = 2.4): {
    collided: boolean;
    normalX: number;
    normalZ: number;
    otherVehicle?: TrafficVehicle;
  } {
    for (const v of this.vehicles) {
      const dx = playerX - v.x;
      const dz = playerZ - v.z;
      const dist = Math.hypot(dx, dz);
      const minDistance = playerRadius + Math.max(v.width, v.length) * 0.5;

      if (dist < minDistance && dist > 0.01) {
        return {
          collided: true,
          normalX: dx / dist,
          normalZ: dz / dist,
          otherVehicle: v,
        };
      }
    }

    return { collided: false, normalX: 0, normalZ: 0 };
  }
}
