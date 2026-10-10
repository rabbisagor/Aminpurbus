import * as THREE from 'three';
import { TimeOfDay, WeatherType } from '../types/game';

export class WeatherManager {
  private scene: THREE.Scene;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private hemisphereLight: THREE.HemisphereLight;
  private rainParticles: THREE.Points | null = null;
  private rainCount: number = 2500;
  private currentTimeOfDay: TimeOfDay = 'AFTERNOON';
  private currentWeather: WeatherType = 'SUNNY';

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambientLight);

    // Hemisphere natural sky-ground bounce
    this.hemisphereLight = new THREE.HemisphereLight(0xbae6fd, 0x14532d, 0.6);
    this.scene.add(this.hemisphereLight);

    // Sun / Moon Directional Light
    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    this.dirLight.position.set(120, 180, 100);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 400;
    const d = 120;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    // Fog for depth
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0018);

    this.initRainSystem();
    this.applyEnvironment('AFTERNOON', 'SUNNY');
  }

  private initRainSystem() {
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.25,
      transparent: true,
      opacity: 0.7,
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  public applyEnvironment(timeOfDay: TimeOfDay, weather: WeatherType) {
    this.currentTimeOfDay = timeOfDay;
    this.currentWeather = weather;

    let skyColor = 0x60a5fa; // default midday blue
    let sunColor = 0xfffbeb;
    let sunIntensity = 1.3;
    let ambIntensity = 0.65;
    let fogDensity = 0.0018;

    switch (timeOfDay) {
      case 'MORNING':
        skyColor = 0xfde047; // golden dawn
        sunColor = 0xfbbf24;
        sunIntensity = 1.1;
        ambIntensity = 0.6;
        fogDensity = 0.0022;
        this.dirLight.position.set(200, 70, 80);
        break;
      case 'AFTERNOON':
        skyColor = 0x38bdf8; // crisp bright sky
        sunColor = 0xfffbeb;
        sunIntensity = 1.4;
        ambIntensity = 0.7;
        fogDensity = 0.0016;
        this.dirLight.position.set(60, 200, 60);
        break;
      case 'EVENING':
        skyColor = 0xf97316; // picturesque rural amber sunset
        sunColor = 0xe11d48;
        sunIntensity = 0.9;
        ambIntensity = 0.45;
        fogDensity = 0.0025;
        this.dirLight.position.set(-180, 50, -100);
        break;
      case 'NIGHT':
        skyColor = 0x030712; // deep midnight
        sunColor = 0x38bdf8; // cool blue moonlight
        sunIntensity = 0.25;
        ambIntensity = 0.2;
        fogDensity = 0.0028;
        this.dirLight.position.set(0, 150, 0);
        break;
    }

    // Weather modifiers
    if (weather === 'CLOUDY') {
      skyColor = 0x94a3b8;
      sunIntensity *= 0.55;
      ambIntensity *= 0.8;
      fogDensity += 0.001;
    } else if (weather === 'RAIN') {
      skyColor = 0x475569;
      sunIntensity *= 0.35;
      ambIntensity *= 0.6;
      fogDensity += 0.002;
      if (this.rainParticles) this.rainParticles.visible = true;
    } else {
      if (this.rainParticles) this.rainParticles.visible = false;
    }

    this.scene.background = new THREE.Color(skyColor);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color = new THREE.Color(skyColor);
      (this.scene.fog as THREE.FogExp2).density = fogDensity;
    }

    this.dirLight.color.set(sunColor);
    this.dirLight.intensity = sunIntensity;
    this.ambientLight.intensity = ambIntensity;
  }

  public update(dt: number, playerX: number, playerZ: number) {
    if (this.currentWeather === 'RAIN' && this.rainParticles) {
      const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
      const count = this.rainCount;

      for (let i = 0; i < count; i++) {
        // Fall down fast
        positions[i * 3 + 1] -= 38 * dt;

        // Reset if below ground
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 40 + Math.random() * 5;
          // Keep centered around player
          positions[i * 3] = playerX + (Math.random() - 0.5) * 160;
          positions[i * 3 + 2] = playerZ + (Math.random() - 0.5) * 160;
        }
      }

      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
