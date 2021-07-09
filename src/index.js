import { writable } from 'tinyx';
import handleClick from './handle_click.js';

export default function makeRouter() {
  const sandboxed = window.location.origin === 'null';

  const currentPath = writable(getCurrentRoute());

  function getBase() {
    const { href, pathname, search, hash } = window.location;
    return href.slice(0, href.length - (pathname + search + hash).length);
  }

  function getCurrentRoute() {
    if (sandboxed) {
      return window.location.hash.slice(1) || '/';
    }

    const { href = '/', origin = '' } = window.location;
    return href.slice(origin.length);
  }

  const router = {
    path: currentPath,
    async go(url) {
      await Promise.resolve();
      if (currentPath.get() !== url) {
        if (!sandboxed) window.history.pushState(null, '', url);
        else window.location.hash = url;
        currentPath.set(url);
      }
    },
    async replace(url) {
      await Promise.resolve();
      if (currentPath.get() !== url) {
        if (!sandboxed) window.history.replaceState(null, '', url);
        else window.location.hash = url;
        currentPath.set(url);
      }
    }
  }

  window.onpopstate = () => currentPath.set(getCurrentRoute());
  window.addEventListener('click', handleClick(getBase(), router.go));

  return router;
}
