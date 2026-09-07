export const vert = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export const frag = `
  precision highp float;
  varying vec2 vUv;

  uniform vec2  uRes;
  uniform vec2  uPage;
  uniform float uScroll;
  uniform float uTime;

  uniform vec3  uBase;
  uniform vec3  uLinCol[4];
  uniform float uLinAt[4];
  uniform vec4  uRadGeo[3];
  uniform vec3  uRadCol[3];
  uniform float uRadStop[3];

  uniform vec3  uNear;
  uniform float uDepth;
  uniform float uLayerGain;

  vec3 linearFill(float y){
    vec3 c = uLinCol[0];
    c = mix(c, uLinCol[1], clamp((y - uLinAt[0]) / (uLinAt[1] - uLinAt[0]), 0.0, 1.0));
    c = mix(c, uLinCol[2], clamp((y - uLinAt[1]) / (uLinAt[2] - uLinAt[1]), 0.0, 1.0));
    c = mix(c, uLinCol[3], clamp((y - uLinAt[2]) / (uLinAt[3] - uLinAt[2]), 0.0, 1.0));
    return c;
  }

  float radialAlpha(vec2 n, vec4 g, float s){
    vec2 d = (n - g.zw) / g.xy;
    return 1.0 - clamp(length(d) / s, 0.0, 1.0);
  }

  float form(vec2 p, vec2 c, float r, float period){
    float dy = mod(p.y - c.y + period * 0.5, period) - period * 0.5;
    float d = length(vec2(p.x - c.x, dy)) / r;
    return smoothstep(1.0, 0.0, d);
  }

  void main(){
    vec2 px = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);
    vec2 pg = vec2(px.x, px.y + uScroll);
    vec2 n  = pg / uPage;

    vec3 col = linearFill(n.y);
    col = mix(col, uRadCol[2], radialAlpha(n, uRadGeo[2], uRadStop[2]));
    col = mix(col, uRadCol[1], radialAlpha(n, uRadGeo[1], uRadStop[1]));
    col = mix(col, uRadCol[0], radialAlpha(n, uRadGeo[0], uRadStop[0]));

    float vh = uRes.y;
    float period = vh * 1.7;

    vec2 bf = vec2(sin(uTime * 0.37), cos(uTime * 0.29)) * vh * 0.015;
    vec2 bm = vec2(cos(uTime * 0.31), sin(uTime * 0.41)) * vh * 0.012;
    vec2 bn = vec2(sin(uTime * 0.27), sin(uTime * 0.33)) * vh * 0.010;
    vec2 pf = vec2(px.x, mod(px.y + uScroll * 0.35, period)) + bf;
    vec2 pm = vec2(px.x, mod(px.y + uScroll * 0.70 + period * 0.4, period)) + bm;
    vec2 pn = vec2(px.x, mod(px.y + uScroll * 1.40 + period * 0.7, period)) + bn;
    float far  = form(pf, vec2(uRes.x * 0.20, period * 0.28), vh * 0.95, period)
               + form(pf, vec2(uRes.x * 0.84, period * 0.80), vh * 0.85, period);
    float mid  = form(pm, vec2(uRes.x * 0.62, period * 0.15), vh * 0.60, period)
               + form(pm, vec2(uRes.x * 0.08, period * 0.66), vh * 0.55, period);
    float near = form(pn, vec2(uRes.x * 0.74, period * 0.50), vh * 0.34, period);

    float gain = uDepth * uLayerGain;
    col = mix(col, uBase, clamp(far,  0.0, 1.0) * gain);
    col = mix(col, uBase, clamp(mid,  0.0, 1.0) * gain * 0.8);
    col = mix(col, uNear, clamp(near, 0.0, 1.0) * gain * 0.7);

    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`;
