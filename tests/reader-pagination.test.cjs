const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

test('큰 글씨의 쪽 수, 크기 변경, 장면 이동과 모바일 전환을 처리한다', () => {
  const slots = [], effects = [];
  let cursor = 0, resize, fontLoaded;
  const globals = ['requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver', 'document', 'getComputedStyle'];
  const originals = globals.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const element = { clientWidth: 400, scrollWidth: 1264, scrollLeft: 0 };
  const style = { columnCount: '1', columnGap: '32px', width: '400px' };
  let observed = false, disconnected = false;
  const react = {
    useRef(value) { const index = cursor++; return slots[index] ??= { current: value }; },
    useState(value) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = value;
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useEffect(callback, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((dep, i) => !Object.is(dep, previous.deps[i]))) {
        previous?.cleanup?.();
        slots[index] = { deps };
        effects.push(() => { slots[index].cleanup = callback(); });
      }
    },
  };
  try {
    globalThis.requestAnimationFrame = callback => { effects.push(callback); return 1; };
    globalThis.cancelAnimationFrame = () => {};
    globalThis.ResizeObserver = class {
      constructor(callback) { resize = callback; }
      observe(target) { observed = target === element; }
      disconnect() { disconnected = true; }
    };
    globalThis.document = { fonts: {
      ready: { then() {} },
      addEventListener(_event, callback) { fontLoaded = callback; },
      removeEventListener() {},
    } };
    globalThis.getComputedStyle = () => style;
    const filename = path.resolve(__dirname, '../app/useReaderPagination.ts');
    const mod = new Module(filename, module);
    mod.require = id => { assert.equal(id, 'react'); return react; };
    mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, filename);
    const render = (text = '첫 장면', scene = 0, end = false, active = true) => {
      cursor = 0;
      const result = mod.exports.useReaderPagination(text, 'xl', scene, end, active);
      result.textRef.current = element;
      while (effects.length) effects.shift()();
      return result;
    };

    render();
    let reading = render();
    assert.ok(observed);
    assert.equal(reading.ready, true);
    assert.equal(reading.count, 3);
    reading.turn(1);
    reading = render();
    assert.equal(element.scrollLeft, 432);

    // 쪽 수가 같아도 너비가 달라지면 새 열의 시작에 맞춘다.
    style.width = '500px';
    element.scrollWidth = 1564;
    resize();
    reading = render();
    assert.equal(element.scrollLeft, 532);

    // 이전 장면으로 돌아갈 때 마지막 쪽부터 이어 읽는다.
    render('이전 장면', 1, true);
    reading = render('이전 장면', 1, true);
    assert.ok(disconnected);
    assert.equal(reading.index, 2);
    assert.equal(element.scrollLeft, 1064);

    // 폰트가 늦게 로드되거나 화면이 넓어지면 유효한 쪽으로 보정한다.
    element.scrollWidth = 500;
    fontLoaded();
    reading = render('이전 장면', 1, true);
    assert.equal(reading.index, 0);
    assert.equal(reading.count, 1);

    style.columnCount = 'auto';
    element.scrollWidth = 3000;
    resize();
    reading = render('이전 장면', 1, true);
    assert.equal(reading.count, 1);
    assert.equal(element.scrollLeft, 0);

    // 이어 쓰기에 실패해 같은 본문으로 돌아와도 새 DOM을 다시 측정한다.
    render('이전 장면', 1, true, false);
    style.columnCount = '1';
    element.scrollWidth = 1564;
    render('이전 장면', 1, true, true);
    reading = render('이전 장면', 1, true, true);
    assert.equal(reading.count, 3);
  } finally {
    globals.forEach((key, index) => {
      if (originals[index]) Object.defineProperty(globalThis, key, originals[index]);
      else delete globalThis[key];
    });
  }
});
