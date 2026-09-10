import * as THREE from 'three';
import { BUNNY_SKINS, BunnySkin, DeathReason } from './types';
import { soundEngine } from './soundEngine';

export interface NinthCarrotRadarData {
  active: boolean;
  distanceHops: number;
  angleDeg: number;
}

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onCarrotCollected: (totalSession: number, screenPos: { x: number; y: number }, isGolden?: boolean) => void;
  onGameOver: (finalScore: number, sessionCarrots: number, deathReason?: DeathReason) => void;
  onDifficultyUpdate?: (level: number, multiplier: number) => void;
  onGameStart?: () => void;
  onEagleWarning?: (active: boolean) => void;
  onNinthCarrotRadar?: (radar: NinthCarrotRadarData | null) => void;
}

interface EagleData {
  group: THREE.Group;
  wingLeft: THREE.Group;
  wingRight: THREE.Group;
  shadow: THREE.Mesh;
  warningMesh: THREE.Mesh | null;
  state: 'warning' | 'swooping' | 'caught';
  warningTimer: number;
  flightTime: number;
  flightDuration: number;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  endPos: THREE.Vector3;
  dirVector: THREE.Vector3;
  prevPos: THREE.Vector3;
  flappingTimer: number;
}

interface RowCarrot {
  mesh: THREE.Group;
  col: number;
  baseY: number;
  rotSpeed: number;
  floatOffset: number;
  attachedToLog?: THREE.Group;
  isGolden?: boolean;
}

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
}

interface LogData {
  mesh: THREE.Group;
  halfLen: number;
}

interface RowData {
  index: number;
  type: 'grass' | 'road' | 'river';
  group: THREE.Group;
  blocked?: Set<number>;
  cars?: THREE.Group[];
  logs?: LogData[];
  carrots?: RowCarrot[];
  dir?: number;
  speed?: number;
}

export class ThreeGameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js Core
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Constants (matching original reference Bunny Hop)
  private readonly TILE = 1;              // world units per tile
  private readonly HALF_WIDTH = 7;        // playable columns from -HALF_WIDTH..HALF_WIDTH
  private readonly ROW_LOOKAHEAD = 28;    // rows generated ahead of player
  private readonly ROW_KEEP_BEHIND = 8;   // rows kept behind player before cleanup
  private readonly HOP_DURATION = 140;    // ms
  // Wide terrain and seamless off-screen boundaries so cars and logs never overhang ground
  private readonly TERRAIN_WIDTH = 120;
  private readonly ROAD_BOUND = 28;
  private readonly RIVER_BOUND = 30;
  // Centered straight view camera offset (directly behind player along Z axis)
  private readonly CAM_OFFSET = new THREE.Vector3(0, 9.8, 9.2);
  // Eagle mechanic: spawns after collecting 5 carrots
  private readonly REQUIRED_CARROTS_FOR_EAGLE: number = 5;
  // Maximum carrots collectible in this session (default 8, rare 1/100 chance for 9)
  private maxCarrots = 8;

  // Colors
  private readonly COLORS = {
    grass1: 0x8fd35a,
    grass2: 0x7fc94e,
    road: 0x4a4a52,
    roadLine: 0xf5e04a,
    river: 0x4fb8e8,
    riverDeep: 0x3aa0d4,
    sidewalk: 0xcfcfd4,
    log: 0x9a6a3c,
    logDark: 0x7d5230,
    treeLeaf: 0x4fae4f,
    treeTrunk: 0x8a5a34,
    shadow: 0x000000,
    carrotOrange: 0xff6b00,
    carrotGreen: 0x38b000,
  };

  private readonly CAR_COLORS = [
    0xff6b6b, 0xffd93d, 0x6bcbef, 0x9b7bff, 0xff9f5b, 0x5be0a0, 0xff6fae,
  ];

  // Game State
  private rows: Map<number, RowData> = new Map();
  private farthestGenerated = -1;
  private player = { col: 0, row: 0, x: 0, z: 0, facing: 0 };
  private hopping = false;
  private hopStart = 0;
  private hopFrom = { x: 0, z: 0 };
  private hopTo = { x: 0, z: 0 };
  private alive = true;
  private ended = false;
  private started = false;
  private paused = false;

  private score = 0;
  private sessionCarrots = 0;

  // Time & Difficulty tracking (for HUD, no sudden deaths)
  private playDuration = 0;
  private currentDifficultyLevel = 1;
  private difficultyMultiplier = 1.0;

  // Models & Groups
  private bunnyGroup!: THREE.Group;
  private currentSkin: BunnySkin = BUNNY_SKINS.classic;
  private particles: Particle[] = [];
  private particleGroup!: THREE.Group;

  // Animation Timers
  private lastTime = performance.now();
  private earFlapTimer = 0;
  private splashing = false;
  private splashStart = 0;

  // Eagle Predator Mechanic
  private eagleUnlocked = false;
  private eagleSpawnTimer = 0;
  private eagleData: EagleData | null = null;

  // 9th Golden Carrot Navigation Radar
  private ninthCarrotTarget: { row: number; col: number; x: number; z: number; mesh: THREE.Group } | null = null;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks, initialSkinId: string = 'classic') {
    this.container = container;
    this.callbacks = callbacks;
    this.currentSkin = BUNNY_SKINS[initialSkinId] || BUNNY_SKINS.classic;
    this.initScene();
    this.initBunny();
    this.initParticleSystem();
    this.resetWorld();
    this.bindEvents();
    this.startLoop();
    if (typeof window !== 'undefined') {
      (window as unknown as { __triggerEagle?: () => void }).__triggerEagle = () => {
        this.triggerEagleAttack();
      };
    }
  }

  /* ============================= INITIALIZATION ============================= */
  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9fd8f5);
    this.scene.fog = new THREE.Fog(0x9fd8f5, 30, 52);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / Math.max(1, height);

    // Clean straight view 40° FOV looking directly forward along Z
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 120);
    this.camera.position.copy(this.CAM_OFFSET);
    this.camera.lookAt(0, 0.4, -4.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = false;
    this.container.appendChild(this.renderer.domElement);

    // Lighting (from original reference)
    const hemi = new THREE.HemisphereLight(0xffffff, 0x88aa66, 0.95);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(-6, 12, 8);
    this.scene.add(dir);

    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(ambient);
  }

  private initParticleSystem() {
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
  }

  /* ============================= 3D MODEL BUILDERS ============================= */
  private createBox(w: number, h: number, d: number, color: number): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshLambertMaterial({ color });
    return new THREE.Mesh(geo, mat);
  }

  private createCylinder(r1: number, r2: number, h: number, color: number, seg: number = 8): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(r1, r2, h, seg);
    const mat = new THREE.MeshLambertMaterial({ color });
    return new THREE.Mesh(geo, mat);
  }

  private createSphere(r: number, color: number, seg: number = 8): THREE.Mesh {
    const geo = new THREE.SphereGeometry(r, seg, Math.max(6, Math.floor(seg * 0.75)));
    const mat = new THREE.MeshLambertMaterial({ color });
    return new THREE.Mesh(geo, mat);
  }

  private createCone(r: number, h: number, color: number, seg: number = 8): THREE.Mesh {
    const geo = new THREE.ConeGeometry(r, h, seg);
    const mat = new THREE.MeshLambertMaterial({ color });
    return new THREE.Mesh(geo, mat);
  }

  private createShadowBlob(scale: number = 1): THREE.Mesh {
    const geo = new THREE.CircleGeometry(0.4 * scale, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: this.COLORS.shadow,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.01;
    return m;
  }

  /**
   * Build 3D Bunny matching original reference geometry & integrating skin colors
   */
  private initBunny() {
    if (this.bunnyGroup) {
      this.scene.remove(this.bunnyGroup);
    }

    const g = new THREE.Group();
    const colors = this.currentSkin.colors;

    // Body
    const body = this.createBox(0.52, 0.4, 0.62, colors.body);
    body.position.y = 0.32;
    g.add(body);

    // Head
    const head = this.createBox(0.4, 0.36, 0.4, colors.body);
    head.position.set(0, 0.62, -0.2);
    g.add(head);

    // Left Ear
    const earL = this.createBox(0.12, 0.46, 0.1, colors.body);
    earL.position.set(-0.11, 0.98, -0.16);
    earL.rotation.z = 0.12;
    g.add(earL);

    const earLin = this.createBox(0.06, 0.32, 0.02, colors.earInner);
    earLin.position.set(-0.11, 0.94, -0.21);
    earLin.rotation.z = 0.12;
    g.add(earLin);

    // Right Ear
    const earR = this.createBox(0.12, 0.46, 0.1, colors.body);
    earR.position.set(0.11, 0.98, -0.16);
    earR.rotation.z = -0.12;
    g.add(earR);

    const earRin = this.createBox(0.06, 0.32, 0.02, colors.earInner);
    earRin.position.set(0.11, 0.94, -0.21);
    earRin.rotation.z = -0.12;
    g.add(earRin);

    // Nose
    const nose = this.createSphere(0.06, colors.nose, 8);
    nose.position.set(0, 0.58, -0.42);
    g.add(nose);

    // Cheeks / Eyes
    const eyeGeo = new THREE.SphereGeometry(0.045, 8, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: colors.eyes || 0x2a2a2a });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.13, 0.66, -0.4);
    g.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.13, 0.66, -0.4);
    g.add(eyeR);

    // Tail
    const tail = this.createSphere(0.1, colors.tail, 8);
    tail.position.set(0, 0.36, 0.32);
    g.add(tail);

    // Feet
    const fl = this.createBox(0.16, 0.14, 0.22, colors.feet);
    fl.position.set(-0.16, 0.08, -0.16);
    g.add(fl);

    const fr = this.createBox(0.16, 0.14, 0.22, colors.feet);
    fr.position.set(0.16, 0.08, -0.16);
    g.add(fr);

    // Aura ring for rare/epic skins
    if (this.currentSkin.auraColor) {
      const auraGeo = new THREE.RingGeometry(0.35, 0.48, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: this.currentSkin.auraColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.03;
      g.add(aura);
    }

    // Shadow
    const shadow = this.createShadowBlob(1.0);
    shadow.position.y = 0.01;
    g.add(shadow);

    this.bunnyGroup = g;
    this.scene.add(this.bunnyGroup);
  }

  /** Build 3D Collectible Carrot (supports rare Golden 9th Carrot) */
  private buildCarrot(isGolden: boolean = false): THREE.Group {
    const group = new THREE.Group();

    // Carrot Root
    const coneGeo = new THREE.ConeGeometry(isGolden ? 0.16 : 0.13, isGolden ? 0.44 : 0.38, 8);
    const coneMat = new THREE.MeshLambertMaterial({
      color: isGolden ? 0xffd700 : this.COLORS.carrotOrange,
      emissive: isGolden ? 0x664400 : 0x000000,
      flatShading: true,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI; // point down
    coneMesh.position.y = isGolden ? 0.25 : 0.22;
    group.add(coneMesh);

    // Carrot leaves on top
    for (let i = 0; i < (isGolden ? 4 : 3); i++) {
      const angle = (i * Math.PI * 2) / (isGolden ? 4 : 3);
      const leafGeo = new THREE.BoxGeometry(0.04, isGolden ? 0.17 : 0.14, 0.04);
      const leafMat = new THREE.MeshLambertMaterial({
        color: isGolden ? 0x76c843 : this.COLORS.carrotGreen,
        flatShading: true,
      });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(Math.cos(angle) * 0.035, isGolden ? 0.48 : 0.44, Math.sin(angle) * 0.035);
      leaf.rotation.z = (Math.cos(angle) * Math.PI) / 7;
      leaf.rotation.x = (Math.sin(angle) * Math.PI) / 7;
      group.add(leaf);
    }

    // Floating halo
    const haloGeo = new THREE.RingGeometry(isGolden ? 0.2 : 0.16, isGolden ? 0.32 : 0.24, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: isGolden ? 0xffd700 : 0xff9100,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isGolden ? 0.65 : 0.35,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.02;
    group.add(halo);

    const baseScale = isGolden ? 1.25 : 1.05;
    group.scale.set(baseScale, baseScale, baseScale);
    return group;
  }

  /** Build 3D Car (matching original reference) */
  private buildCar(color: number): THREE.Group {
    const g = new THREE.Group();
    const body = this.createBox(0.9, 0.32, 0.6, color);
    body.position.y = 0.28;
    g.add(body);

    const cabin = this.createBox(0.5, 0.24, 0.56, 0xffffff);
    cabin.position.set(-0.05, 0.52, 0);
    g.add(cabin);

    const wheelMat = 0x2a2a2a;
    const wheelPositions = [
      [-0.28, 0.12, 0.32],
      [0.28, 0.12, 0.32],
      [-0.28, 0.12, -0.32],
      [0.28, 0.12, -0.32],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = this.createCylinder(0.12, 0.12, 0.12, wheelMat, 10);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      g.add(wheel);
    });

    const sh = this.createShadowBlob(1.4);
    sh.position.y = 0.005;
    g.add(sh);

    return g;
  }

  /** Build 3D Floating Log (matching original reference) */
  private buildLog(len: number): THREE.Group {
    const g = new THREE.Group();
    const main = this.createCylinder(0.22, 0.22, len, this.COLORS.log, 10);
    main.rotation.z = Math.PI / 2;
    g.add(main);

    const endCapGeo = new THREE.CircleGeometry(0.22, 10);
    const endMat = new THREE.MeshLambertMaterial({ color: this.COLORS.logDark });

    const capL = new THREE.Mesh(endCapGeo, endMat);
    capL.rotation.y = Math.PI / 2;
    capL.position.x = -len / 2;
    g.add(capL);

    const capR = new THREE.Mesh(endCapGeo, endMat);
    capR.rotation.y = -Math.PI / 2;
    capR.position.x = len / 2;
    g.add(capR);

    return g;
  }

  /** Build Tree for Grass Lanes (matching original reference) */
  private buildTree(): THREE.Group {
    const tree = new THREE.Group();
    const trunk = this.createCylinder(0.08, 0.1, 0.32, this.COLORS.treeTrunk, 6);
    trunk.position.y = 0.16;
    tree.add(trunk);

    const leaf = this.createCone(0.34, 0.55, this.COLORS.treeLeaf, 8);
    leaf.position.y = 0.58;
    tree.add(leaf);

    const leaf2 = this.createSphere(0.22, this.COLORS.treeLeaf, 8);
    leaf2.position.y = 0.42;
    tree.add(leaf2);

    const sh = this.createShadowBlob(1.1);
    sh.position.set(0, 0.01, 0);
    tree.add(sh);

    return tree;
  }

  /* ============================= WORLD GENERATION ============================= */
  private terrainMeshForRow(type: 'grass' | 'road' | 'river'): THREE.Mesh {
    const w = this.TERRAIN_WIDTH;
    let color: number;
    if (type === 'grass') color = Math.random() < 0.5 ? this.COLORS.grass1 : this.COLORS.grass2;
    else if (type === 'road') color = this.COLORS.road;
    else color = this.COLORS.river;
    const m = this.createBox(w, 0.4, this.TILE * 0.98, color);
    m.position.y = -0.2;
    return m;
  }

  private generateRow(index: number) {
    if (this.rows.has(index)) return;

    const group = new THREE.Group();
    group.position.z = -index * this.TILE;
    this.scene.add(group);

    let type: 'grass' | 'road' | 'river';
    if (index <= 2) {
      type = 'grass';
    } else {
      const r = Math.random();
      const riverChance = Math.min(0.32, 0.14 + index * 0.002);
      const roadChance = Math.min(0.42, 0.30 + index * 0.002);
      if (r < riverChance) type = 'river';
      else if (r < riverChance + roadChance) type = 'road';
      else type = 'grass';

      // Avoid 3 water or road rows consecutively
      const prev1 = this.rows.get(index - 1);
      const prev2 = this.rows.get(index - 2);
      if (prev1 && prev2 && prev1.type !== 'grass' && prev2.type !== 'grass') {
        type = 'grass';
      }
    }

    const terrain = this.terrainMeshForRow(type);
    group.add(terrain);

    const rowData: RowData = { index, type, group };

    if (type === 'grass') {
      rowData.blocked = new Set();
      rowData.carrots = [];

      // Trees in playable corridor
      const treeCount = Math.random() < 0.55 ? Math.floor(1 + Math.random() * 3) : 0;
      const usedCols = new Set<number>();

      for (let i = 0; i < treeCount; i++) {
        const c = Math.floor(-this.HALF_WIDTH + Math.random() * (this.HALF_WIDTH * 2 + 1));
        if (usedCols.has(c) || (index === 0 && c === 0)) continue;
        usedCols.add(c);
        rowData.blocked.add(c);

        const tree = this.buildTree();
        tree.position.set(c * this.TILE, 0, 0);
        group.add(tree);
      }

      // Natural forest boundary on sides to frame the track
      for (let s = -this.ROAD_BOUND; s < -this.HALF_WIDTH; s += 2.5) {
        if (Math.random() < 0.7) {
          const tree = this.buildTree();
          tree.position.set(s * this.TILE, 0, 0);
          group.add(tree);
        }
      }
      for (let s = this.HALF_WIDTH + 1; s <= this.ROAD_BOUND; s += 2.5) {
        if (Math.random() < 0.7) {
          const tree = this.buildTree();
          tree.position.set(s * this.TILE, 0, 0);
          group.add(tree);
        }
      }

      // Spawn Carrots on Grass (if not start tile, unblocked, and session carrots not yet capped)
      if (index > 0 && this.sessionCarrots < this.maxCarrots && Math.random() < 0.35) {
        const isNinthCarrot = this.maxCarrots === 9 && this.sessionCarrots === 8;
        const carrotCol = Math.floor(-this.HALF_WIDTH + Math.random() * (this.HALF_WIDTH * 2 + 1));
        if (!rowData.blocked.has(carrotCol)) {
          const carrotMesh = this.buildCarrot(isNinthCarrot);
          carrotMesh.position.set(carrotCol * this.TILE, 0.05, 0);
          group.add(carrotMesh);

          rowData.carrots.push({
            mesh: carrotMesh,
            col: carrotCol,
            baseY: 0.05,
            rotSpeed: isNinthCarrot ? 3.2 : 2.0,
            floatOffset: Math.random() * Math.PI * 2,
            isGolden: isNinthCarrot,
          });
        }
      }
    } else if (type === 'road') {
      // Continuous dashed road stripes across the entire width
      if (index % 2 === 0) {
        for (let s = -this.ROAD_BOUND - 4; s <= this.ROAD_BOUND + 4; s += 2.5) {
          const stripe = this.createBox(1.0, 0.01, 0.08, this.COLORS.roadLine);
          stripe.position.set(s, 0.005, 0);
          group.add(stripe);
        }
      }

      const dir = Math.random() < 0.5 ? 1 : -1;
      const speed = (1.8 + Math.random() * (1.0 + Math.min(index * 0.01, 1.6))) * dir;
      const gap = 4.4 + Math.random() * 2.0;

      rowData.dir = dir;
      rowData.speed = speed;
      rowData.cars = [];

      const totalSpan = this.ROAD_BOUND * 2;
      const count = Math.floor(totalSpan / gap);
      const startOffset = -this.ROAD_BOUND + Math.random() * gap;
      const color = this.CAR_COLORS[Math.floor(Math.random() * this.CAR_COLORS.length)];

      for (let i = 0; i < count; i++) {
        const car = this.buildCar(color);
        const x = ((startOffset + i * gap + this.ROAD_BOUND) % totalSpan) - this.ROAD_BOUND;
        car.position.set(x, 0, 0);
        if (dir < 0) car.rotation.y = Math.PI;
        group.add(car);
        rowData.cars.push(car);
      }
    } else if (type === 'river') {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const speed = (1.1 + Math.random() * (0.8 + Math.min(index * 0.008, 1.0))) * dir;
      const gap = 3.6 + Math.random() * 1.6;

      rowData.dir = dir;
      rowData.speed = speed;
      rowData.logs = [];
      rowData.carrots = [];

      const totalSpan = this.RIVER_BOUND * 2;
      const count = Math.floor(totalSpan / gap);
      const startOffset = -this.RIVER_BOUND + Math.random() * gap;

      for (let i = 0; i < count; i++) {
        const logLen = 1.8 + Math.random() * 1.2;
        const log = this.buildLog(logLen);
        const x = ((startOffset + i * gap + this.RIVER_BOUND) % totalSpan) - this.RIVER_BOUND;
        log.position.set(x, 0.02, 0);
        group.add(log);
        rowData.logs.push({ mesh: log, halfLen: logLen / 2 });

        // Optional carrot floating on log within playable area (if carrots not yet capped)
        if (Math.abs(x) <= this.HALF_WIDTH && this.sessionCarrots < this.maxCarrots && Math.random() < 0.2) {
          const isNinthCarrot = this.maxCarrots === 9 && this.sessionCarrots === 8;
          const carrotMesh = this.buildCarrot(isNinthCarrot);
          carrotMesh.position.set(0, 0.24, 0);
          log.add(carrotMesh);

          rowData.carrots.push({
            mesh: carrotMesh,
            col: 0,
            baseY: 0.24,
            rotSpeed: isNinthCarrot ? 3.4 : 2.2,
            floatOffset: Math.random() * Math.PI * 2,
            attachedToLog: log,
            isGolden: isNinthCarrot,
          });
        }
      }
    }

    this.rows.set(index, rowData);
    this.farthestGenerated = Math.max(this.farthestGenerated, index);
  }

  private removeRow(index: number) {
    const rd = this.rows.get(index);
    if (!rd) return;

    this.scene.remove(rd.group);
    rd.group.traverse((o) => {
      if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose();
      if ((o as THREE.Mesh).material) {
        const mat = (o as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    this.rows.delete(index);
  }

  /* ============================= GAME STATE MANAGEMENT ============================= */
  public resetWorld() {
    Array.from(this.rows.keys()).forEach((k) => this.removeRow(k));
    this.farthestGenerated = -1;

    // Reset particles
    this.particles.forEach((p) => this.particleGroup.remove(p.mesh));
    this.particles = [];

    this.player = { col: 0, row: 0, x: 0, z: 0, facing: 0 };
    if (this.bunnyGroup) {
      if (this.bunnyGroup.parent !== this.scene) {
        this.scene.add(this.bunnyGroup);
      }
      this.bunnyGroup.position.set(0, 0, 0);
      this.bunnyGroup.rotation.set(0, 0, 0);
      this.bunnyGroup.scale.set(1, 1, 1);
    }

    this.cleanupEagle();
    this.clearNinthCarrotRadar();
    this.eagleUnlocked = false;
    this.eagleSpawnTimer = 0;
    if (this.callbacks.onEagleWarning) {
      this.callbacks.onEagleWarning(false);
    }

    this.hopping = false;
    this.alive = true;
    this.ended = false;
    this.started = false;
    this.paused = false;
    this.splashing = false;

    this.playDuration = 0;
    this.currentDifficultyLevel = 1;
    this.difficultyMultiplier = 1.0;

    this.score = 0;
    this.sessionCarrots = 0;

    this.callbacks.onScoreUpdate(0);
    if (this.callbacks.onDifficultyUpdate) {
      this.callbacks.onDifficultyUpdate(1, 1.0);
    }

    // Pre-generate rows matching original reference
    for (let i = -2; i <= this.ROW_LOOKAHEAD; i++) {
      this.generateRow(i);
    }
  }

  public setMaxCarrots(max: number) {
    this.maxCarrots = max;
  }

  public start() {
    this.started = true;
    this.alive = true;
    this.ended = false;
    this.paused = false;
    this.playDuration = 0;
    this.difficultyMultiplier = 1.0;
    this.currentDifficultyLevel = 1;

    // Eagle unlocks once player gathers REQUIRED_CARROTS_FOR_EAGLE (5 carrots)
    if (this.REQUIRED_CARROTS_FOR_EAGLE === 0) {
      this.eagleUnlocked = true;
      this.eagleSpawnTimer = 3.5;
    } else {
      this.eagleUnlocked = false;
      this.eagleSpawnTimer = 999999;
    }

    if (this.callbacks.onGameStart) {
      this.callbacks.onGameStart();
    }
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    this.paused = false;
    this.lastTime = performance.now();
  }

  public setSkin(skinId: string) {
    const skin = BUNNY_SKINS[skinId];
    if (skin) {
      this.currentSkin = skin;
      this.initBunny();
      if (this.bunnyGroup) {
        this.bunnyGroup.position.set(this.player.x, 0, this.player.z);
        this.bunnyGroup.rotation.y = this.player.facing;
      }
    }
  }

  /* ============================= CONTROLS & MOVEMENT ============================= */
  public attemptMove(direction: 'up' | 'down' | 'left' | 'right') {
    if (!this.started || !this.alive || this.hopping || this.paused) return;

    let dc = 0;
    let dr = 0;
    let targetFacing = 0;

    // Model default (rot=0) faces forward along -Z (into obstacles / UP).
    // When moving:
    // UP (forward): targetFacing = 0
    // DOWN (backward): targetFacing = Math.PI
    // LEFT (towards -X): targetFacing = Math.PI / 2
    // RIGHT (towards +X): targetFacing = -Math.PI / 2
    switch (direction) {
      case 'up':
        dr = 1;
        targetFacing = 0;
        break;
      case 'down':
        dr = -1;
        targetFacing = Math.PI;
        break;
      case 'left':
        dc = -1;
        targetFacing = Math.PI / 2;
        break;
      case 'right':
        dc = 1;
        targetFacing = -Math.PI / 2;
        break;
    }

    const baseCol = Math.round(this.player.x / this.TILE);
    const newCol = baseCol + dc;
    const newRow = this.player.row + dr;

    // Road bounds check
    if (newCol < -this.HALF_WIDTH || newCol > this.HALF_WIDTH) return;
    if (newRow < 0 && dr < 0) return;

    // Check tree obstacles
    const destRow = this.rows.get(newRow);
    if (destRow && destRow.type === 'grass' && destRow.blocked && destRow.blocked.has(newCol)) {
      return; // blocked by tree
    }

    this.hopFrom = { x: this.player.x, z: this.player.z };
    this.hopTo = { x: newCol * this.TILE, z: -newRow * this.TILE };
    this.player.col = newCol;
    this.player.row = newRow;
    this.player.facing = targetFacing;
    this.hopping = true;
    this.hopStart = performance.now();

    soundEngine.playHop();

    if (newRow > this.score) {
      this.score = newRow;
      this.callbacks.onScoreUpdate(this.score);
    }

    // Check carrot pickups on destination row
    this.checkCarrotCollection(newRow, newCol);

    // Expand rows ahead
    while (this.farthestGenerated < newRow + this.ROW_LOOKAHEAD) {
      this.generateRow(this.farthestGenerated + 1);
    }

    // Cleanup old rows behind (only upon advancement, no creeping cropping wall)
    const cleanupBefore = newRow - this.ROW_KEEP_BEHIND;
    Array.from(this.rows.keys()).forEach((k) => {
      if (k < cleanupBefore) this.removeRow(k);
    });
  }

  /* ============================= CARROT PICKUP SYSTEM ============================= */
  private checkCarrotCollection(rowIndex: number, colIndex: number) {
    // Session carrot cap enforced: no more than maxCarrots (8 normally, 9 on rare 1/100 roll)
    if (this.sessionCarrots >= this.maxCarrots) return;

    const rd = this.rows.get(rowIndex);
    if (!rd || !rd.carrots || rd.carrots.length === 0) return;

    const playerX = colIndex * this.TILE;

    for (let i = rd.carrots.length - 1; i >= 0; i--) {
      const carrot = rd.carrots[i];
      let match = false;

      if (carrot.attachedToLog) {
        const logWorldX = carrot.attachedToLog.position.x;
        if (Math.abs(logWorldX - playerX) < 0.6) {
          match = true;
        }
      } else if (carrot.col === colIndex) {
        match = true;
      }

      if (match) {
        this.sessionCarrots += 1;
        const isGolden = !!carrot.isGolden || (this.maxCarrots === 9 && this.sessionCarrots === 9);

        if (isGolden) {
          soundEngine.playGoldenCarrot();
          this.spawnParticleBurst(playerX, 0.4, -rowIndex * this.TILE, 0xffd700, 24);
        } else {
          soundEngine.playCarrot();
          this.spawnParticleBurst(playerX, 0.4, -rowIndex * this.TILE, 0xff7a00, 12);
        }

        const carrotWorldPos = new THREE.Vector3(playerX, 0.5, -rowIndex * this.TILE);
        carrotWorldPos.project(this.camera);
        const screenX = ((carrotWorldPos.x + 1) * this.container.clientWidth) / 2;
        const screenY = ((-carrotWorldPos.y + 1) * this.container.clientHeight) / 2;
        this.callbacks.onCarrotCollected(this.sessionCarrots, { x: screenX, y: screenY }, isGolden);

        // Eagle Escalation System based on carrot count:
        if (this.sessionCarrots >= this.REQUIRED_CARROTS_FOR_EAGLE && !this.eagleUnlocked) {
          this.eagleUnlocked = true;
          this.eagleSpawnTimer = 3.5 + Math.random() * 2.0;
        }

        if (this.sessionCarrots === 7) {
          // Escalation at 7 carrots: eagle gets aggressive and strikes shortly
          this.eagleUnlocked = true;
          this.eagleSpawnTimer = Math.min(this.eagleSpawnTimer, 2.8);
        }

        if (this.sessionCarrots === 8) {
          if (this.maxCarrots === 8) {
            // Normal 8-carrot game: Harvest complete!
            // Immediate Apex Eagle strike so player is not left hopping aimlessly
            this.eagleUnlocked = true;
            this.eagleSpawnTimer = 1.0;
          } else if (this.maxCarrots === 9) {
            // 9th Golden Carrot run: spawn the 9th carrot and activate navigation radar
            this.spawnNinthGoldenCarrot();
            this.eagleUnlocked = true;
            this.eagleSpawnTimer = 3.8;
          }
        }

        if (this.sessionCarrots === 9 || isGolden) {
          // 9th Golden Carrot collected!
          this.clearNinthCarrotRadar();
        }

        if (carrot.attachedToLog) {
          carrot.attachedToLog.remove(carrot.mesh);
        } else {
          rd.group.remove(carrot.mesh);
        }
        rd.carrots.splice(i, 1);

        // If cap reached with this pickup, break out of loop
        if (this.sessionCarrots >= this.maxCarrots) break;
      }
    }
  }

  /* ============================= PARTICLE EFFECTS ============================= */
  private spawnParticleBurst(x: number, y: number, z: number, color: number, count: number) {
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.particleGroup.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.5;
      const upSpeed = 2.5 + Math.random() * 3.0;

      this.particles.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(angle) * speed, upSpeed, Math.sin(angle) * speed),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
        scale: 1,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particleGroup.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (p.mesh.material) {
          const mat = p.mesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      p.vel.y -= 12 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.rotVel.x * dt;
      p.mesh.rotation.y += p.rotVel.y * dt;

      const progress = p.life / p.maxLife;
      const scale = Math.max(0.01, 1 - progress);
      p.mesh.scale.set(scale, scale, scale);
    }
  }

  /* ============================= COLLISION & DEATH ============================= */
  private checkLanding() {
    const rd = this.rows.get(this.player.row);
    if (!rd) return;

    if (rd.type === 'river') {
      const onLog = rd.logs?.some(
        (l) => Math.abs(l.mesh.position.x - this.player.col * this.TILE) < l.halfLen - 0.1
      );
      if (!onLog) {
        this.startSplash();
      }
    } else if (rd.type === 'road') {
      this.checkCarCollision(rd);
    }
  }

  private checkCarCollision(rd: RowData) {
    if (!rd.cars) return;
    const px = this.player.col * this.TILE;
    for (const car of rd.cars) {
      const dx = Math.abs(car.position.x - px);
      if (dx < 0.55) {
        soundEngine.playSquish();
        this.die('car');
        return;
      }
    }
  }

  private startSplash() {
    if (this.splashing || !this.alive) return;
    this.splashing = true;
    this.alive = false;
    this.splashStart = performance.now();
    soundEngine.playSplash();
    if (this.callbacks.onEagleWarning) {
      this.callbacks.onEagleWarning(false);
    }
    this.cleanupEagle();
  }

  private die(reason: DeathReason = 'car') {
    if (this.ended) return;
    this.ended = true;
    this.alive = false;
    this.started = false;

    if (this.callbacks.onEagleWarning) {
      this.callbacks.onEagleWarning(false);
    }
    if (reason !== 'eagle') {
      this.cleanupEagle();
    }

    if (this.bunnyGroup && reason !== 'eagle') {
      this.bunnyGroup.scale.set(1.4, 0.15, 1.4);
    }

    setTimeout(() => {
      this.callbacks.onGameOver(this.score, this.sessionCarrots, reason);
    }, 550);
  }

  /* ============================= EAGLE PREDATOR SYSTEM ============================= */
  private buildEagle(): { group: THREE.Group; wingLeft: THREE.Group; wingRight: THREE.Group; shadow: THREE.Mesh } {
    const group = new THREE.Group();

    // Body: Predatory chocolate/golden brown
    const bodyMat = 0x3d2817;
    const body = this.createBox(0.48, 0.36, 0.72, bodyMat);
    body.position.set(0, 0.18, 0);
    group.add(body);

    // Chest plumage
    const chest = this.createBox(0.44, 0.28, 0.34, 0x5a3d24);
    chest.position.set(0, 0.12, -0.16);
    group.add(chest);

    // Head / Neck: Striking white plumage
    const head = this.createBox(0.36, 0.32, 0.38, 0xf5f5f5);
    head.position.set(0, 0.34, -0.44);
    group.add(head);

    // Golden hooked beak
    const beakBase = this.createBox(0.16, 0.14, 0.22, 0xffa000);
    beakBase.position.set(0, 0.28, -0.68);
    group.add(beakBase);

    const beakTip = this.createCone(0.08, 0.16, 0xff8f00, 4);
    beakTip.rotation.x = Math.PI * 0.75;
    beakTip.position.set(0, 0.2, -0.76);
    group.add(beakTip);

    // Fierce raptor eyes (Golden amber with dark pupils)
    const eyeGeo = new THREE.SphereGeometry(0.042, 8, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
    const pupilGeo = new THREE.SphereGeometry(0.024, 6, 6);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.17, 0.38, -0.48);
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.19, 0.38, -0.5);
    group.add(eyeL);
    group.add(pupilL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.17, 0.38, -0.48);
    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0.19, 0.38, -0.5);
    group.add(eyeR);
    group.add(pupilR);

    // Tail Feathers (Fanned white tail)
    const tail = this.createBox(0.5, 0.06, 0.44, 0xf5f5f5);
    tail.position.set(0, 0.22, 0.5);
    group.add(tail);

    // Left Wing (Pivot at shoulder for flapping)
    const wingLeft = new THREE.Group();
    wingLeft.position.set(-0.24, 0.26, 0);

    const wingLInner = this.createBox(0.85, 0.05, 0.46, bodyMat);
    wingLInner.position.set(-0.42, 0, 0);
    wingLeft.add(wingLInner);

    const wingLOuter = this.createBox(0.6, 0.04, 0.38, 0x22150c);
    wingLOuter.position.set(-1.0, -0.02, 0);
    wingLeft.add(wingLOuter);

    group.add(wingLeft);

    // Right Wing
    const wingRight = new THREE.Group();
    wingRight.position.set(0.24, 0.26, 0);

    const wingRInner = this.createBox(0.85, 0.05, 0.46, bodyMat);
    wingRInner.position.set(0.42, 0, 0);
    wingRight.add(wingRInner);

    const wingROuter = this.createBox(0.6, 0.04, 0.38, 0x22150c);
    wingROuter.position.set(1.0, -0.02, 0);
    wingRight.add(wingROuter);

    group.add(wingRight);

    // Sharp talons extending downward
    const talonL = this.createBox(0.1, 0.18, 0.16, 0xffa000);
    talonL.position.set(-0.14, -0.06, 0.05);
    talonL.rotation.x = -0.3;
    group.add(talonL);

    const talonR = this.createBox(0.1, 0.18, 0.16, 0xffa000);
    talonR.position.set(0.14, -0.06, 0.05);
    talonR.rotation.x = -0.3;
    group.add(talonR);

    // Dynamic ground shadow mesh
    const shadow = this.createShadowBlob(2.4);
    shadow.position.y = 0.02;

    group.scale.set(1.2, 1.2, 1.2);

    return { group, wingLeft, wingRight, shadow };
  }

  private distToSegment2D(
    px: number, pz: number,
    ax: number, az: number,
    bx: number, bz: number
  ): number {
    const dx = bx - ax;
    const dz = bz - az;
    const l2 = dx * dx + dz * dz;
    if (l2 < 0.0001) {
      const ex = px - ax;
      const ez = pz - az;
      return Math.sqrt(ex * ex + ez * ez);
    }
    let t = ((px - ax) * dx + (pz - az) * dz) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = ax + t * dx;
    const projZ = az + t * dz;
    const rx = px - projX;
    const rz = pz - projZ;
    return Math.sqrt(rx * rx + rz * rz);
  }

  public triggerEagleAttack() {
    if (!this.started || !this.alive || this.paused || this.eagleData) return;

    const { group, wingLeft, wingRight, shadow } = this.buildEagle();

    // The player's current ground position is the target center
    const targetX = this.player.x;
    const targetZ = this.player.z;
    const targetPos = new THREE.Vector3(targetX, 0.42, targetZ);

    // Can attack from 4 distinct directions passing directly across/along the player's tile:
    // 0 = Left->Right (+X across player's row)
    // 1 = Right->Left (-X across player's row)
    // 2 = Ahead->Behind (+Z down player's column)
    // 3 = Behind->Ahead (-Z up player's column)
    const dirChoice = Math.floor(Math.random() * 4);
    const dirVector = new THREE.Vector3();

    if (dirChoice === 0) {
      dirVector.set(1, 0, 0); // East
    } else if (dirChoice === 1) {
      dirVector.set(-1, 0, 0); // West
    } else if (dirChoice === 2) {
      dirVector.set(0, 0, 1); // South
    } else {
      dirVector.set(0, 0, -1); // North
    }

    const FLIGHT_HALF_SPAN = 28;
    const startPos = new THREE.Vector3(
      targetX - dirVector.x * FLIGHT_HALF_SPAN,
      8.0,
      targetZ - dirVector.z * FLIGHT_HALF_SPAN
    );
    const endPos = new THREE.Vector3(
      targetX + dirVector.x * FLIGHT_HALF_SPAN,
      8.5,
      targetZ + dirVector.z * FLIGHT_HALF_SPAN
    );

    // Create Warning Corridor on the ground along the exact flight trajectory
    const pathLength = FLIGHT_HALF_SPAN * 2;
    const warningGeo = new THREE.PlaneGeometry(1.6, pathLength);
    warningGeo.rotateX(-Math.PI / 2); // Geometry lies flat in XZ plane with length along Z

    const warningMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const warningMesh = new THREE.Mesh(warningGeo, warningMat);
    warningMesh.position.set(targetX, 0.025, targetZ);
    // Align with dirVector
    warningMesh.rotation.y = Math.atan2(dirVector.x, dirVector.z);
    this.scene.add(warningMesh);

    // Add shadow and eagle to scene
    this.scene.add(shadow);
    group.position.copy(startPos);
    this.scene.add(group);

    // Eagle looks along flight trajectory
    const lookTarget = new THREE.Vector3().addVectors(startPos, dirVector);
    lookTarget.y = startPos.y - 0.3;
    group.lookAt(lookTarget);

    // Screech sound & UI alert
    soundEngine.playEagleScreech();
    if (this.callbacks.onEagleWarning) {
      this.callbacks.onEagleWarning(true);
    }

    // Dynamic difficulty tuning based on carrot count
    let warningTimer = 1.3;
    let flightDuration = 1.5;

    if (this.sessionCarrots >= 8 && this.maxCarrots === 8) {
      // Apex Predator Strike: lightning swoop
      warningTimer = 0.85;
      flightDuration = 1.15;
    } else if (this.sessionCarrots >= 7) {
      // Heightened attack: snappy swoop
      warningTimer = 1.05;
      flightDuration = 1.30;
    }

    this.eagleData = {
      group,
      wingLeft,
      wingRight,
      shadow,
      warningMesh,
      state: 'warning',
      warningTimer,
      flightTime: 0,
      flightDuration,
      startPos,
      targetPos,
      endPos,
      dirVector,
      prevPos: startPos.clone(),
      flappingTimer: 0,
    };
  }

  private updateEagle(dt: number) {
    if (this.eagleUnlocked && !this.eagleData && this.started && this.alive && !this.paused) {
      this.eagleSpawnTimer -= dt;
      if (this.eagleSpawnTimer <= 0) {
        this.triggerEagleAttack();
      }
    }

    if (!this.eagleData) return;
    const eagle = this.eagleData;

    // Wing flapping
    eagle.flappingTimer += dt;
    const flapAngle = Math.sin(eagle.flappingTimer * 18) * 0.38;
    eagle.wingLeft.rotation.z = flapAngle;
    eagle.wingRight.rotation.z = -flapAngle;

    if (eagle.state === 'warning') {
      eagle.warningTimer -= dt;

      if (eagle.warningMesh) {
        const mat = eagle.warningMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.25 + Math.sin(eagle.flappingTimer * 14) * 0.2;
      }

      eagle.group.position.copy(eagle.startPos);
      eagle.shadow.position.set(eagle.startPos.x, 0.02, eagle.startPos.z);
      eagle.shadow.scale.set(0.6, 0.6, 0.6);

      if (eagle.warningTimer <= 0) {
        eagle.state = 'swooping';
        eagle.flightTime = 0;
        eagle.prevPos.copy(eagle.startPos);
        soundEngine.playEagleSwoop();
      }
      return;
    }

    if (eagle.state === 'swooping') {
      eagle.flightTime += dt;
      const t = Math.min(1.0, eagle.flightTime / eagle.flightDuration);

      if (eagle.warningMesh) {
        const mat = eagle.warningMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, mat.opacity - dt * 2.5);
        if (t > 0.4 && eagle.warningMesh.parent) {
          this.scene.remove(eagle.warningMesh);
          eagle.warningMesh.geometry.dispose();
          mat.dispose();
          eagle.warningMesh = null;
          if (this.callbacks.onEagleWarning) {
            this.callbacks.onEagleWarning(false);
          }
        }
      }

      // Smooth horizontal interpolation
      const curX = THREE.MathUtils.lerp(eagle.startPos.x, eagle.endPos.x, t);
      const curZ = THREE.MathUtils.lerp(eagle.startPos.z, eagle.endPos.z, t);

      // Parabolic vertical swoop: exactly touches y = yMin at t = 0.5
      const yStart = eagle.startPos.y;
      const yEnd = eagle.endPos.y;
      const yMin = 0.42; // Low ground height where bunny stands
      const u = t - 0.5;
      const curY = yMin + 4 * u * u * ((1 - t) * yStart + t * yEnd - yMin);

      // Previous frame position for continuous swept-segment collision detection
      const prevX = eagle.prevPos.x;
      const prevY = eagle.prevPos.y;
      const prevZ = eagle.prevPos.z;

      eagle.group.position.set(curX, curY, curZ);
      eagle.prevPos.set(curX, curY, curZ);

      // Ground shadow projection directly beneath eagle
      eagle.shadow.position.set(curX, 0.02, curZ);
      const heightFactor = Math.max(0.1, Math.min(1.0, (curY - 0.4) / 7.0));
      const shadowScale = 1.0 + (1 - heightFactor) * 0.9;
      eagle.shadow.scale.set(shadowScale, shadowScale, shadowScale);
      (eagle.shadow.material as THREE.MeshBasicMaterial).opacity = 0.2 + (1 - heightFactor) * 0.45;

      // Look direction along trajectory
      const nextT = Math.min(1.0, t + 0.03);
      const nextX = THREE.MathUtils.lerp(eagle.startPos.x, eagle.endPos.x, nextT);
      const nextZ = THREE.MathUtils.lerp(eagle.startPos.z, eagle.endPos.z, nextT);
      const nextU = nextT - 0.5;
      const nextY = yMin + 4 * nextU * nextU * ((1 - nextT) * yStart + nextT * yEnd - yMin);
      eagle.group.lookAt(nextX, nextY, nextZ);

      // Continuous Collision Check: when eagle is in the low-altitude danger zone
      if ((curY < 1.7 || prevY < 1.7) && this.alive && !this.ended) {
        // Distance from player to the 2D swept line segment of the eagle this frame
        const dist = this.distToSegment2D(this.player.x, this.player.z, prevX, prevZ, curX, curZ);

        // If player is within snatch radius (~0.85 tile units) of the eagle's flight line
        if (dist < 0.85) {
          // CAUGHT BY EAGLE!
          eagle.state = 'caught';
          soundEngine.playEagleScreech();
          soundEngine.playSquish();
          this.alive = false;
          this.ended = true;
          this.started = false;

          // Attach bunny to eagle talons
          if (this.bunnyGroup) {
            this.bunnyGroup.position.set(0, -0.42, 0);
            this.bunnyGroup.rotation.set(0.3, 0, 0.4);
            eagle.group.add(this.bunnyGroup);
          }

          if (this.callbacks.onEagleWarning) {
            this.callbacks.onEagleWarning(false);
          }

          setTimeout(() => {
            this.callbacks.onGameOver(this.score, this.sessionCarrots, 'eagle');
          }, 700);
          return;
        }
      }

      // Evaded! Completed swoop past the map without hitting player
      if (t >= 1.0) {
        this.cleanupEagle();
        if (this.callbacks.onEagleWarning) {
          this.callbacks.onEagleWarning(false);
        }
        // Next strike scheduled based on harvest stage:
        if (this.sessionCarrots >= 8) {
          // Relentless strikes after collecting 8 carrots (2.2s - 3.8s if 8-carrot game; 3.8s - 5.5s if 9-carrot game)
          this.eagleSpawnTimer = this.maxCarrots === 8
            ? 2.2 + Math.random() * 1.6
            : 3.8 + Math.random() * 1.8;
        } else if (this.sessionCarrots >= 7) {
          // Escalated attack frequency at 7 carrots (4.0s - 6.5s)
          this.eagleSpawnTimer = 4.0 + Math.random() * 2.5;
        } else {
          // Standard interval (14s - 22s)
          this.eagleSpawnTimer = 14.0 + Math.random() * 8.0;
        }
      }
      return;
    }

    if (eagle.state === 'caught') {
      // Ascend into sky along flight direction carrying the bunny
      eagle.group.position.x += eagle.dirVector.x * 16.0 * dt;
      eagle.group.position.z += eagle.dirVector.z * 16.0 * dt;
      eagle.group.position.y += 10.0 * dt;
      eagle.shadow.position.set(eagle.group.position.x, 0.02, eagle.group.position.z);
    }
  }

  private cleanupEagle() {
    if (!this.eagleData) return;
    const { group, shadow, warningMesh } = this.eagleData;
    if (this.scene) {
      if (group && group.parent) this.scene.remove(group);
      if (shadow && shadow.parent) this.scene.remove(shadow);
      if (warningMesh && warningMesh.parent) {
        this.scene.remove(warningMesh);
        warningMesh.geometry.dispose();
        if (warningMesh.material) {
          const mat = warningMesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      }
    }
    this.eagleData = null;
  }

  /* ============================= 9TH GOLDEN CARROT BEACON & RADAR ============================= */
  private spawnNinthGoldenCarrot() {
    if (this.ninthCarrotTarget) return;

    // Pick target row 8 to 11 rows ahead of the player
    const targetRow = this.player.row + 9;

    // Ensure rows ahead are generated
    while (this.farthestGenerated < targetRow + 5) {
      this.generateRow(this.farthestGenerated + 1);
    }

    const rd = this.rows.get(targetRow);
    if (!rd) return;

    // Find an accessible column
    let col = Math.floor(-this.HALF_WIDTH / 2 + Math.random() * (this.HALF_WIDTH + 1));
    if (rd.blocked && rd.blocked.has(col)) {
      for (let c = -this.HALF_WIDTH; c <= this.HALF_WIDTH; c++) {
        if (!rd.blocked.has(c)) {
          col = c;
          break;
        }
      }
    }
    if (rd.blocked) rd.blocked.delete(col);

    const carrotMesh = this.buildCarrot(true);

    // Towering golden beacon column shooting into the sky
    const beaconGeo = new THREE.CylinderGeometry(0.1, 0.35, 26, 12);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 13;
    carrotMesh.add(beacon);

    // Pulsating golden ground beacon halo
    const haloGeo = new THREE.RingGeometry(0.4, 0.75, 16);
    haloGeo.rotateX(-Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffe600,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 0.04;
    carrotMesh.add(halo);

    carrotMesh.position.set(col * this.TILE, 0.05, 0);
    rd.group.add(carrotMesh);

    if (!rd.carrots) rd.carrots = [];
    rd.carrots.push({
      mesh: carrotMesh,
      col,
      baseY: 0.05,
      rotSpeed: 3.5,
      floatOffset: 0,
      isGolden: true,
    });

    const targetX = col * this.TILE;
    const targetZ = -targetRow * this.TILE;

    this.ninthCarrotTarget = {
      row: targetRow,
      col,
      x: targetX,
      z: targetZ,
      mesh: carrotMesh,
    };

    soundEngine.playFanfare();
    this.spawnParticleBurst(targetX, 0.5, targetZ, 0xffd700, 30);
  }

  private clearNinthCarrotRadar() {
    this.ninthCarrotTarget = null;
    if (this.callbacks.onNinthCarrotRadar) {
      this.callbacks.onNinthCarrotRadar(null);
    }
  }

  private updateNinthCarrotRadar() {
    if (!this.ninthCarrotTarget || !this.callbacks.onNinthCarrotRadar) return;

    if (!this.alive || this.ended || !this.started) {
      this.callbacks.onNinthCarrotRadar(null);
      return;
    }

    const dx = this.ninthCarrotTarget.x - this.player.x;
    const dz = this.ninthCarrotTarget.z - this.player.z;
    const distHops = Math.max(1, Math.round(Math.hypot(dx, dz) / this.TILE));
    const angleRad = Math.atan2(dx, -dz);
    const angleDeg = Math.round(angleRad * (180 / Math.PI));

    this.callbacks.onNinthCarrotRadar({
      active: true,
      distanceHops: distHops,
      angleDeg,
    });
  }

  /* ============================= ANIMATION & LOOP ============================= */
  private updateDifficulty(dt: number) {
    if (!this.started || !this.alive || this.paused) return;

    this.playDuration += dt;
    const newLevel = 1 + Math.floor(this.playDuration / 10);
    const newMultiplier = 1.0 + (newLevel - 1) * 0.05;

    if (newLevel !== this.currentDifficultyLevel) {
      this.currentDifficultyLevel = newLevel;
      this.difficultyMultiplier = newMultiplier;
      if (this.callbacks.onDifficultyUpdate) {
        this.callbacks.onDifficultyUpdate(newLevel, Number(newMultiplier.toFixed(2)));
      }
    }
  }

  private updateHop(now: number) {
    if (!this.hopping) return;
    const t = Math.min(1, (now - this.hopStart) / this.HOP_DURATION);
    const ease = t; // linear horizontal

    const x = this.hopFrom.x + (this.hopTo.x - this.hopFrom.x) * ease;
    const z = this.hopFrom.z + (this.hopTo.z - this.hopFrom.z) * ease;
    const hopHeight = Math.sin(Math.PI * t) * 0.42;

    this.player.x = x;
    this.player.z = z;
    this.bunnyGroup.position.set(x, hopHeight, z);

    // Smooth rotation towards facing direction
    const targetRot = this.player.facing;
    let curRot = this.bunnyGroup.rotation.y;
    let diff = targetRot - curRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.bunnyGroup.rotation.y = curRot + diff * 0.6;

    // Squash & stretch on ears/body via scale
    const squash = 1 - Math.sin(Math.PI * t) * 0.12;
    this.bunnyGroup.scale.set(1 / squash, squash, 1 / squash);

    if (t >= 1) {
      this.hopping = false;
      this.bunnyGroup.position.set(x, 0, z);
      this.bunnyGroup.scale.set(1, 1, 1);
      this.bunnyGroup.rotation.y = targetRot;
      this.checkLanding();
    }
  }

  private updateRows(dt: number, now: number) {
    this.rows.forEach((rd) => {
      // Rotate and float carrots
      if (rd.carrots) {
        rd.carrots.forEach((c) => {
          c.mesh.rotation.y += c.rotSpeed * dt;
          const floatY = Math.sin(now * 0.004 + c.floatOffset) * 0.06;
          c.mesh.position.y = c.baseY + floatY;
        });
      }

      if (rd.type === 'road' && rd.cars) {
        rd.cars.forEach((car) => {
          car.position.x += (rd.speed || 1) * dt;
          if ((rd.speed || 1) > 0 && car.position.x > this.ROAD_BOUND) car.position.x = -this.ROAD_BOUND;
          if ((rd.speed || 1) < 0 && car.position.x < -this.ROAD_BOUND) car.position.x = this.ROAD_BOUND;
        });

        if (rd.index === this.player.row && !this.hopping && this.alive) {
          this.checkCarCollision(rd);
        }
      } else if (rd.type === 'river' && rd.logs) {
        rd.logs.forEach((l) => {
          l.mesh.position.x += (rd.speed || 1) * dt;
          if ((rd.speed || 1) > 0 && l.mesh.position.x > this.RIVER_BOUND) l.mesh.position.x = -this.RIVER_BOUND;
          if ((rd.speed || 1) < 0 && l.mesh.position.x < -this.RIVER_BOUND) l.mesh.position.x = this.RIVER_BOUND;
        });

        if (rd.index === this.player.row && !this.hopping && this.alive) {
          const onLog = rd.logs.find(
            (l) => Math.abs(l.mesh.position.x - this.player.col * this.TILE) < l.halfLen - 0.1
          );
          if (onLog) {
            this.player.x += (rd.speed || 1) * dt;
            this.bunnyGroup.position.x = this.player.x;
            this.player.col = this.player.x / this.TILE;

            if (this.player.col < -this.HALF_WIDTH - 1.2 || this.player.col > this.HALF_WIDTH + 1.2) {
              this.startSplash();
            }
          } else {
            this.startSplash();
          }
        }
      }
    });
  }

  private updateSplash(now: number) {
    if (!this.splashing) return;
    const t = (now - this.splashStart) / 500;
    if (t < 1) {
      this.bunnyGroup.position.y = -t * 0.6;
      this.bunnyGroup.scale.set(1 - t * 0.3, 1 - t * 0.5, 1 - t * 0.3);
      this.bunnyGroup.rotation.x = t * 0.5;
    } else {
      this.splashing = false;
      this.die('water');
    }
  }

  private updateCamera() {
    // Straight view camera: tracks player horizontally and looks straight forward along Z
    const targetX = this.bunnyGroup.position.x * 0.65;
    const targetZ = this.player.z;
    const camTargetPos = new THREE.Vector3(
      targetX + this.CAM_OFFSET.x,
      this.CAM_OFFSET.y,
      targetZ + this.CAM_OFFSET.z
    );
    this.camera.position.lerp(camTargetPos, 0.12);
    this.camera.lookAt(targetX, 0.4, targetZ - 4.5);
  }

  private idleAnim(dt: number) {
    this.earFlapTimer += dt;
    if (!this.hopping && !this.splashing && this.alive) {
      const bob = Math.sin(this.earFlapTimer * 3) * 0.02;
      this.bunnyGroup.position.y = Math.max(0, bob);
    }
  }

  private startLoop() {
    const render = (now: number) => {
      this.animFrameId = requestAnimationFrame(render);
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;

      if (!this.paused) {
        if (this.started && this.alive) {
          this.updateDifficulty(dt);
          this.updateHop(now);
          if (!this.hopping) this.idleAnim(dt);
          this.updateRows(dt, now);
          this.updateEagle(dt);
          this.updateNinthCarrotRadar();
        } else if (this.splashing) {
          this.updateSplash(now);
          this.updateRows(dt * 0.3, now);
        } else {
          this.idleAnim(dt);
          this.updateRows(dt * 0.6, now); // keep ambient motion on menus
        }
        if (this.eagleData?.state === 'caught') {
          this.updateEagle(dt);
        }
        this.updateParticles(dt);
      }

      this.updateCamera();
      this.renderer.render(this.scene, this.camera);
    };

    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(render);
  }

  /* ============================= RESIZE & CLEANUP ============================= */
  private bindEvents() {
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      const aspect = width / Math.max(1, height);

      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
    this.resizeObserver.observe(this.container);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.cleanupEagle();
    this.clearNinthCarrotRadar();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else (mat as THREE.Material).dispose();
      }
    });
    this.scene.clear();
    this.rows.clear();
    this.particles = [];
    if (this.renderer) {
      if (this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.forceContextLoss();
      this.renderer.dispose();
    }
  }
}
