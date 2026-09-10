import FlipLabel from './FlipLabel';

export default function Nav(){
  return (
    <>
      <header className="nav">
        <div className="navpill">
          <a className="nav__logo" href="#top">PongPong <small>퐁퐁</small></a>

          <nav className="nav__links">
            <a href="#warren"><FlipLabel>IP</FlipLabel></a>
            <a href="#lab"><FlipLabel>THE LAB</FlipLabel></a>
            <a href="#signal"><FlipLabel>$PONGPONG</FlipLabel></a>
            <a href="#drop"><FlipLabel>DROP</FlipLabel></a>
          </nav>

          <button className="btn --glass" data-shine data-go="#bunnyhop"><FlipLabel>Gib WL?</FlipLabel></button>
          <button className="btn --glass --primary" data-shine id="ctaPlay"><FlipLabel>Play now</FlipLabel></button>
        </div>
      </header>
    </>
  );
}
