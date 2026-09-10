import FlipLabel from './FlipLabel';

export default function Hero(){
  return (
    <>
      <section className="hero" id="top">

        <div className="fx" aria-hidden="true">
          <img className="fx__hangul" data-drift="hangul" src="/pp-figma/hero-hangul.webp" alt="" decoding="async" fetchPriority="high" />
          <img className="fx__ring"   data-drift="ring"   src="/pp-figma/hero-ring.webp" alt="" decoding="async" fetchPriority="high" />
          <img className="fx__planet" data-drift="planet" src="/pp-figma/hero-planet.webp" alt="" decoding="async" fetchPriority="high" />
          <img className="fx__star"   data-drift="star"   src="/pp-figma/hero-star.webp" alt="" decoding="async" fetchPriority="high" />

          <img className="fxm fxm__ring"   data-drift="ring-m"   src="/pp-figma/hero-ring.webp" alt="" decoding="async" fetchPriority="high" />
          <img className="fxm fxm__hangul" data-drift="hangul-m" src="/pp-figma/hero-hangul.webp" alt="" decoding="async" fetchPriority="high" />
          <img className="fxm fxm__planet" data-drift="planet-m" src="/pp-figma/hero-planet.webp" alt="" decoding="async" fetchPriority="high" />
          <img className="fxm fxm__star"   data-drift="star-m"   src="/pp-figma/hero-star.webp" alt="" decoding="async" fetchPriority="high" />
          <span className="fxm fxm__lockup" data-drift="lockup-m"><img src="/pp-figma/hero-lockup.webp" alt="" decoding="async" fetchPriority="high" /></span>
          <span className="fxm markswap markswap--m" data-drift-mirror="lockup-m" aria-hidden="true">
            <img className="markswap__k" src="/pp-figma/hero-hangul.webp" alt="" decoding="async" fetchPriority="high" />
            <i className="markswap__sweep"></i>
          </span>
        </div>
        <div className="hero__stage">
          <span className="markflow" data-drift="lockup"><img src="/pp-figma/hero-lockup.webp" alt="PongPong" decoding="async" fetchPriority="high" /></span>

          <span className="markswap" data-drift-mirror="lockup" aria-hidden="true">
            <img className="markswap__k" src="/pp-figma/hero-hangul.webp" alt="" decoding="async" fetchPriority="high" />
            <i className="markswap__sweep"></i>
          </span>
          <span className="sr-only">퐁퐁</span>
          <p className="hero__kicker">bouncing bunnies onchain</p>
          <p className="hero__line">Every chain was just a <em>layover</em>.</p>
          <p className="hero__sub">they bounced across the multiverse to land on one.</p>
          <div className="hero__cta">
            <button className="btn --glass --primary" data-shine data-go="#lab"><FlipLabel>Enter the Lab</FlipLabel></button>
            <button className="btn --glass" data-shine data-go="#bunnyhop"><FlipLabel>Gib WL?</FlipLabel></button>
          </div>
        </div>
      </section>

      <div className="bands"><div className="band --one" aria-hidden="true"><div className="band__run"><span>BOUNCING BUNNIES ONCHAIN</span><i className="band__dot"></i><span>350+ TRAITS</span><i className="band__dot"></i><span>GADGET WEARABLES &amp; SKINS</span><i className="band__dot"></i><span>퐁퐁</span><i className="band__dot"></i><span>BOUNCING BUNNIES ONCHAIN</span><i className="band__dot"></i><span>350+ TRAITS</span><i className="band__dot"></i><span>GADGET WEARABLES &amp; SKINS</span><i className="band__dot"></i><span>퐁퐁</span><i className="band__dot"></i><span>BOUNCING BUNNIES ONCHAIN</span><i className="band__dot"></i><span>350+ TRAITS</span><i className="band__dot"></i><span>GADGET WEARABLES &amp; SKINS</span><i className="band__dot"></i><span>퐁퐁</span><i className="band__dot"></i></div></div><div className="band --two" aria-hidden="true"><div className="band__run"><span>A CULT FOR DEGENS & COLLECTORS</span><i className="band__dot"></i><span>NATIVE TO ROBINHOOD CHAIN</span><i className="band__dot"></i><span>퐁퐁</span><i className="band__dot"></i><span>ONE CHAIN. NO MORE HOPPING.</span><i className="band__dot"></i><span>A CULT FOR DEGENS & COLLECTORS</span><i className="band__dot"></i><span>NATIVE TO ROBINHOOD CHAIN</span><i className="band__dot"></i><span>퐁퐁</span><i className="band__dot"></i><span>ONE CHAIN. NO MORE HOPPING.</span><i className="band__dot"></i><span>A CULT FOR DEGENS & COLLECTORS</span><i className="band__dot"></i><span>NATIVE TO ROBINHOOD CHAIN</span><i className="band__dot"></i><span>퐁퐁</span><i className="band__dot"></i><span>ONE CHAIN. NO MORE HOPPING.</span><i className="band__dot"></i></div></div></div>

    </>
  );
}
