import TraitLab from './TraitLab';

export default function Lab(){
  return (
    <>
      <section className="sec sec--paper" id="lab">

        <div className="lb__deco" aria-hidden="true">
          <img className="lb__ring"   data-drift="ring"       src="/pp-figma/hero-ring.webp" alt="" decoding="async" loading="lazy" />
          <img className="lb__ring-m" data-drift="ring-m"     src="/pp-figma/hero-ring.webp" alt="" decoding="async" loading="lazy" />
          <img className="lb__star"   data-drift="star"       src="/pp-figma/hero-star.webp" alt="" decoding="async" loading="lazy" />
          <img className="lb__carrot" data-drift="stk-carrot" src="/pp-figma/stk-carrot.webp" alt="" decoding="async" loading="lazy" />
          <img className="lb__galaxy" data-drift="stk-galaxy" src="/pp-figma/stk-galaxy.webp" alt="" decoding="async" loading="lazy" />
          <img className="lb__carrot-m" data-drift="stk-carrot-m" src="/pp-figma/stk-carrot.webp" alt="" decoding="async" loading="lazy" />
          <img className="lb__galaxy-m" data-drift="stk-galaxy-m" src="/pp-figma/stk-galaxy.webp" alt="" decoding="async" loading="lazy" />
        </div>
        <div className="wrap">
          <div className="sec__head lb__head">
            <span className="kicker lb__kicker">BUNNY LAB</span>
            <h2 className="lb__h fh"><span className="fh__ln fh__holo fh--l1" data-text="BUILD YOUR"><span className="fh__t">BUILD YOUR</span></span><span className="fh__ln fh__plate fh--l2" data-text="BOUNCE"><span className="fh__t">BOUNCE</span></span><span className="fh__ln fh__holo fh--l3" data-text="BEFORE IT’S"><span className="fh__t">BEFORE IT’S</span></span><span className="fh__ln fh__holo fh--l4" data-text="REAL"><span className="fh__t">REAL</span></span></h2>

            <p className="lede lb__pill">350+ traits, zero permission needed. Mix, match, meme.</p>
          </div>

          <TraitLab />
          </div>
          </section>
    </>
  );
}
