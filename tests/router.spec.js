import test from 'ava';
import makeRouter from '../src/index.js';

const setState = (_1, _2, url) => {
  window.location = new URL(url, window.location);
}

const initialUrl = 'http://web.site/initial/path';

global.window = {
  location: new URL(initialUrl),
  history: {
    pushState: setState,
    replaceState: setState
  },
  addEventListener: () => {},
  removeEventListener: () => {},
}

const router = makeRouter();

test('router', t => new Promise(resolve => {
  let j = 0;

  const steps = [
    path => (t.is(path, '/initial/path'), router.go('/another/path')),
    path => (t.is(path, '/another/path'), off(), resolve())
  ];

  const off = router.path.subscribe(path => steps[j++](path));
}));
