import FlipLabel from './FlipLabel';

export default function Drop(){
  return (
    <>
      <section className="sec drop-sky" id="drop">

        <canvas className="drop__sky" aria-hidden="true" hidden></canvas>
        <div className="fall fall--far" aria-hidden="true" hidden></div>
        <div className="fall fall--near" aria-hidden="true" hidden></div>
        <div className="dr__f">
          <div className="fband dr__band dr__d" aria-hidden="true"><div className="fband__run"><span>// INCOMING TRANSMISSION //</span><i className="fb__dot"></i><span>HOLD YOUR BUNNY</span><i className="fb__dot"></i><span>HOLD YOUR BREATH</span><i className="fb__dot"></i><span className="fb__k">퐁퐁</span><i className="fb__dot"></i><span>// INCOMING TRANSMISSION //</span></div></div>
          <span className="kicker dr__kicker">// INCOMING TRANSMISSION //</span>
          <h2 className="dr__h fh"><span className="fh__ln fh__holo fh--d1" data-text="SOMETHING’S FALLING"><span className="fh__t">SOMETHING’S FALLING</span></span><span className="fh__ln fh__holo fh--d1a fh__m" data-text="SOMETHING’S"><span className="fh__t">SOMETHING’S</span></span><span className="fh__ln fh__holo fh--d1b fh__m" data-text="FALLING"><span className="fh__t">FALLING</span></span><span className="fh__ln fh__holo fh--d2" data-text="FROM THE"><span className="fh__t">FROM THE</span></span><span className="fh__ln fh__plate fh--d3" data-text="ROBINHOOD"><span className="fh__t">ROBINHOOD</span></span><span className="fh__ln fh__holo fh--d4" data-text="SKY"><span className="fh__t">SKY</span></span></h2>
          <img className="dr__carrot dr__d" data-drift="carrot" src="/pp-figma/drop-carrot.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" />
          <img className="dr__carrot-m dr__m" data-drift="carrot-m" src="/pp-figma/drop-m-carrot-art.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" />
          <img className="dr__stk-m dr__m" data-drift="sticker-m" src="/pp-figma/drop-wand.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" />
          <img className="dr__wand dr__d" data-drift="wand" src="/pp-figma/drop-wand.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" />
          <p className="dr__pill">when it lands, holders move first.</p>
          <button className="btn --glass --primary dr__cta hero__cta-like" data-shine data-go="#lab"><FlipLabel>Enter the Lab</FlipLabel></button>
        </div>
      </section>
    </>
  );
}
