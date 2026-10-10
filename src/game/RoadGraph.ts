import { RoadNode, RoadSegment, BusStop } from '../types/game';
import { ROAD_NODES, ROAD_SEGMENTS, BUS_STOPS } from '../data/mapData';

export interface PathWaypoint {
  x: number;
  z: number;
  nodeId?: string;
}

export class RoadGraph {
  public nodes: Map<string, RoadNode> = new Map();
  public segments: Map<string, RoadSegment> = new Map();
  public adjacency: Map<string, Array<{ toNodeId: string; segment: RoadSegment; distance: number }>> = new Map();
  public busStops: Map<string, BusStop> = new Map();

  constructor() {
    this.initGraph();
  }

  private initGraph() {
    ROAD_NODES.forEach((node) => {
      this.nodes.set(node.id, node);
      this.adjacency.set(node.id, []);
    });

    ROAD_SEGMENTS.forEach((seg) => {
      this.segments.set(seg.id, seg);
      const fromNode = this.nodes.get(seg.fromNodeId);
      const toNode = this.nodes.get(seg.toNodeId);

      if (fromNode && toNode) {
        const dx = toNode.x - fromNode.x;
        const dz = toNode.z - fromNode.z;
        const distance = Math.hypot(dx, dz);

        this.adjacency.get(seg.fromNodeId)?.push({
          toNodeId: seg.toNodeId,
          segment: seg,
          distance,
        });

        // If two-way road, add reverse edge
        if (!seg.isOneWay) {
          this.adjacency.get(seg.toNodeId)?.push({
            toNodeId: seg.fromNodeId,
            segment: seg,
            distance,
          });
        }
      }
    });

    BUS_STOPS.forEach((stop) => {
      this.busStops.set(stop.id, stop);
    });
  }

  public getNode(nodeId: string): RoadNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getBusStop(stopId: string): BusStop | undefined {
    return this.busStops.get(stopId);
  }

  /**
   * Finds the nearest road node to a given (x, z) location.
   */
  public findNearestNode(x: number, z: number): RoadNode {
    let nearestNode = ROAD_NODES[0];
    let minDistanceSq = Infinity;

    for (const node of this.nodes.values()) {
      const distSq = (node.x - x) ** 2 + (node.z - z) ** 2;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        nearestNode = node;
      }
    }

    return nearestNode;
  }

  /**
   * Dijkstra shortest path algorithm from startNodeId to goalNodeId.
   */
  public findPath(startNodeId: string, goalNodeId: string): PathWaypoint[] {
    if (startNodeId === goalNodeId) {
      const node = this.nodes.get(startNodeId);
      return node ? [{ x: node.x, z: node.z, nodeId: node.id }] : [];
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }

    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let currentId: string | null = null;
      let smallestDist = Infinity;

      for (const nodeId of unvisited) {
        const d = distances.get(nodeId)!;
        if (d < smallestDist) {
          smallestDist = d;
          currentId = nodeId;
        }
      }

      if (currentId === null || smallestDist === Infinity) break;
      if (currentId === goalNodeId) break;

      unvisited.delete(currentId);

      const neighbors = this.adjacency.get(currentId) || [];
      for (const edge of neighbors) {
        if (!unvisited.has(edge.toNodeId)) continue;
        const alt = smallestDist + edge.distance;
        if (alt < distances.get(edge.toNodeId)!) {
          distances.set(edge.toNodeId, alt);
          previous.set(edge.toNodeId, currentId);
        }
      }
    }

    // Reconstruct path
    const path: PathWaypoint[] = [];
    let curr: string | null = goalNodeId;

    if (distances.get(goalNodeId) === Infinity) {
      // Direct fallback line if disconnected
      const sNode = this.nodes.get(startNodeId);
      const gNode = this.nodes.get(goalNodeId);
      if (sNode && gNode) {
        return [
          { x: sNode.x, z: sNode.z, nodeId: sNode.id },
          { x: gNode.x, z: gNode.z, nodeId: gNode.id },
        ];
      }
      return [];
    }

    while (curr) {
      const node = this.nodes.get(curr);
      if (node) {
        path.unshift({ x: node.x, z: node.z, nodeId: node.id });
      }
      curr = previous.get(curr) || null;
    }

    return path;
  }

  /**
   * Generates subdivided waypoints along the route path for smooth AI traffic and route markers.
   */
  public generateSmoothRoutePoints(waypoints: PathWaypoint[], stepDistance: number = 8): PathWaypoint[] {
    if (waypoints.length < 2) return waypoints;

    const smoothPoints: PathWaypoint[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const segDist = Math.hypot(dx, dz);
      const steps = Math.max(1, Math.floor(segDist / stepDistance));

      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        smoothPoints.push({
          x: p1.x + dx * t,
          z: p1.z + dz * t,
        });
      }
    }

    // Add final point
    const last = waypoints[waypoints.length - 1];
    smoothPoints.push({ x: last.x, z: last.z, nodeId: last.nodeId });

    return smoothPoints;
  }
}

export const roadGraph = new RoadGraph();
