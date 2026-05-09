const loadedScripts = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  const existing = loadedScripts.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const current = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (current?.dataset.loaded === 'true') {
      resolve();
      return;
    }

    const script = current ?? document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Could not load ${src}`)));

    if (!current) document.head.append(script);
  });

  loadedScripts.set(src, promise);
  return promise;
}
