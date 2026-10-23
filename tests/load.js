// Loads the app's plain-script globals into a node:vm context so tests can
// call them the way the browser does (no build step, no modules).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILES = ['lessons-data.js', 'reference-data.js', 'storage.js', 'conjugation.js', 'answer-check.js', 'session.js'];

function loadApp() {
  const ctx = { window: {}, console, setTimeout, Math, Date };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of FILES) {
    const p = path.join(__dirname, '..', 'js', f);
    if (!fs.existsSync(p)) continue;
    vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: p });
  }
  vm.runInContext('PROGRESS = defaultProgress()', ctx);
  return { run: expr => vm.runInContext(expr, ctx) };
}

module.exports = { loadApp };
