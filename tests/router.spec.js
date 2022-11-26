import test from 'node:test';
import assert from 'node:assert/strict';

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

test('router', async () => {
  const results = [];

  const off = router.path.subscribe(path => results.push(path));
  assert.equal(results[0], '/initial/path');

  await router.go('/another/path');
  assert.equal(results[1], '/another/path');
  assert.equal(results.length, 2);

  off();
});
