const VERT = `#version 300 es
in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_scroll;

const vec3 LILAC  = vec3(0.760, 0.655, 0.960);
const vec3 PINK   = vec3(0.996, 0.639, 0.882);
const vec3 PERI   = vec3(0.635, 0.694, 0.980);
const vec3 CYAN   = vec3(0.678, 0.906, 1.000);
const vec3 CREAM  = vec3(1.000, 0.937, 0.980);
const vec3 CHROME = vec3(0.988, 0.976, 1.000);
const vec3 DEEP   = vec3(0.435, 0.310, 0.769);

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for(int i = 0; i < 6; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

vec3 irid(float t){
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p  = uv;
  p.x *= u_res.x / u_res.y;

  float t = u_time * 0.020;
  vec2  m = (u_mouse - 0.5) * 0.16;

  float g = smoothstep(0.0, 1.0, uv.y);
  vec3 base = mix(LILAC, PERI, g * 0.28);
  base = mix(base, PINK, smoothstep(0.40, 1.0, 1.0 - uv.y) * 0.34);
  base = mix(base, CYAN, smoothstep(0.70, 1.0, uv.y) * 0.05);

  vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, t)),
                fbm(p * 1.4 + vec2(5.2, -t) + m));
  vec2 r = vec2(fbm(p * 1.4 + 2.6 * q + vec2(1.7, 9.2) + t * 0.45),
                fbm(p * 1.4 + 2.6 * q + vec2(8.3, 2.8) - t * 0.45));
  float far  = fbm(p * 1.8 + 1.8 * r);
  float near = fbm(p * 3.0 + vec2(t * 1.8, -t * 0.5) + m * 1.2);

  float bank = 1.0;
  float cloudFar  = smoothstep(0.36, 0.92, far)  * (0.42 + 0.58 * bank);
  float cloudNear = smoothstep(0.52, 0.99, near) * bank * 0.5;

  vec3 col = base;
  col = mix(col, CREAM,  cloudFar  * 0.72);
  col = mix(col, CHROME, cloudNear * 0.45);

  float rim  = smoothstep(0.40, 0.47, far) - smoothstep(0.47, 0.58, far);
  float film = uv.x * 0.5 + t * 0.8 + m.x * 0.5 + u_scroll * 0.2;
  col = mix(col, mix(CREAM, irid(film), 0.35), rim * 0.16);

  float glow = exp(-5.5 * length(p - vec2(0.5 * u_res.x / u_res.y + m.x, 0.66 + m.y)));
  col += PINK * glow * 0.10;

  col = mix(col, DEEP, smoothstep(0.78, 1.0, 1.0 - uv.y) * 0.10);

  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.014;

  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export function initHoloSky(canvas){
  const gl = canvas.getContext('webgl2', { antialias:false, alpha:false, powerPreference:'high-performance' });
  if(!gl) return () => {};

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.warn(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res:    gl.getUniformLocation(prog, 'u_res'),
    time:   gl.getUniformLocation(prog, 'u_time'),
    mouse:  gl.getUniformLocation(prog, 'u_mouse'),
    scroll: gl.getUniformLocation(prog, 'u_scroll')
  };

  let mouse = [0.5, 0.5], target = [0.5, 0.5], scroll = 0, raf = 0;
  const start = performance.now();
  const dpr = () => Math.min(devicePixelRatio || 1, 1.6);

  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight, d = dpr();
    canvas.width  = Math.max(1, w * d | 0);
    canvas.height = Math.max(1, h * d | 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  const onMove   = e => { target = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; };
  const onScroll = () => {
    const max = document.body.scrollHeight - innerHeight;
    scroll = max > 0 ? Math.min(1, (scrollY || 0) / max) : 0;
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function frame(now){
    mouse[0] += (target[0] - mouse[0]) * 0.05;
    mouse[1] += (target[1] - mouse[1]) * 0.05;
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, reduce ? 6.0 : (now - start) / 1000);
    gl.uniform2f(U.mouse, mouse[0], mouse[1]);
    gl.uniform1f(U.scroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if(!reduce) raf = requestAnimationFrame(frame);
  }

  resize(); onScroll();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  addEventListener('load', resize);
  setTimeout(resize, 400); setTimeout(resize, 1200);
  addEventListener('resize', resize);
  addEventListener('pointermove', onMove, { passive:true });
  addEventListener('scroll', onScroll, { passive:true });
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    removeEventListener('resize', resize);
    removeEventListener('pointermove', onMove);
    removeEventListener('scroll', onScroll);
  };
}
