import { isFrozen, onFreezeChange } from './freeze.js';

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
varying vec2 uv;
uniform sampler2D texA, texB;
uniform vec4 fitA, fitB;
uniform float progress;
uniform float aspect;

float hash(vec2 v){ return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 v){
  vec2 i = floor(v), f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

vec4 sample(sampler2D t, vec4 fit, vec2 c){
  vec2 q = (c - 0.5) / fit.xy + 0.5 + fit.zw;
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return vec4(0.0);
  return texture2D(t, q);
}

void main(){
  vec2 c = uv;

  float snap = 1.0 - abs(progress * 2.0 - 1.0);
  snap = snap * snap * snap;

  vec2 cs = (c - 0.5) / (1.0 + snap * 0.16) + 0.5;

  vec2 n = vec2(noise(vec2(c.x * 6.0 * aspect, c.y * 6.0) + progress * 1.7),
                noise(vec2(c.y * 5.0 + 4.3, c.x * 5.0 * aspect - 2.1) - progress * 1.3));
  vec2 flow = (n - 0.5) * 2.0;

  float out_ = progress;
  float in_  = 1.0 - progress;
  float amp  = 0.16;

  vec4 a = sample(texA, fitA, cs + flow * amp * out_ * out_);
  vec4 b = sample(texB, fitB, cs - flow * amp * in_  * in_);

  float edge = smoothstep(0.0, 1.0, progress * 1.45 - 0.22
                                    + (n.x - 0.5) * 0.42 + (c.x - 0.5) * 0.30);
  float k = clamp(edge, 0.0, 1.0);

  vec4 col = mix(a, b, k);

  if (snap > 0.02){
    float sh = snap * 0.012;
    vec4 aR = sample(texA, fitA, cs + vec2(sh, 0.0) + flow * amp * out_ * out_);
    vec4 bR = sample(texB, fitB, cs + vec2(sh, 0.0) - flow * amp * in_ * in_);
    vec4 aB = sample(texA, fitA, cs - vec2(sh, 0.0) + flow * amp * out_ * out_);
    vec4 bB = sample(texB, fitB, cs - vec2(sh, 0.0) - flow * amp * in_ * in_);
    col.r = mix(aR.r, bR.r, k);
    col.b = mix(aB.b, bB.b, k);
    col.a = max(col.a, max(mix(aR.a, bR.a, k), mix(aB.a, bB.a, k)));
  }

  float row = floor(c.y * 22.0);
  float tear = step(0.82, noise(vec2(row, 3.7))) * snap;
  if (tear > 0.01){
    vec2 t = cs + vec2((noise(vec2(row, 9.1)) - 0.5) * 0.07 * tear, 0.0);
    col = mix(col, mix(sample(texA, fitA, t), sample(texB, fitB, t), k), 0.85);
  }

  col.rgb += snap * 0.6 * col.a;
  gl_FragColor = vec4(col.rgb, col.a);
}
`;

function compile(gl, type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
  return sh;
}

function texture(gl, img){
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

const HOLD  = 4200;
const MORPH = 1150;

export function mountLogoMorph(root){
  const ui = root || document.getElementById('ui');
  if (!ui) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const wraps = [...ui.querySelectorAll('#top .markflow, #top .fxm__lockup')];
  if (!wraps.length) return () => {};

  const LATIN  = '/pp-figma/hero-lockup.webp';
  const KOREAN = '/pp-figma/hero-hangul.webp';
  const KOREAN_HEIGHT = 0.87;

  const load = src => new Promise((res, rej) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

  const units = [];
  let disposed = false;
  let raf = 0;

  Promise.all([load(LATIN), load(KOREAN)]).then(([a, b]) => {
    if (disposed) return;
    for (const wrap of wraps){
      const box = wrap.getBoundingClientRect();
      if (!box.width) continue;

      const canvas = document.createElement('canvas');
      canvas.className = 'markmorph';
      canvas.setAttribute('aria-hidden', 'true');
      const gl = canvas.getContext('webgl', {
        premultipliedAlpha: true, antialias: true, alpha: true,
        preserveDrawingBuffer: false, depth: false, stencil: false,
      });
      if (!gl) continue;

      canvas.addEventListener('webglcontextlost', e => {
        e.preventDefault();
        wrap.classList.remove('is-morphing');
        canvas.remove();
      });
      canvas.addEventListener('webglcontextrestored', () => {
        if (disposed) return;
        wrap.appendChild(canvas);
        wrap.classList.add('is-morphing');
      });

      const prog = gl.createProgram();
      try {
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
      } catch { continue; }

      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const texA = texture(gl, a), texB = texture(gl, b);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texA);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texB);
      gl.uniform1i(gl.getUniformLocation(prog, 'texA'), 0);
      gl.uniform1i(gl.getUniformLocation(prog, 'texB'), 1);
      const uProgress = gl.getUniformLocation(prog, 'progress');
      const uAspect   = gl.getUniformLocation(prog, 'aspect');
      const uFitA     = gl.getUniformLocation(prog, 'fitA');
      const uFitB     = gl.getUniformLocation(prog, 'fitB');

      const unit = { wrap, canvas, gl, uProgress, texA, texB, w: 0, h: 0 };

      const fit = () => {

        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const r = { width: wrap.offsetWidth, height: wrap.offsetHeight };
        if (!r.width || !r.height){
          const b = wrap.getBoundingClientRect();
          r.width = b.width; r.height = b.height;
        }
        const w = Math.max(1, Math.round(r.width * dpr));
        const h = Math.max(1, Math.round(r.height * dpr));
        if (w === unit.w && h === unit.h) return;

        unit.w = canvas.width = w;
        unit.h = canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.useProgram(prog);
        gl.uniform1f(uAspect, r.width / r.height);
        gl.uniform4f(uFitA, 1, 1, 0, 0);

        const kh = KOREAN_HEIGHT;
        const kw = kh * (b.naturalWidth / b.naturalHeight) * (r.height / r.width);
        gl.uniform4f(uFitB, kw, kh, 0, 0);
      };
      fit();

      wrap.appendChild(canvas);
      units.push({ ...unit, fit, prog });
    }

    if (!units.length) return;

    const draw = (u, p) => {
      const { gl } = u;
      gl.useProgram(u.prog);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(u.uProgress, p);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    for (const u of units) u.wrap.classList.add('is-morphing');

    let face = 0;
    let phaseEnd = performance.now() + HOLD;
    let morphing = false;
    let morphFrom = 0;

    for (const u of units){
      u.fit();
      try { draw(u, 0); } catch { u.bad = true; continue; }
      const px = new Uint8Array(4);
      u.gl.readPixels(1, 1, 1, 1, u.gl.RGBA, u.gl.UNSIGNED_BYTE, px);
      if (px[3] > 8) u.bad = true;
    }
    for (const u of units.filter(u => u.bad)){
      u.wrap.classList.remove('is-morphing');
      u.canvas.remove();
    }
    for (let i = units.length - 1; i >= 0; i--) if (units[i].bad) units.splice(i, 1);
    if (!units.length) return;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      if (!morphing){

        if (now >= phaseEnd){
          morphing = true; morphFrom = now;
          for (const u of units) u.fit();
        } else {
          raf = 0;
          hold = setTimeout(() => { raf = requestAnimationFrame(tick); }, phaseEnd - now);
          return;
        }
      }
      const k = Math.min(1, (now - morphFrom) / MORPH);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const p = face === 0 ? eased : 1 - eased;
      for (const u of units) draw(u, p);
      if (k >= 1){
        morphing = false;
        face = 1 - face;
        phaseEnd = now + HOLD;
      }
      raf = requestAnimationFrame(tick);
    };

    let hold = 0;
    let frozenAt = 0;
    const onFreeze = (next) => {
      if (next){
        frozenAt = performance.now();
        clearTimeout(hold);
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        const dt = performance.now() - frozenAt;
        phaseEnd += dt;
        morphFrom += dt;
        raf = requestAnimationFrame(tick);
      }
    };
    const offFreeze = onFreezeChange(onFreeze);
    if (isFrozen()) onFreeze(true);
    else raf = requestAnimationFrame(tick);

    const onResize = () => { for (const u of units) u.fit(); };
    addEventListener('resize', onResize, { passive: true });
    units.onResize = onResize;
    units.clearHold = () => { clearTimeout(hold); offFreeze(); };
  }).catch(() => {});

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    units.clearHold?.();
    if (units.onResize) removeEventListener('resize', units.onResize);
    for (const u of units){
      u.wrap.classList.remove('is-morphing');
      u.canvas.remove();
      const lose = u.gl.getExtension('WEBGL_lose_context');
      lose?.loseContext();
    }
    units.length = 0;
  };
}
