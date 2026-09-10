type Props = { children: string; className?: string };

const CHAR_DELAY = 22;

export default function FlipLabel({ children, className }: Props){

  const chars = Array.from(children);

  const row = (hidden: boolean) => (
    <span className={hidden ? 'flip__row flip__row--in' : 'flip__row'} aria-hidden="true">
      {chars.map((c, i) => (
        <span key={i} className="flip__c" style={{ '--flip-d': `${i * CHAR_DELAY}ms` } as React.CSSProperties}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );

  return (
    <span className={className ? `flip ${className}` : 'flip'}>
      <span className="flip__sr">{children}</span>
      {row(false)}
      {row(true)}
    </span>
  );
}
