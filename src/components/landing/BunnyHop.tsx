import { APP } from '@/lib/landing/app';

import FlipLabel from './FlipLabel';

export default function BunnyHop(){
  return (
    <>
      <section className="sec bhx" id="bunnyhop">

        <div className="bhx__f">
          <div className="bhx__panel" aria-hidden="true"></div>
          <div className="bhx__clouds" aria-hidden="true">
            <img className="bhx__cloud bhx__cloud--b" data-drift="cloud-b" src="/pp-figma/bh-cloud-b.webp" alt="" decoding="async" loading="lazy" />
            <img className="bhx__cloud bhx__cloud--c" data-drift="cloud-c" src="/pp-figma/bh-cloud-c.webp" alt="" decoding="async" loading="lazy" />
          </div>
          <div className="bhx__copy">
            <h2 className="bhx__logo"><img src="/pp-figma/bh-title.webp" alt="Bunny Hop" decoding="async" loading="lazy" /></h2>

            <p className="bhx__lede">THE <strong>PIXEL-PERFECT</strong> ARCADE GAME<br />WHERE EVERY HOP LEADS TO WHITELIST</p>
            <div className="bhx__cta">

              <a className="bhx__play" data-shine href={APP.dashboard}><FlipLabel>PLAY NOW</FlipLabel><svg className="bhx__playico" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18L18 6M18 6H9M18 6V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></a>

              <button className="bhx__how" data-shine type="button" id="bhxHow"><FlipLabel>HOW TO PLAY?</FlipLabel></button>
            </div>
          </div>
          <div className="bhx__art" aria-hidden="true">
            <img className="bhx__spark" data-drift="spark" src="/pp-figma/bh-spark.webp" alt="" decoding="async" loading="lazy" />
            <img className="bhx__moon" data-drift="orb" src="/pp-figma/bh-orb.webp" alt="" decoding="async" loading="lazy" />
            <img className="bhx__ring" data-drift="ring" src="/pp-figma/bh-ring.webp" alt="" decoding="async" loading="lazy" />
            <img className="bhx__bun" data-drift="bunny" src="/pp-figma/bh-bunny.webp" alt="the Bunny Hop bunny" decoding="async" loading="lazy" />
            <img className="bhx__carrot" data-drift="carrot" src="/pp-figma/bh-carrot.webp" alt="" decoding="async" loading="lazy" />
          </div>
          <img className="bhx__orbit" data-drift="orbit-bunny" src="/pp-figma/bh-orbit-bunny.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" />
        </div>
      </section>
    </>
  );
}
