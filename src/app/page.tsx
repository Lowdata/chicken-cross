'use client';

import dynamic from 'next/dynamic';

const GameContainer = dynamic(
  () => import('@/components/GameContainer').then((mod) => mod.GameContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-sky-200 text-slate-800 select-none">
        <div className="text-6xl mb-4 animate-bounce">🐰</div>
        <h2 className="text-2xl font-black text-slate-800 tracking-wide">Loading Bunny Hop...</h2>
        <p className="text-sm font-semibold text-slate-500 mt-1">Preparing carrots &amp; highways</p>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <GameContainer />
    </main>
  );
}
