import { BusConfig, VehicleInputs, GearMode } from '../types/game';

export interface VehicleState {
  x: number;
  y: number;
  z: number;
  rotationY: number; // yaw angle in radians
  speedKmh: number;
  engineRpm: number;
  fuelLiters: number;
  damagePercent: number;
  pitch: number; // visual tilt during accelerate/brake
  roll: number; // visual tilt during sharp steering
  steerAngle: number; // front wheel angle
}

export class VehiclePhysics {
  public busConfig: BusConfig;
  public state: VehicleState;
  private velocity: number = 0; // m/s
  private targetSteerAngle: number = 0;

  constructor(busConfig: BusConfig, initialX: number = 0, initialZ: number = -240, initialRotation: number = 0) {
    this.busConfig = busConfig;
    this.state = {
      x: initialX,
      y: 0,
      z: initialZ,
      rotationY: initialRotation,
      speedKmh: 0,
      engineRpm: 800,
      fuelLiters: busConfig.fuelCapacity,
      damagePercent: 0,
      pitch: 0,
      roll: 0,
      steerAngle: 0,
    };
  }

  public setBusConfig(busConfig: BusConfig) {
    this.busConfig = busConfig;
  }

  public resetPosition(x: number, z: number, rotationY: number = 0) {
    this.state.x = x;
    this.state.y = 0;
    this.state.z = z;
    this.state.rotationY = rotationY;
    this.velocity = 0;
    this.state.speedKmh = 0;
    this.state.pitch = 0;
    this.state.roll = 0;
    this.state.steerAngle = 0;
  }

  public update(inputs: VehicleInputs, dt: number, options: { enableFuel?: boolean; enableDamage?: boolean } = {}) {
    // Clamp delta time to avoid huge simulation jumps on tab switch
    const clampedDt = Math.min(Math.max(dt, 0.001), 0.1);

    // Speed caps from config (km/h converted to m/s)
    const maxSpeedMs = (this.busConfig.maxSpeed / 3.6);
    const maxReverseMs = maxSpeedMs * 0.35; // 35% speed in reverse

    // Effective upgrade boosts
    const engineBoost = 1 + (this.busConfig.upgrades?.engine || 0) * 0.1;
    const brakesBoost = 1 + (this.busConfig.upgrades?.brakes || 0) * 0.15;
    const handlingBoost = 1 + (this.busConfig.upgrades?.handling || 0) * 0.12;

    const baseAccelRate = (this.busConfig.acceleration / 100) * 6.5 * engineBoost;
    const baseBrakeRate = (this.busConfig.braking / 100) * 11.0 * brakesBoost;
    const frictionRate = 2.4; // natural rolling resistance
    const maxWheelAngle = 0.55 * handlingBoost; // ~31 degrees max wheel lock

    // 1. Steering Logic
    // Compute input direction: if steerValue is provided use that, else check left/right
    let steerDir = inputs.steerValue;
    if (steerDir === 0) {
      if (inputs.steerLeft) steerDir -= 1;
      if (inputs.steerRight) steerDir += 1;
    }
    steerDir = Math.max(-1, Math.min(1, steerDir));

    // Dynamic steering sensitivity: higher sensitivity at low speed, stability at high speed
    const currentSpeedRatio = Math.min(Math.abs(this.velocity) / (maxSpeedMs + 0.1), 1);
    const speedSensitiveFactor = 1.0 - currentSpeedRatio * 0.45; // reduces twitchiness at 80+ km/h
    this.targetSteerAngle = steerDir * maxWheelAngle * speedSensitiveFactor;

    // Smooth steering wheel interpolation
    const steerSpeed = 5.5 * clampedDt;
    this.state.steerAngle += (this.targetSteerAngle - this.state.steerAngle) * steerSpeed;

    // 2. Throttle and Braking by Gear
    const gear = inputs.gear;
    const isHandbrake = inputs.handbrake;

    if (isHandbrake) {
      // Powerful handbrake deceleration
      if (this.velocity > 0) {
        this.velocity = Math.max(0, this.velocity - baseBrakeRate * 1.5 * clampedDt);
      } else if (this.velocity < 0) {
        this.velocity = Math.min(0, this.velocity + baseBrakeRate * 1.5 * clampedDt);
      }
    } else {
      if (gear === 'D') {
        if (inputs.accelerate) {
          // Forward acceleration
          this.velocity += baseAccelRate * clampedDt;
          if (this.velocity > maxSpeedMs) this.velocity = maxSpeedMs;
        } else if (inputs.brake) {
          // Braking when moving forward, or stay 0
          if (this.velocity > 0) {
            this.velocity = Math.max(0, this.velocity - baseBrakeRate * clampedDt);
          }
        } else {
          // Rolling drag
          if (this.velocity > 0) {
            this.velocity = Math.max(0, this.velocity - frictionRate * clampedDt);
          } else if (this.velocity < 0) {
            this.velocity = Math.min(0, this.velocity + frictionRate * clampedDt);
          }
        }
      } else if (gear === 'R') {
        if (inputs.accelerate) {
          // Reverse acceleration
          this.velocity -= baseAccelRate * 0.7 * clampedDt;
          if (this.velocity < -maxReverseMs) this.velocity = -maxReverseMs;
        } else if (inputs.brake) {
          if (this.velocity < 0) {
            this.velocity = Math.min(0, this.velocity + baseBrakeRate * clampedDt);
          }
        } else {
          // Rolling drag
          if (this.velocity < 0) {
            this.velocity = Math.min(0, this.velocity + frictionRate * clampedDt);
          } else if (this.velocity > 0) {
            this.velocity = Math.max(0, this.velocity - frictionRate * clampedDt);
          }
        }
      } else if (gear === 'N' || gear === 'P') {
        // Coasting / Neutral / Park
        const neutralDrag = gear === 'P' ? baseBrakeRate * 2.0 : frictionRate;
        if (this.velocity > 0) {
          this.velocity = Math.max(0, this.velocity - neutralDrag * clampedDt);
        } else if (this.velocity < 0) {
          this.velocity = Math.min(0, this.velocity + neutralDrag * clampedDt);
        }
      }
    }

    // 3. Turning Physics (Ackermann kinematic model approximation)
    const wheelbase = 5.2; // meters between front and rear axles
    if (Math.abs(this.velocity) > 0.05) {
      const angularVelocity = (this.velocity / wheelbase) * Math.sin(this.state.steerAngle);
      this.state.rotationY += angularVelocity * clampedDt;
    }

    // 4. Translate Position
    const forwardX = Math.sin(this.state.rotationY);
    const forwardZ = Math.cos(this.state.rotationY);

    this.state.x += forwardX * this.velocity * clampedDt;
    this.state.z += forwardZ * this.velocity * clampedDt;

    // 5. Update Speed in km/h
    this.state.speedKmh = Math.round(this.velocity * 3.6);

    // 6. Engine RPM calculation
    const speedRatio = Math.abs(this.velocity) / (maxSpeedMs + 0.1);
    const idleRpm = 800;
    const maxRpm = 2600;
    const throttleBonus = inputs.accelerate ? 300 : 0;
    this.state.engineRpm = Math.round(idleRpm + speedRatio * (maxRpm - idleRpm) + throttleBonus);

    // 7. Visual Suspension Dynamics (Pitch and Roll)
    // Pitch: squats back during acceleration, dives front during heavy braking
    let targetPitch = 0;
    if (inputs.accelerate && gear === 'D') targetPitch = -0.025;
    if (inputs.brake && Math.abs(this.velocity) > 1) targetPitch = 0.045;
    this.state.pitch += (targetPitch - this.state.pitch) * 8 * clampedDt;

    // Roll: vehicle tilts outward slightly on sharp curves
    const targetRoll = -(this.velocity / (maxSpeedMs + 1)) * (this.state.steerAngle / maxWheelAngle) * 0.055;
    this.state.roll += (targetRoll - this.state.roll) * 6 * clampedDt;

    // 8. Fuel Simulation
    if (options.enableFuel && this.state.fuelLiters > 0) {
      const fuelPerSecond = (this.velocity * 0.001) / (this.busConfig.fuelEfficiency || 5.0);
      const idleConsumption = 0.0002;
      this.state.fuelLiters = Math.max(0, this.state.fuelLiters - (fuelPerSecond + idleConsumption) * clampedDt);
    }
  }

  /**
   * Applies collision impact from hitting road barriers or vehicles
   */
  public handleCollision(impactNormalX: number, impactNormalZ: number, impactForce: number = 5) {
    // Rebound velocity back
    this.velocity = -this.velocity * 0.35;
    this.state.x += impactNormalX * 0.6;
    this.state.z += impactNormalZ * 0.6;

    // Damage impact
    this.state.damagePercent = Math.min(100, this.state.damagePercent + Math.round(impactForce * 1.5));
  }

  public repairVehicle() {
    this.state.damagePercent = 0;
  }

  public refuelVehicle() {
    this.state.fuelLiters = this.busConfig.fuelCapacity;
  }
}
