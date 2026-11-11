const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../lib/story/paragraphs.ts');
const mod = new Module(filename, module);
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { storyParagraphs } = mod.exports;

test('줄바꿈 없는 동화를 짧은 문단으로 표시하고 모든 문장을 보존한다', () => {
  const text = '햇살이 들어와요. 토끼가 일어났어요. 꼬리를 흔들어요. 오늘도 괜찮아. 빵 냄새가 나요.';
  const paragraphs = storyParagraphs(text);
  assert.equal(paragraphs.length, 3);
  assert.equal(paragraphs.join(' '), text);
  assert.equal(paragraphs[0], '햇살이 들어와요. 토끼가 일어났어요.');
});

test('기존 문단, 대사 줄바꿈과 빈 줄을 유지한다', () => {
  const text = '  햇살이 들어와요.\r\n토끼가 일어났어요.\r\n \r\n\r\n“안녕!”\r\n친구가 손을 흔들어요.  ';
  assert.deepEqual(storyParagraphs(text), [
    '햇살이 들어와요.\n토끼가 일어났어요.',
    '“안녕!”\n친구가 손을 흔들어요.',
  ]);
});

test('물음표, 느낌표와 여러 문장이 담긴 대사를 중간에서 나누지 않는다', () => {
  for (const [open, close] of [['“', '”'], ['"', '"'], ['「', '」'], ['『', '』']]) {
    const dialogue = `${open}안녕! 잘 잤니? 같이 놀자.${close}`;
    const text = `토끼가 말했어요. ${dialogue} 친구가 웃었어요. 둘은 밖으로 나갔어요.`;
    const paragraphs = storyParagraphs(text);
    assert.ok(paragraphs.some(paragraph => paragraph.includes(dialogue)));
    assert.equal(paragraphs.join(' '), text);
  }
});

test('마지막에 문장부호가 없어도 글을 빠뜨리지 않는다', () => {
  const text = '토끼가 뛰어요! 어디로 갈까요? 작은 숲속으로';
  assert.equal(storyParagraphs(text).join(' '), text);
  assert.deepEqual(storyParagraphs('콩닥콩닥, 괜찮아 괜찮아'), ['콩닥콩닥, 괜찮아 괜찮아']);
  assert.deepEqual(storyParagraphs(' \r\n '), []);
});

test('문장 분리 기능이 없는 브라우저에서는 원문을 표시한다', () => {
  const original = Intl.Segmenter;
  try {
    Intl.Segmenter = undefined;
    const text = '토끼가 뛰어요. 친구가 따라가요.';
    assert.deepEqual(storyParagraphs(text), [text]);
  } finally {
    Intl.Segmenter = original;
  }
});
