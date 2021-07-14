import { writable } from 'tinyx';
import handleClick from './handle_click.js';

export default function makeRouter() {
  const sandboxed = window.location.origin === 'null';

  const currentPath = writable(getCurrentRoute());
  let count = 0;

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
    async go(url) {
      await Promise.resolve();
      if (getCurrentRoute() !== url) {
        if (!sandboxed) window.history.pushState(null, '', url);
        else window.location.hash = url;
        currentPath.set(url);
      }
    },
    async replace(url) {
      await Promise.resolve();
      if (getCurrentRoute() !== url) {
        if (!sandboxed) window.history.replaceState(null, '', url);
        else window.location.hash = url;
        currentPath.set(url);
      }
    },
    path: {
      subscribe: subscriber => {
        const onPopState = () => currentPath.set(getCurrentRoute());
        const onClick = handleClick(getBase(), router.go);

        if (0 === count++) {
          onPopState();
          window.addEventListener('popstate', onPopState);
          window.addEventListener('click', onClick);
        }
        const unsubscribe = currentPath.subscribe(subscriber);

        return () => {
          if (--count === 0) {
            window.removeEventListener('popstate', onPopState);
            window.removeEventListener('click', onClick);
          }
          unsubscribe();
        };
      }
    }
  }

  return router;
}
