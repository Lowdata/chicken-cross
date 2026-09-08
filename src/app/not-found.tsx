import Link from 'next/link';

import FlipLabel from '@/components/landing/FlipLabel';

import '@/styles/landing/index.css';
import '@/styles/landing/notfound.css';

export default function NotFound(){
  return (
    <div id="ui" className="nf-page">
      <main className="nf">
        <i className="nf__sky" aria-hidden="true" />

        <div className="nf__inner">
          <img className="nf__art" src="/pp-art/bun-sit.webp" alt="" />

          <h1 className="nf__code">
            <em>404</em> — page not found
          </h1>
          <p className="nf__title">this burrow doesn&rsquo;t exist&hellip;</p>
          <p className="nf__copy">
            looks like this path leads nowhere. our bunny checked every carrot patch
            and couldn&rsquo;t find this page.
          </p>

          <div className="nf__actions">
            <Link className="btn --glass --primary" data-shine href="/">
              <FlipLabel>Back to Home</FlipLabel>
            </Link>
            <Link className="btn --glass" data-shine href="/game">
              <FlipLabel>Play Game</FlipLabel>
            </Link>
          </div>

          <p className="nf__note">
            error 404 — even the fastest hopper can&rsquo;t reach a page that doesn&rsquo;t exist
          </p>
        </div>
      </main>
    </div>
  );
}
