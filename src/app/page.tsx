'use client';

import React from 'react';
import Link from 'next/link';
import BunnyLabBuilder from '@/components/BunnyLabBuilder';

export default function PongPongLanding() {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-[#0F0529] selection:bg-brand-pink selection:text-white font-outfit">
      
      {/* ── FIGMA IMG-CLOUD & ATMOSPHERIC GLOWS BACKGROUND ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] h-[1900px] pointer-events-none -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/img-cloud.png"
          alt="Cloud Atmospheric Background"
          loading="eager"
          className="w-full h-full object-cover object-top opacity-90"
        />
      </div>

      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] opacity-80"
          style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(255, 245, 255, 0.7) 0%, rgba(225, 205, 255, 0.35) 45%, transparent 75%)' }}
        />
        <div 
          className="absolute top-[80px] left-[5%] w-[450px] h-[350px] rounded-full filter blur-[80px] opacity-40"
          style={{ background: 'rgba(255, 225, 248, 0.7)' }}
        />
        <div 
          className="absolute top-[120px] right-[8%] w-[500px] h-[400px] rounded-full filter blur-[90px] opacity-45"
          style={{ background: 'rgba(220, 205, 255, 0.8)' }}
        />
      </div>

      {/* ── NAVBAR (00 NAV) ── */}
      <header className="absolute top-6 md:top-8 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <nav className="figma-navbar-glass rounded-full px-5 md:px-6 h-[50px] md:h-[54px] flex items-center justify-between w-[92%] max-w-[360px] md:w-[710px] md:max-w-[710px] shadow-2xl pointer-events-auto">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <span className="font-bungee text-[16px] md:text-[18px] tracking-tight text-[#241444] group-hover:text-purple-900 transition-colors">
              PONGPONG
            </span>
            <span className="font-outfit text-[11px] font-bold text-[#6D5396]">퐁퐁</span>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 font-dm-mono text-[11px] tracking-[0.08em] font-bold text-[#241444]">
            <a href="#collection" className="hover:text-purple-800 transition-colors uppercase">THE WARREN</a>
            <a href="#bunny-lab" className="hover:text-purple-800 transition-colors uppercase">THE WARREN LAB</a>
            <a href="#signal" className="hover:text-purple-800 transition-colors uppercase">$PONGPONG</a>
            <a href="#classified" className="hover:text-purple-800 transition-colors uppercase">DROP</a>
          </div>

          {/* GIB WL? Button */}
          <div className="flex items-center shrink-0">
            <button 
              onClick={() => {
                const el = document.getElementById('classified');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="figma-btn-gibwl font-bungee text-[11px] tracking-wider text-[#241444] px-4 md:px-5 py-1.5 md:py-2 rounded-full cursor-pointer"
            >
              GIB WL?
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION ── */}
      <section id="about" className="scroll-mt-32 relative min-h-[85vh] md:min-h-[92vh] flex flex-col items-center justify-center pt-36 md:pt-48 pb-20 md:pb-28 px-4 overflow-hidden">
        
        <div className="z-20 text-center max-w-5xl mx-auto flex flex-col items-center w-full mt-4 md:mt-2">
          
          {/* 3D PongPong Hero Logo */}
          <div className="relative w-full max-w-4xl flex justify-center items-center animate-float">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero_art_master.png"
              alt="PongPong 3D Liquid Chrome Hero Artwork"
              loading="eager" className="object-contain w-full max-w-[370px] sm:max-w-[620px] md:max-w-[860px] drop-shadow-[0_20px_45px_rgba(30,10,60,0.2)]"
            />
          </div>

          {/* Text Content below Hero Title */}
          <div className="mt-4 md:mt-6 flex flex-col items-center space-y-2.5">
            <span className="font-dm-mono text-[11px] md:text-[13px] font-semibold tracking-[0.16em] text-[#200E3B] uppercase">
              BOUNCING BUNNIES ONCHAIN
            </span>

            <h1 className="font-bungee text-[23px] sm:text-3xl md:text-5xl lg:text-[44px] text-[#200E3B] tracking-tight leading-tight text-center max-w-none md:max-w-4xl">
              EVERY CHAIN WAS JUST A <span className="text-[#FF58B8]">LAYOVER.</span>
            </h1>

            <p className="font-dm-mono text-xs md:text-sm text-[#200E3B] font-medium text-center max-w-md px-2">
              they bounced across the multiverse to land on one.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3.5 md:gap-5 pt-3">
              <a 
                href="#bunny-lab" 
                className="figma-btn-hero font-bungee text-xs md:text-sm text-[#200E3B] px-6 md:px-8 py-2.5 md:py-3.5 rounded-full cursor-pointer"
              >
                ENTER THE LAB
              </a>
              <button 
                onClick={() => {
                  const el = document.getElementById('classified');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="figma-btn-hero font-bungee text-xs md:text-sm text-[#200E3B] px-6 md:px-8 py-2.5 md:py-3.5 rounded-full cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #FDC4EC 0%, #D8C0FB 50%, #BFE8FD 100%)' }}
              >
                GIB WL?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── DUAL TILTED MARQUEE RIBBONS ── */}
      <div className="w-full relative z-30 py-6 overflow-hidden space-y-3">
        
        {/* Ribbon 1 */}
        <div className="w-full ribbon-banner-1 py-3.5 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mx-4">
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">BOUNCING BUNNIES ONCHAIN</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-purple-900 text-xl md:text-2xl tracking-wider">350+ TRAITS</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">LEDGER COVER, PLUSHY KEYCHAIN</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-pink-900 text-xl md:text-2xl tracking-wider">GIB WL?</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ribbon 2 */}
        <div className="w-full ribbon-banner-2 py-3.5 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mx-4">
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">A CULT FOR DEGENS &amp; COLLECTORS</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-purple-950 text-xl md:text-2xl tracking-wider">NATIVE TO ROBINHOOD CHAIN</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-pink-950 text-xl md:text-2xl tracking-wider">퐁퐁</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
                <span className="font-bungee text-[#0F0529] text-xl md:text-2xl tracking-wider">ONE CHAIN NO MORE HOPPING</span>
                <span className="text-[#0F0529]/40 font-bold">•</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── SECTION 01: THE COLLECTION (BOUNCING BUNNIES ONCHAIN) ── */}
      <section id="collection" className="scroll-mt-32 py-12 md:py-20 px-4 md:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sec1_header_master.png"
            alt="The Collection - Bouncing Bunnies Onchain - NFT Cards + Departure Board"
            loading="eager" className="w-full object-contain drop-shadow-[0_15px_35px_rgba(30,12,60,0.15)]"
          />
        </div>
      </section>

      {/* ── SECTION 02: THE BOUNCE GOES PHYSICAL (MERCH) ── */}
      <section id="merch" className="scroll-mt-32 py-12 md:py-20 px-4 md:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/section-physical.png"
            alt="The Bounce Goes Physical - Phone Covers, Laptop Covers, Ledger Covers, Airpod Covers"
            loading="eager" className="w-full object-contain rounded-[36px] drop-shadow-[0_25px_60px_rgba(25,12,50,0.25)]"
          />
        </div>
      </section>

      {/* ── SECTION 03: BUNNY LAB (BUILD YOUR BOUNCE - INTERACTIVE) ── */}
      <section id="bunny-lab" className="scroll-mt-32 py-12 md:py-20 px-4 md:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* Title Header with 3D text and bunnies */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sec3_title_master.png"
            alt="Bunny Lab - Build Your Bounce Before It's Real"
            loading="eager" className="w-full object-contain drop-shadow-[0_15px_35px_rgba(30,12,60,0.15)] mb-4"
          />

          {/* Interactive 3-Panel Builder */}
          <BunnyLabBuilder />
        </div>
      </section>

      {/* ── SECTION 04: $PONGPONG / SIGNAL DETECTED ── */}
      <section id="signal" className="scroll-mt-32 py-12 md:py-20 px-4 md:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sec4_master_container.png"
            alt="Signal Detected $PongPong - Swap ETH on Robinhood Chain"
            loading="eager" className="w-full object-contain rounded-[40px] drop-shadow-[0_30px_70px_rgba(20,10,45,0.35)]"
          />
        </div>
      </section>

      {/* ── SECTION 05: DOWN THE RABBIT HOLE (CLASSIFIED) ── */}
      <section id="classified" className="scroll-mt-32 py-12 md:py-20 px-4 md:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sec5_master_container.png"
            alt="Down The Rabbit Hole - Classified Dossier"
            loading="eager" className="w-full object-contain rounded-[40px] drop-shadow-[0_30px_70px_rgba(25,12,50,0.25)]"
          />
        </div>
      </section>

      {/* ── HOLD YOUR BUNNY MARQUEE BANNER ── */}
      <div className="w-full overflow-hidden relative z-20 my-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/marquee_hold_bunny.png"
          alt="Hold Your Bunny - Hold Your Breath Marquee"
          loading="eager" className="w-full object-contain"
        />
      </div>

      {/* ── SECTION 06: SOMETHING'S FALLING FROM THE ROBINHOOD SKY ── */}
      <section id="drop" className="scroll-mt-32 py-12 md:py-20 px-4 md:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sec6_title_master.png"
            alt="Something's Falling From The Robinhood Sky"
            loading="eager" className="w-full max-w-[980px] object-contain drop-shadow-[0_15px_35px_rgba(30,12,60,0.15)] mb-8"
          />
          <a 
            href="#bunny-lab" 
            className="figma-btn-hero text-[#0F0529] font-bungee text-sm md:text-base px-9 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            ENTER THE LAB
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="pb-16 px-4 md:px-8 relative z-30">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/footer_master_container.png"
            alt="PongPong Footer - Explore, Elsewhere, Status"
            loading="eager" className="w-full object-contain rounded-[40px] drop-shadow-[0_25px_60px_rgba(15,8,38,0.4)]"
          />
        </div>
      </footer>

    </div>
  );
}
