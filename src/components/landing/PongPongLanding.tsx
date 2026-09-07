'use client';

import { useEffect, useRef } from 'react';
import { mountScene } from '@/lib/landing/mountScene';

import Nav from './Nav';
import Hero from './Hero';
import BunnyHop from './BunnyHop';
import Warren from './Warren';
import Physical from './Physical';
import Lab from './Lab';
import Signal from './Signal';
import Intel from './Intel';
import Drop from './Drop';
import SiteFooter from './SiteFooter';
import OnboardingGate from './OnboardingGate';

import '@/styles/landing/index.css';

export default function PongPongLanding(){
  const uiRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const dispose = mountScene({ ui: uiRef.current, canvas: canvasRef.current });
    return dispose;
  }, []);

  return (
    <div className="pp-landing">

      <canvas id="stage" ref={canvasRef} aria-hidden="true" />

      <main id="ui" ref={uiRef}>
        <Nav />
        <Hero />
        <BunnyHop />
        <Warren />
        <Physical />
        <Lab />
        <Signal />
        <Intel />
        <Drop />
        <SiteFooter />
      </main>

      <OnboardingGate />

      <i className="gfx gfx--lines" aria-hidden="true" />
      <i className="gfx gfx--grain" aria-hidden="true" />
    </div>
  );
}
