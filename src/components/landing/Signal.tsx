export default function Signal(){
  return (
    <>
      <section className="sec sec--violet" id="signal">

        <div className="sg__f">
          <i className="sg__frame" aria-hidden="true"></i>
          <div className="fpill sg__pill" aria-hidden="true"><i className="fpill__ico">퐁</i><span>$PONGPONG</span><i className="fpill__dot"></i><b>04</b></div>
          <span className="ftab sg__tab" data-drift="tab" aria-hidden="true"><span>퐁</span><span>퐁</span></span>
          <span className="fbtns sg__btns" aria-hidden="true"><i data-drift="mark-a">✳</i><i data-drift="mark-b">♡</i><i data-drift="mark-c">•••</i></span>
          <i className="ffloor sg__floor" aria-hidden="true"></i>
          <img className="sg__boombox" data-drift="boombox" src="/pp-figma/boombox.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" />
          <img className="sg__boombox-m" data-drift="boombox-m" src="/pp-figma/boombox.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" />
          <span className="kicker sg__kicker">$PONGPONG</span>
          <h2 className="sg__h fh"><span className="fh__ln fh__holo fh--s1" data-text="SIGNAL"><span className="fh__t">SIGNAL</span></span><span className="fh__ln fh__plate fh--s2" data-text="DETECTED"><span className="fh__t">DETECTED</span></span></h2>
          <p className="sg__sub">some just ape ETH. some find the bounce.</p>
          <span className="sg__coinwrap sg__coinwrap--d sg__d" data-shine="coin" data-drift="coin"><span className="sg__coinbody"><img className="signal__coin sg__coin" src="/pp-figma/coin.webp" srcSet="/pp-figma/coin-m.webp 560w, /pp-figma/coin.webp 1442w" sizes="(max-width:1099px) 1px, 640px" alt="PongPong coin" decoding="async" loading="lazy" /><i className="sg__slit" aria-hidden="true"></i></span></span>
          <span className="sg__coinwrap sg__coinwrap--m sg__m" data-shine="coin" data-drift="coin-m"><span className="sg__coinbody"><img className="sg__coin-m" src="/pp-figma/coin-m.webp" alt="" aria-hidden="true" decoding="async" loading="lazy" /><i className="sg__slit" aria-hidden="true"></i></span></span>
          <div className="sg__panel">
            <span className="sg__lbl sg__lbl--1">ETH · ROBINHOOD CHAIN</span><b className="sg__val sg__val--1" id="ethVal">0.469</b>
            <button className="sg__bounce" id="bounceBtn" aria-label="bounce">BOUNCE</button>
            <span className="sg__lbl sg__lbl--2">$PONGPONG</span><b className="sg__val sg__val--2">???</b>
            <span className="sg__lock"><i className="sg__lockIco"></i>ROUTE LOCKED · REVEALS SOON</span>
          </div>
          <p className="sg__note"><span className="sg__d">QUOTE REFRESHES EVERY BOUNCE · NOTHING IS FINANCIAL ADVICE, ANON</span><span className="sg__m">QUOTE REFRESHES EVERY BOUNCE · NOTHING IS<br />FINANCIAL ADVICE, ANON</span></p>
        </div>
      </section>
    </>
  );
}
