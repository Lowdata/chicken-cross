let mounted = null;

export function openHowToPlay(){
  if (mounted) return mounted;

  const host = document.createElement('div');
  document.body.appendChild(host);

  let root = null;

  const close = () => {
    root?.unmount();
    host.remove();
    mounted = null;
  };

  Promise.all([
    import('react-dom/client'),
    import('react'),
    import('../../components/landing/dialogs/HowToPlayDialog'),
  ]).then(([{ createRoot }, React, { default: HowToPlayDialog }]) => {
    root = createRoot(host);
    root.render(React.createElement(HowToPlayDialog, { onClose: close }));
  });

  mounted = { close };
  return mounted;
}
