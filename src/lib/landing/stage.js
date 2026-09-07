import * as THREE from 'three';
import { createRenderer } from './renderer.js';
import { vert, frag } from './shaders/ground.js';
import { journey } from './journey.js';
import { beatAt, watchBeats } from './scroll/beats.js';
import { rgb } from './lib/tokens.js';
import { readGroundCSS } from './lib/ground-css.js';

const v3 = a => new THREE.Vector3(...a);

export function mountStage({ canvas, ui, state, onFrame }){
  const spec = readGroundCSS(ui);
  if (!spec){
    console.warn('[stage] figma-ground.css has a shape this shader does not know; the DOM keeps the ground');
    return null;
  }

  let gl;
  try { gl = createRenderer(canvas); }
  catch (e){ console.warn('[stage] no WebGL; the DOM keeps the ground', e); return null; }
  const { renderer, scene, camera } = gl;

  const uniforms = {
    uRes:        { value: new THREE.Vector2(innerWidth, innerHeight) },
    uPage:       { value: new THREE.Vector2(ui.clientWidth, ui.scrollHeight) },
    uScroll:     { value: 0 },
    uTime:       { value: 0 },
    uBase:       { value: v3(spec.base) },
    uLinCol:     { value: spec.linear.map(s => v3(s.color)) },
    uLinAt:      { value: spec.linear.map(s => s.at) },
    uRadGeo:     { value: spec.radials.map(r => new THREE.Vector4(r.rx, r.ry, r.cx, r.cy)) },
    uRadCol:     { value: spec.radials.map(r => v3(r.color)) },
    uRadStop:    { value: spec.radials.map(r => r.stop) },
    uNear:       { value: v3(rgb('--pink')) },
    uDepth:      { value: 0 },

    uLayerGain:  { value: 0 }
  };

  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false })
  ));

  ui.style.background = 'transparent';
  canvas.addEventListener('webglcontextlost', () => { ui.style.background = ''; }, { once:true });

  let beats = [];
  watchBeats(b => {
    beats = b;
    uniforms.uPage.value.set(ui.clientWidth, ui.scrollHeight);
    uniforms.uRes.value.set(innerWidth, innerHeight);
  });

  const BUDGET = 14;
  let samples = [], lastT = 0, level = 0;
  function shed(){
    level++;
    if (level === 1){ uniforms.uLayerGain.value = 0; console.warn('[stage] shedding: depth forms off'); }
    if (level === 2){
      ui.style.background = '';
      canvas.style.display = 'none';
      renderer.dispose();
      stage.stopped = true;
      console.warn('[stage] shedding: shader off, the DOM paints the ground');
    }
  }
  function watch(t){
    if (lastT && Math.abs(state.velocity) > 0.5) samples.push(t - lastT);
    lastT = t;
    if (samples.length >= 120){
      const s = samples.slice().sort((a, b) => a - b);
      const p50 = s[s.length >> 1];
      samples = [];
      if (p50 > BUDGET) shed();
    }
  }
  function stop(){ level = 1; shed(); }

  let last = { id:'top', local:0, index:0 };
  const stage = { uniforms, renderer, beat: () => last, beats: () => beats, override: null, stopped: false, level: () => level,

    dispose(){ stage.stopped = true; renderer.dispose(); renderer.forceContextLoss(); ui.style.background = ''; } };
  onFrame(t => {
    if (stage.stopped) return;
    watch(t);
    const beat = beats.length ? beatAt(beats, state.progress) : last;
    last = beat;
    const j = stage.override || journey(state.progress, beats);
    uniforms.uScroll.value = state.scroll;
    uniforms.uTime.value   = t * 0.001;
    uniforms.uDepth.value  = j.depth;
    renderer.render(scene, camera);
  });

  return stage;
}
