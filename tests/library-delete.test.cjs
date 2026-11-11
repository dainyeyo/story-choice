/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

function load(file, mocks) {
  const filename = path.resolve(__dirname, '..', file);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const fallback = mod.require.bind(mod);
  mod.require = id => Object.hasOwn(mocks, id) ? mocks[id] : fallback(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
  return mod.exports.default;
}

function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (predicate(tree)) return tree;
  for (const child of [tree.props?.children].flat(Infinity)) {
    const match = find(child, predicate);
    if (match) return match;
  }
}

function runtime() {
  const slots = [];
  let cursor = 0;
  return {
    render(component, props) { cursor = 0; return component(props); },
    react: {
      useEffect() {},
      useRef: value => ({ current: value }),
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], value => { slots[index] = value; }];
      },
    },
  };
}

function setupDialog(title = '달빛 숲의 작은 토끼') {
  const hooks = runtime();
  let confirmed = 0, cancelled = 0;
  const Dialog = load('app/library/DeleteStoryDialog.tsx', {
    react: hooks.react,
    '../components/Icon': () => null,
    '../components/ui': { btnSecondary: '', inputCls: '' },
  });
  const render = () => hooks.render(Dialog, {
    title, onConfirm: () => confirmed++, onCancel: () => cancelled++,
  });
  const enter = value => {
    find(render(), node => node.type === 'input').props.onChange({ target: { value } });
  };
  const submit = () => find(render(), node => node.type === 'form').props.onSubmit({ preventDefault() {} });
  return { render, enter, submit, confirmed: () => confirmed, cancelled: () => cancelled };
}

test('빈 입력, 다른 제목, 띄어쓰기 차이는 제출해도 삭제하지 않는다', () => {
  const dialog = setupDialog();
  for (const value of ['', '다른 동화책', '달빛숲의 작은 토끼', ' 달빛 숲의 작은 토끼', '달빛 숲의 작은 토끼 ']) {
    dialog.enter(value);
    assert.equal(find(dialog.render(), node => node.props?.type === 'submit').props.disabled, true);
    dialog.submit();
  }
  assert.equal(dialog.confirmed(), 0);
});

test('제목이 정확히 일치할 때만 확인으로 삭제하며 입력을 바꾸면 다시 막는다', () => {
  const dialog = setupDialog();
  dialog.enter('달빛 숲의 작은 토끼');
  assert.equal(find(dialog.render(), node => node.props?.type === 'submit').props.disabled, false);
  dialog.submit();
  assert.equal(dialog.confirmed(), 1);
  dialog.enter('달빛 숲의 작은 토');
  dialog.submit();
  assert.equal(dialog.confirmed(), 1);
});

test('취소, 닫기, Escape는 삭제를 호출하지 않는다', () => {
  const dialog = setupDialog();
  dialog.render().props.onCancel();
  find(dialog.render(), node => node.props?.['aria-label'] === '삭제 창 닫기').props.onClick();
  find(dialog.render(), node => node.props?.children === '취소').props.onClick();
  assert.equal(dialog.cancelled(), 3);
  assert.equal(dialog.confirmed(), 0);
});

test('한글 조합 중 Enter는 제출을 막는다', () => {
  const dialog = setupDialog();
  let prevented = false;
  find(dialog.render(), node => node.type === 'input').props.onKeyDown({
    key: 'Enter', nativeEvent: { isComposing: true }, preventDefault() { prevented = true; },
  });
  assert.equal(prevented, true);
  assert.equal(dialog.confirmed(), 0);
});

test('서재는 선택한 책을 확인창에 전달하고 확인한 책만 삭제한다', () => {
  const hooks = runtime();
  const deleted = [];
  const library = ['첫 번째 동화', '두 번째 동화'].map((title, i) => ({
    id: String(i), title, createdAt: 0, age: 5, choices: [], scenes: [], card: { questions: [] },
  }));
  const Dialog = () => null;
  const Page = load('app/library/page.tsx', {
    react: hooks.react,
    'next/link': () => null,
    '@/lib/story/schema': { ageLabel: String },
    '../providers': { useApp: () => ({ library, deleteStory: id => deleted.push(id) }) },
    '../components/ui': { btnPrimary: '', COPING_NAME: {} },
    './DeleteStoryDialog': Dialog,
  });
  const render = () => hooks.render(Page);
  find(render(), node => node.props?.['aria-label'] === '두 번째 동화 펼치기').props.onClick();
  find(render(), node => node.props?.children === '삭제').props.onClick();
  assert.deepEqual(deleted, []);
  let dialog = find(render(), node => node.type === Dialog);
  assert.equal(dialog.props.title, '두 번째 동화');
  dialog.props.onCancel();
  assert.equal(find(render(), node => node.type === Dialog), undefined);
  assert.deepEqual(deleted, []);
  find(render(), node => node.props?.children === '삭제').props.onClick();
  dialog = find(render(), node => node.type === Dialog);
  dialog.props.onConfirm();
  assert.deepEqual(deleted, ['1']);
  assert.equal(find(render(), node => node.type === Dialog), undefined);
});
