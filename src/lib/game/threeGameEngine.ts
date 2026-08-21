import * as THREE from 'three';
import { BUNNY_SKINS, BunnySkin } from './types';
import { soundEngine } from './soundEngine';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onCarrotCollected: (isGolden: boolean, totalSession: number, screenPos: { x: number; y: number }) => void;
  onGameOver: (finalScore: number, sessionCarrots: number, goldenCarrots: number) => void;
  onDifficultyUpdate?: (level: number, multiplier: number) => void;
  onGameStart?: () => void;
}

interface RowCarrot {
  mesh: THREE.Group;
  col: number;
  isGolden: boolean;
  baseY: number;
  rotSpeed: number;
  floatOffset: number;
  attachedToLog?: THREE.Group;
  logOffset?: number;
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

  // Constants
  private readonly TILE = 1;
  private readonly HALF_WIDTH = 7;
  private readonly ROW_LOOKAHEAD = 28;
  private readonly ROW_KEEP_BEHIND = 7;
  private readonly HOP_DURATION = 135; // ms
  private readonly CAM_OFFSET = new THREE.Vector3(-8.5, 11.2, 12.8);

  // Colors
  private readonly COLORS = {
    grass1: 0x8fd35a,
    grass2: 0x7fc94e,
    road: 0x3d3e47,
    roadStripe: 0xf5e04a,
    river: 0x48bfe3,
    riverDeep: 0x0096c7,
    log: 0x9c6644,
    logDark: 0x7f4f24,
    treeTrunk: 0x7f4f24,
    treeLeaf1: 0x38b000,
    treeLeaf2: 0x70e000,
    shadow: 0x000000,
    carrotOrange: 0xff6b00,
    carrotGreen: 0x38b000,
    goldenCarrot: 0xffd000,
  };

  private readonly CAR_COLORS = [
    0xff4d6d, 0xffb703, 0x00b4d8, 0x7209b7, 0xf77f00, 0x06d6a0, 0xff006e, 0x4cc9f0
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
  private sessionGoldenCarrots = 0;

  // Time-based Difficulty Scaling (every 5 seconds)
  private playDuration = 0; // in seconds
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
  }

  /* ============================= INITIALIZATION ============================= */
  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0e7e5);
    this.scene.fog = new THREE.Fog(0xa0e7e5, 26, 48);

    const aspect = this.container.clientWidth / (this.container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.camera.position.copy(this.CAM_OFFSET);
    this.camera.lookAt(0, 0.3, -1.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = false;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x88bb77, 0.95);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 0.9);
    sunLight.position.set(-8, 14, 9);
    this.scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
  }

  private initParticleSystem() {
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
  }

  /* ============================= 3D MODEL BUILDERS ============================= */
  private createBox(w: number, h: number, d: number, color: number): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });
    return new THREE.Mesh(geo, mat);
  }

  private createCylinder(r1: number, r2: number, h: number, color: number, seg: number = 8): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(r1, r2, h, seg);
    const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });
    return new THREE.Mesh(geo, mat);
  }

  private createSphere(r: number, color: number, seg: number = 8): THREE.Mesh {
    const geo = new THREE.SphereGeometry(r, seg, Math.max(6, Math.floor(seg * 0.75)));
    const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });
    return new THREE.Mesh(geo, mat);
  }

  private createShadowBlob(scale: number = 1): THREE.Mesh {
    const geo = new THREE.CircleGeometry(0.38 * scale, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: this.COLORS.shadow,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.01;
    return mesh;
  }

  /**
   * Build 3D Bunny with the current skin
   * IMPORTANT: The bunny's face is oriented towards -Z (forward / towards obstacles ahead)
   * so rotation.y = 0 points the bunny forward into the obstacle road!
   */
  private initBunny() {
    if (this.bunnyGroup) {
      this.scene.remove(this.bunnyGroup);
    }

    const g = new THREE.Group();
    const colors = this.currentSkin.colors;

    // Body
    const body = this.createBox(0.52, 0.42, 0.62, colors.body);
    body.position.y = 0.32;
    g.add(body);

    // Head (facing -Z / forward)
    const head = this.createBox(0.42, 0.38, 0.42, colors.body);
    head.position.set(0, 0.64, -0.2);
    g.add(head);

    // Left Ear (facing -Z)
    const earL = this.createBox(0.12, 0.48, 0.1, colors.body);
    earL.position.set(-0.11, 1.02, -0.16);
    earL.rotation.z = 0.12;
    g.add(earL);

    const earLin = this.createBox(0.06, 0.34, 0.02, colors.earInner);
    earLin.position.set(-0.11, 0.98, -0.21);
    earLin.rotation.z = 0.12;
    g.add(earLin);

    // Right Ear (facing -Z)
    const earR = this.createBox(0.12, 0.48, 0.1, colors.body);
    earR.position.set(0.11, 1.02, -0.16);
    earR.rotation.z = -0.12;
    g.add(earR);

    const earRin = this.createBox(0.06, 0.34, 0.02, colors.earInner);
    earRin.position.set(0.11, 0.98, -0.21);
    earRin.rotation.z = -0.12;
    g.add(earRin);

    // Nose (snout at -Z / forward)
    const nose = this.createSphere(0.065, colors.nose, 8);
    nose.position.set(0, 0.6, -0.42);
    g.add(nose);

    // Eyes (looking along -Z / forward towards the obstacles)
    const eyeL = this.createSphere(0.045, colors.eyes, 8);
    eyeL.position.set(-0.14, 0.68, -0.41);
    g.add(eyeL);

    const eyeR = this.createSphere(0.045, colors.eyes, 8);
    eyeR.position.set(0.14, 0.68, -0.41);
    g.add(eyeR);

    // Tail (fluffy sphere at +Z / rear)
    const tail = this.createSphere(0.11, colors.tail, 8);
    tail.position.set(0, 0.36, 0.32);
    g.add(tail);

    // Front Feet (towards -Z / front)
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
        opacity: 0.5,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.03;
      g.add(aura);
    }

    // Shadow
    const shadow = this.createShadowBlob(1.1);
    g.add(shadow);

    this.bunnyGroup = g;
    this.scene.add(this.bunnyGroup);
  }

  /** Build 3D Collectible Carrot */
  private buildCarrot(isGolden: boolean = false): THREE.Group {
    const group = new THREE.Group();

    const bodyColor = isGolden ? this.COLORS.goldenCarrot : this.COLORS.carrotOrange;
    const leafColor = isGolden ? 0x00f5d4 : this.COLORS.carrotGreen;

    // Carrot Root (Cone tapering downwards)
    const coneGeo = new THREE.ConeGeometry(0.14, 0.42, 7);
    const coneMat = new THREE.MeshLambertMaterial({
      color: bodyColor,
      flatShading: true,
      emissive: isGolden ? 0x554400 : 0x221100,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI; // Point down
    coneMesh.position.y = 0.22;
    group.add(coneMesh);

    // Green Carrot Stems / Leaves on Top
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leafGeo = new THREE.BoxGeometry(0.04, 0.16, 0.04);
      const leafMat = new THREE.MeshLambertMaterial({ color: leafColor, flatShading: true });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(Math.cos(angle) * 0.04, 0.48, Math.sin(angle) * 0.04);
      leaf.rotation.z = (Math.cos(angle) * Math.PI) / 8;
      leaf.rotation.x = (Math.sin(angle) * Math.PI) / 8;
      group.add(leaf);
    }

    // Floating Ground Halo
    const haloGeo = new THREE.RingGeometry(0.18, 0.26, 12);
    const haloMat = new THREE.MeshBasicMaterial({
      color: isGolden ? 0xffea00 : 0xff9100,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.02;
    group.add(halo);

    group.scale.set(1.1, 1.1, 1.1);
    return group;
  }

  /** Build 3D Car */
  private buildCar(color: number): THREE.Group {
    const g = new THREE.Group();
    const isTruck = Math.random() < 0.25;

    if (!isTruck) {
      // Sporty / Regular Sedan
      const body = this.createBox(0.92, 0.32, 0.62, color);
      body.position.y = 0.2;
      g.add(body);

      const cabin = this.createBox(0.52, 0.24, 0.56, 0xffffff);
      cabin.position.set(-0.06, 0.43, 0);
      g.add(cabin);

      // Headlights
      const lightGeo = new THREE.BoxGeometry(0.04, 0.08, 0.12);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xfffa65 });
      const hl1 = new THREE.Mesh(lightGeo, lightMat);
      hl1.position.set(0.46, 0.22, 0.18);
      g.add(hl1);
      const hl2 = new THREE.Mesh(lightGeo, lightMat);
      hl2.position.set(0.46, 0.22, -0.18);
      g.add(hl2);
    } else {
      // Delivery Van / Pickup Truck
      const body = this.createBox(1.15, 0.38, 0.65, color);
      body.position.y = 0.24;
      g.add(body);

      const cargo = this.createBox(0.7, 0.42, 0.62, 0xefefef);
      cargo.position.set(-0.18, 0.58, 0);
      g.add(cargo);

      const cabin = this.createBox(0.35, 0.3, 0.58, 0x222222);
      cabin.position.set(0.32, 0.52, 0);
      g.add(cabin);
    }

    // Wheels
    const wheelPositions = [
      [-0.3, 0.08, 0.33],
      [0.3, 0.08, 0.33],
      [-0.3, 0.08, -0.33],
      [0.3, 0.08, -0.33],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = this.createCylinder(0.12, 0.12, 0.1, 0x222222, 10);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      g.add(wheel);
    });

    const sh = this.createShadowBlob(1.5);
    g.add(sh);

    return g;
  }

  /** Build 3D Floating Log */
  private buildLog(len: number): THREE.Group {
    const g = new THREE.Group();
    const main = this.createCylinder(0.24, 0.24, len, this.COLORS.log, 10);
    main.rotation.z = Math.PI / 2;
    g.add(main);

    // Rings on ends
    const endGeo = new THREE.CircleGeometry(0.24, 10);
    const endMat = new THREE.MeshLambertMaterial({ color: this.COLORS.logDark });

    const capL = new THREE.Mesh(endGeo, endMat);
    capL.rotation.y = Math.PI / 2;
    capL.position.x = -len / 2;
    g.add(capL);

    const capR = new THREE.Mesh(endGeo, endMat);
    capR.rotation.y = -Math.PI / 2;
    capR.position.x = len / 2;
    g.add(capR);

    return g;
  }

  /** Build Tree for Grass Lanes */
  private buildTree(): THREE.Group {
    const tree = new THREE.Group();
    const isPine = Math.random() < 0.5;

    const trunk = this.createCylinder(0.09, 0.12, 0.36, this.COLORS.treeTrunk, 6);
    trunk.position.y = 0.18;
    tree.add(trunk);

    if (isPine) {
      const coneGeo1 = new THREE.ConeGeometry(0.36, 0.6, 7);
      const leafMat = new THREE.MeshLambertMaterial({ color: this.COLORS.treeLeaf1, flatShading: true });
      const leaf1 = new THREE.Mesh(coneGeo1, leafMat);
      leaf1.position.y = 0.6;
      tree.add(leaf1);

      const coneGeo2 = new THREE.ConeGeometry(0.26, 0.45, 7);
      const leaf2 = new THREE.Mesh(coneGeo2, leafMat);
      leaf2.position.y = 0.85;
      tree.add(leaf2);
    } else {
      const top1 = this.createSphere(0.28, this.COLORS.treeLeaf1, 8);
      top1.position.y = 0.52;
      tree.add(top1);

      const top2 = this.createSphere(0.22, this.COLORS.treeLeaf2, 8);
      top2.position.set(0.08, 0.68, 0.05);
      tree.add(top2);
    }

    const sh = this.createShadowBlob(1.1);
    tree.add(sh);

    return tree;
  }

  /* ============================= WORLD GENERATION ============================= */
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
      // Difficulty scaling with row distance and time
      const riverChance = Math.min(0.35, 0.14 + index * 0.0025 + (this.difficultyMultiplier - 1) * 0.05);
      const roadChance = Math.min(0.45, 0.30 + index * 0.0025 + (this.difficultyMultiplier - 1) * 0.05);

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

    // Terrain ground mesh
    const w = this.HALF_WIDTH * 2 + 3;
    let groundColor: number;
    if (type === 'grass') {
      groundColor = index % 2 === 0 ? this.COLORS.grass1 : this.COLORS.grass2;
    } else if (type === 'road') {
      groundColor = this.COLORS.road;
    } else {
      groundColor = this.COLORS.river;
    }

    const terrain = this.createBox(w, 0.4, this.TILE * 0.98, groundColor);
    terrain.position.y = -0.2;
    group.add(terrain);

    // Dashed road stripes
    if (type === 'road' && index % 2 === 0) {
      for (let s = -this.HALF_WIDTH; s <= this.HALF_WIDTH; s += 2) {
        const stripe = this.createBox(0.8, 0.01, 0.08, this.COLORS.roadStripe);
        stripe.position.set(s, 0.005, 0);
        group.add(stripe);
      }
    }

    const rowData: RowData = { index, type, group };

    if (type === 'grass') {
      rowData.blocked = new Set();
      rowData.carrots = [];

      // Trees
      const treeCount = Math.random() < 0.6 ? Math.floor(1 + Math.random() * 3) : 0;
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

      // Spawn Carrots on Grass (38% chance per row if not start tile)
      if (index > 0 && Math.random() < 0.38) {
        const carrotCol = Math.floor(-this.HALF_WIDTH + Math.random() * (this.HALF_WIDTH * 2 + 1));
        if (!rowData.blocked.has(carrotCol)) {
          const isGolden = Math.random() < 0.12;
          const carrotMesh = this.buildCarrot(isGolden);
          carrotMesh.position.set(carrotCol * this.TILE, 0.05, 0);
          group.add(carrotMesh);

          rowData.carrots.push({
            mesh: carrotMesh,
            col: carrotCol,
            isGolden,
            baseY: 0.05,
            rotSpeed: isGolden ? 3.5 : 2.0,
            floatOffset: Math.random() * Math.PI * 2,
          });
        }
      }
    } else if (type === 'road') {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const speed = (1.8 + Math.random() * 1.0 + Math.min(index * 0.01, 1.6)) * dir;
      const gap = Math.max(2.8, (3.5 + Math.random() * 2.0) / Math.max(1, this.difficultyMultiplier * 0.85));

      rowData.dir = dir;
      rowData.speed = speed;
      rowData.cars = [];

      const count = Math.floor((this.HALF_WIDTH * 2) / gap) + 1;
      const pos = -this.HALF_WIDTH + Math.random() * 2;
      const color = this.CAR_COLORS[Math.floor(Math.random() * this.CAR_COLORS.length)];

      for (let i = 0; i < count; i++) {
        const car = this.buildCar(color);
        const x = ((pos + i * gap) % (this.HALF_WIDTH * 2 + 2)) - this.HALF_WIDTH - 1;
        car.position.set(x, 0.22, 0);
        if (dir < 0) car.rotation.y = Math.PI;
        group.add(car);
        rowData.cars.push(car);
      }
    } else if (type === 'river') {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const speed = (1.2 + Math.random() * 0.8 + Math.min(index * 0.008, 1.0)) * dir;
      const gap = 2.6 + Math.random() * 1.4;

      rowData.dir = dir;
      rowData.speed = speed;
      rowData.logs = [];
      rowData.carrots = [];

      const count = Math.floor((this.HALF_WIDTH * 2) / gap) + 2;
      const pos = -this.HALF_WIDTH + Math.random() * 2;
      const logLen = 1.8 + Math.random() * 1.0;

      for (let i = 0; i < count; i++) {
        const log = this.buildLog(logLen);
        const x = ((pos + i * gap) % (this.HALF_WIDTH * 2 + 4)) - this.HALF_WIDTH - 2;
        log.position.set(x, 0.02, 0);
        group.add(log);
        rowData.logs.push({ mesh: log, halfLen: logLen / 2 });

        // Rare carrot floating on top of a log
        if (Math.random() < 0.2) {
          const isGolden = Math.random() < 0.18;
          const carrotMesh = this.buildCarrot(isGolden);
          carrotMesh.position.set(0, 0.24, 0);
          log.add(carrotMesh);

          rowData.carrots.push({
            mesh: carrotMesh,
            col: 0,
            isGolden,
            baseY: 0.24,
            rotSpeed: 2.5,
            floatOffset: Math.random() * Math.PI * 2,
            attachedToLog: log,
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
      this.bunnyGroup.position.set(0, 0, 0);
      this.bunnyGroup.rotation.y = 0; // facing forward towards -Z / obstacles
      this.bunnyGroup.scale.set(1, 1, 1);
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
    this.sessionGoldenCarrots = 0;
    this.callbacks.onScoreUpdate(0);
    if (this.callbacks.onDifficultyUpdate) {
      this.callbacks.onDifficultyUpdate(1, 1.0);
    }

    for (let i = -2; i <= this.ROW_LOOKAHEAD; i++) {
      this.generateRow(i);
    }
  }

  public start() {
    this.started = true;
    this.alive = true;
    this.ended = false;
    this.paused = false;
    this.playDuration = 0;
    this.difficultyMultiplier = 1.0;
    this.currentDifficultyLevel = 1;
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

    /**
     * Orientation mapping:
     * Model default (rot=0) faces -Z (forward into obstacles).
     * UP (forward): targetFacing = 0
     * DOWN (backward towards player): targetFacing = Math.PI
     * LEFT (towards -X): targetFacing = Math.PI / 2
     * RIGHT (towards +X): targetFacing = -Math.PI / 2
     */
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

    // Bounds check
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

    // Cleanup old rows behind
    const cleanupBefore = newRow - this.ROW_KEEP_BEHIND;
    Array.from(this.rows.keys()).forEach((k) => {
      if (k < cleanupBefore) this.removeRow(k);
    });
  }

  /* ============================= CARROT PICKUP SYSTEM ============================= */
  private checkCarrotCollection(rowIndex: number, colIndex: number) {
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
        const isGolden = carrot.isGolden;
        if (isGolden) {
          this.sessionGoldenCarrots += 1;
          this.sessionCarrots += 5;
          soundEngine.playGoldenCarrot();
          this.spawnParticleBurst(playerX, 0.4, -rowIndex * this.TILE, 0xffd700, 18);
        } else {
          this.sessionCarrots += 1;
          soundEngine.playCarrot();
          this.spawnParticleBurst(playerX, 0.4, -rowIndex * this.TILE, 0xff7a00, 12);
        }

        const carrotWorldPos = new THREE.Vector3(playerX, 0.5, -rowIndex * this.TILE);
        carrotWorldPos.project(this.camera);
        const screenX = ((carrotWorldPos.x + 1) * this.container.clientWidth) / 2;
        const screenY = ((-carrotWorldPos.y + 1) * this.container.clientHeight) / 2;

        this.callbacks.onCarrotCollected(isGolden, this.sessionCarrots, { x: screenX, y: screenY });

        if (carrot.attachedToLog) {
          carrot.attachedToLog.remove(carrot.mesh);
        } else {
          rd.group.remove(carrot.mesh);
        }
        rd.carrots.splice(i, 1);
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
        (l) => Math.abs(l.mesh.position.x - this.player.col * this.TILE) < l.halfLen - 0.08
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
      if (dx < 0.6) {
        soundEngine.playSquish();
        this.die();
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
  }

  private die() {
    if (this.ended) return;
    this.ended = true;
    this.alive = false;

    if (this.bunnyGroup) {
      this.bunnyGroup.scale.set(1.4, 0.15, 1.4);
    }

    setTimeout(() => {
      this.callbacks.onGameOver(this.score, this.sessionCarrots, this.sessionGoldenCarrots);
    }, 600);
  }

  /* ============================= ANIMATION & DIFFICULTY LOOP ============================= */
  private updateDifficulty(dt: number) {
    if (!this.started || !this.alive || this.paused) return;

    this.playDuration += dt;
    // Every 5 seconds, difficulty level increases and multiplier goes up +8%
    const newLevel = 1 + Math.floor(this.playDuration / 5);
    const newMultiplier = 1.0 + (newLevel - 1) * 0.08;

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

    const x = this.hopFrom.x + (this.hopTo.x - this.hopFrom.x) * t;
    const z = this.hopFrom.z + (this.hopTo.z - this.hopFrom.z) * t;
    const hopHeight = Math.sin(Math.PI * t) * 0.45;

    this.player.x = x;
    this.player.z = z;
    this.bunnyGroup.position.set(x, hopHeight, z);

    // Smooth rotation towards facing direction
    const targetRot = this.player.facing;
    let curRot = this.bunnyGroup.rotation.y;
    let diff = targetRot - curRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.bunnyGroup.rotation.y = curRot + diff * 0.55;

    const squash = 1 - Math.sin(Math.PI * t) * 0.14;
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
    const effectiveDt = dt * this.difficultyMultiplier;

    this.rows.forEach((rd) => {
      // Rotate and float Carrots
      if (rd.carrots) {
        rd.carrots.forEach((c) => {
          c.mesh.rotation.y += c.rotSpeed * dt;
          const floatY = Math.sin(now * 0.004 + c.floatOffset) * 0.08;
          c.mesh.position.y = c.baseY + floatY;
        });
      }

      if (rd.type === 'road' && rd.cars) {
        rd.cars.forEach((car) => {
          car.position.x += (rd.speed || 1) * effectiveDt;
          const bound = this.HALF_WIDTH + 1.6;
          if ((rd.speed || 1) > 0 && car.position.x > bound) car.position.x = -bound;
          if ((rd.speed || 1) < 0 && car.position.x < -bound) car.position.x = bound;
        });

        if (rd.index === this.player.row && !this.hopping && this.alive) {
          this.checkCarCollision(rd);
        }
      } else if (rd.type === 'river' && rd.logs) {
        rd.logs.forEach((l) => {
          l.mesh.position.x += (rd.speed || 1) * effectiveDt;
          const bound = this.HALF_WIDTH + 2.5;
          if ((rd.speed || 1) > 0 && l.mesh.position.x > bound) l.mesh.position.x = -bound;
          if ((rd.speed || 1) < 0 && l.mesh.position.x < -bound) l.mesh.position.x = bound;
        });

        if (rd.index === this.player.row && !this.hopping && this.alive) {
          const onLog = rd.logs.find(
            (l) => Math.abs(l.mesh.position.x - this.player.col * this.TILE) < l.halfLen - 0.08
          );
          if (onLog) {
            this.player.x += (rd.speed || 1) * effectiveDt;
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
    const t = (now - this.splashStart) / 480;
    if (t < 1) {
      this.bunnyGroup.position.y = -t * 0.7;
      this.bunnyGroup.scale.set(1 - t * 0.35, 1 - t * 0.5, 1 - t * 0.35);
      this.bunnyGroup.rotation.x = t * 0.6;
    } else {
      this.splashing = false;
      this.die();
    }
  }

  private updateCamera() {
    const targetX = this.bunnyGroup.position.x * 0.32;
    const targetZ = this.player.z;
    const camTargetPos = new THREE.Vector3(
      targetX + this.CAM_OFFSET.x * 0.55,
      this.CAM_OFFSET.y,
      targetZ + this.CAM_OFFSET.z
    );
    this.camera.position.lerp(camTargetPos, 0.12);
    this.camera.lookAt(targetX, 0.3, targetZ - 1.5);
  }

  private idleAnim(dt: number) {
    this.earFlapTimer += dt;
    if (!this.hopping && !this.splashing && this.alive) {
      const bob = Math.sin(this.earFlapTimer * 3.5) * 0.02;
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
          this.idleAnim(dt);
          this.updateRows(dt, now);
        } else if (this.splashing) {
          this.updateSplash(now);
          this.updateRows(dt * 0.3, now);
        } else {
          this.idleAnim(dt);
          this.updateRows(dt * 0.6, now);
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
      const width = this.container.clientWidth;
      const height = this.container.clientHeight || 1;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
    this.resizeObserver.observe(this.container);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
