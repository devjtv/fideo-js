/*
 * Shared docs chrome: navigation, version injection, prev/next links.
 * The page list lives here only, so adding a page means editing one array.
 */

const PAGES = [
  {
    title: 'Start here',
    items: [
      { href: 'index.html', label: 'Getting started' },
      { href: 'initializing.html', label: 'Initializing' },
      { href: 'providers.html', label: 'Providers' },
    ],
  },
  {
    title: 'Configure',
    items: [
      { href: 'options.html', label: 'Options reference' },
      { href: 'attributes.html', label: 'Data attributes' },
      { href: 'responsive.html', label: 'Responsive media' },
      { href: 'background.html', label: 'Background video' },
    ],
  },
  {
    title: 'Interface',
    items: [
      { href: 'controls.html', label: 'Controls & keyboard' },
      { href: 'theming.html', label: 'Theming' },
    ],
  },
  {
    title: 'Scripting',
    items: [
      { href: 'api.html', label: 'JavaScript API' },
      { href: 'recipes.html', label: 'Framework recipes' },
    ],
  },
];

const FLAT = PAGES.flatMap((group) => group.items);

function currentFile() {
  const file = location.pathname.split('/').pop();
  return !file || file === '' ? 'index.html' : file;
}

function renderNav() {
  const here = currentFile();

  const sidebar = document.querySelector('[data-docs-sidebar]');
  if (sidebar) {
    sidebar.innerHTML = PAGES.map(
      (group) => `
        <div class="sidebar-group">
          <p class="sidebar-title">${group.title}</p>
          <ul>
            ${group.items
              .map(
                (item) =>
                  `<li><a href="./${item.href}"${item.href === here ? ' aria-current="page"' : ''}>${item.label}</a></li>`,
              )
              .join('')}
          </ul>
        </div>`,
    ).join('');
  }

  const pageNav = document.querySelector('[data-docs-pagenav]');
  if (pageNav) {
    const index = FLAT.findIndex((item) => item.href === here);
    const previous = index > 0 ? FLAT[index - 1] : null;
    const next = index >= 0 && index < FLAT.length - 1 ? FLAT[index + 1] : null;
    pageNav.innerHTML = [
      previous
        ? `<a class="prev" href="./${previous.href}"><span class="dir">← Previous</span><span class="label">${previous.label}</span></a>`
        : '<span></span>',
      next
        ? `<a class="next" href="./${next.href}"><span class="dir">Next →</span><span class="label">${next.label}</span></a>`
        : '<span></span>',
    ].join('');
  }
}

function wireNavToggle() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;

  const isNarrow = () => window.matchMedia('(max-width: 1000px)').matches;
  const sync = () => {
    sidebar.hidden = isNarrow();
    toggle.setAttribute('aria-expanded', String(!sidebar.hidden));
  };

  sync();
  window.addEventListener('resize', sync);
  toggle.addEventListener('click', () => {
    sidebar.hidden = !sidebar.hidden;
    toggle.setAttribute('aria-expanded', String(!sidebar.hidden));
  });
}

/*
 * Production: build-site.mjs substitutes v__FIDEO_VERSION__ in HTML and sets
 * window.__FIDEO_VERSION. Dev: read package.json from the repo root.
 */
async function injectVersion() {
  let version = window.__FIDEO_VERSION;
  if (!version) {
    try {
      const response = await fetch('../../package.json');
      if (response.ok) version = (await response.json()).version;
    } catch {}
  }
  if (!version) return;

  document.querySelectorAll('[data-version]').forEach((el) => {
    el.textContent = 'v' + version;
  });
  document.querySelectorAll('pre').forEach((el) => {
    el.innerHTML = el.innerHTML.replaceAll('v__FIDEO_VERSION__', 'v' + version);
  });
}

renderNav();
wireNavToggle();
injectVersion();

/** Small helper shared by the interactive demos. */
export function log(target, message, tone) {
  const line = document.createElement('div');
  if (tone) line.className = tone;
  line.textContent = message;
  target.append(line);
  target.scrollTop = target.scrollHeight;
}
