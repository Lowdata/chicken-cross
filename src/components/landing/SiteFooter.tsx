import FlipLabel from './FlipLabel';

export default function SiteFooter(){
  return (
    <>
      <footer className="foot" id="footer">
        <div className="wrap">
          <div className="foot__grid">

            <div className="foot__brand">
              <img className="foot__logo" src="/pp-art/wordmark-clean.webp" alt="PongPong" decoding="async" loading="lazy" />
              <img className="foot__hangul" src="/pp-art/hangul.webp" alt="퐁퐁" decoding="async" loading="lazy" />
              <p className="foot__tag">a cult for degens &amp; collectors<br />native to Robinhood Chain</p>
            </div>

            <nav className="foot__col">
              <h3>explore</h3>
              <a href="#warren"><FlipLabel>bouncing bunnies onchain</FlipLabel></a>
              <a href="#lab"><FlipLabel>bunny lab</FlipLabel></a>
              <a href="#signal"><FlipLabel>$pongpong</FlipLabel></a>
              <a href="#drop"><FlipLabel>drop</FlipLabel></a>
            </nav>

            <nav className="foot__col">
              <h3>elsewhere</h3>
              <a className="foot__soc" href="#" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <FlipLabel>X / Twitter</FlipLabel>
              </a>
              <a className="foot__soc" href="#" aria-label="Discord">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.79.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.32.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.35-1.22.644-1.873.891a.077.077 0 0 0-.41.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .84.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028M8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418"/></svg>
                <FlipLabel>Discord</FlipLabel>
              </a>
            </nav>

          </div>

          <div className="foot__rule"></div>
          <div className="foot__legal">
            <span>bunnies bouncing on Robinhood Chain. no promises except the bounce. © PongPong.</span>
            <span>nothing here is financial advice</span>
          </div>
        </div>
      </footer>

      <i className="gfx gfx--lines" aria-hidden="true"></i>
      <i className="gfx gfx--grain" aria-hidden="true"></i>

      <div id="toast"><div className="in"></div></div>
    </>
  );
}
