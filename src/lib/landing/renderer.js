import * as THREE from 'three';

export function createRenderer(canvas){
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias:false, alpha:false, powerPreference:'high-performance'
  });
  renderer.setPixelRatio(1);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene  = new THREE.Scene();

  function resize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    return { w, h };
  }
  resize();
  window.addEventListener('resize', resize, { passive:true });

  return { renderer, scene, camera, resize };
}
