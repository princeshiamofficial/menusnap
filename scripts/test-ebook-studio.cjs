const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const JSZip = require('jszip');
const sharp = require('sharp');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Document, Packer, Paragraph } = require('docx');

function load(relative, mocks = {}) {
  const filename = path.resolve(relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const localRequire = Module.createRequire(filename);
  const result = { exports: {} };
  const requireMock = name => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/')) {
      const file = `src/${name.slice(2)}`;
      return load(fs.existsSync(`${file}.ts`) ? `${file}.ts` : `${file}.tsx`, mocks);
    }
    return localRequire(name);
  };
  new Function('require', 'module', 'exports', 'console', compiled)(requireMock, result, result.exports, { ...console, error: () => {} });
  return result.exports;
}

async function main() {
  const model = load('src/lib/ebook-page-design.ts');
  const imports = load('src/lib/ebook-files.ts');
  const base = load('src/lib/ebook-page-default.ts').defaultEbookPageDesign;
  model.ebookPageDesignSchema.parse(base);
  assert.equal(base.sections[0].items.length, 8);
  const design = { ...base, title: 'Sample page', appearance: 'light', heroLayout: 'split', hero: { ...base.hero, heading: '<script>alert("x")</script>', coverSourceId: 7 } };
  const revision = (id, parentId) => ({ id, parentId, prompt: `Edit ${id}`, response: 'Saved', createdAt: new Date(0).toISOString() });
  const revisions = [revision(1, null), revision(2, 1), revision(3, 1)];
  assert.equal(model.ebookHistoryTarget(revisions, 2, 'undo'), 1);
  assert.equal(model.ebookHistoryTarget(revisions, 1, 'redo'), 3);
  assert.equal(model.ebookHistoryTarget(revisions, 1, 'undo'), null);
  assert.equal(model.ebookHistoryTarget(revisions, null, 'redo'), 1);
  assert.throws(() => model.ebookHistoryTarget(revisions, null, 'undo'));
  assert.deepEqual(model.ebookConversation(revisions, 2).map(item => item.id), [1, 2]);
  assert.throws(() => model.ebookConversation([revision(1, 1)], 1));
  assert.throws(() => model.ebookPageDesignSchema.parse({ ...design, theme: 'url(javascript:alert(1))' }));
  assert.throws(() => model.ebookPageDesignSchema.parse({ title: 'PDF', pages: [] }));
  assert.deepEqual(model.ebookPageImageIds(design), [7]);
  assert.throws(() => model.validateEbookPageImages(design, [{ id: 7, mime: 'application/pdf' }]));
  model.validateEbookPageImages(design, [{ id: 7, mime: 'image/png' }]);
  const renderer = load('src/components/ebook/ebook-landing-page.tsx', { 'next/navigation': { useRouter: () => ({ push: () => {} }) } });
  const html = renderToStaticMarkup(React.createElement(renderer.EbookLandingPage, { design, ebookId: 4, preview: true }));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('/api/admin/ebooks/4/sources/7/'));
  assert.ok(html.includes('id="download-section"') && html.includes('name="email"'));
  assert.ok(html.includes('disabled=""'));
  const liveHtml = renderToStaticMarkup(React.createElement(renderer.EbookLandingPage, { design, ebookId: 4 }));
  assert.ok(liveHtml.includes('/api/ebook/assets/4/7/'));
  assert.ok(!liveHtml.includes('disabled=""'));
  console.log('PASS: page-only schema, original copy, safe shared page renderer, preview form protection and branching undo/redo');

  const { EbookAttachmentCard } = load('src/components/ebook/ebook-attachment-card.tsx');
  const imageCard = renderToStaticMarkup(React.createElement(EbookAttachmentCard, { name: 'cover.png', mime: 'image/png', url: '/protected/cover', onRemove: () => {} }));
  assert.ok(imageCard.includes('<img') && imageCard.includes('alt="cover.png"'));
  assert.ok(imageCard.includes('aria-label="Remove cover.png"'));
  const fileCard = renderToStaticMarkup(React.createElement(EbookAttachmentCard, { name: 'notes<test>.pdf', mime: 'application/pdf' }));
  assert.ok(fileCard.includes('notes&lt;test&gt;.pdf') && !fileCard.includes('<img'));

  console.log('PASS: attachment card thumbnails, removal labels and filename escaping');

  const png = await sharp({ create: { width: 32, height: 24, channels: 3, background: '#ff7700' } }).png().toBuffer();
  assert.equal((await imports.prepareEbookFile('cover.png', png)).mime, 'image/png');
  const word = await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph('Reference text & details'), new Paragraph('Second paragraph')] }] }));
  assert.equal((await imports.prepareEbookFile('guide.docx', word)).text, 'Reference text & details\nSecond paragraph');
  assert.equal((await imports.prepareEbookFile('guide.pdf', Buffer.from('%PDF-1.7\nfixture'))).mime, 'application/pdf');
  await assert.rejects(imports.prepareEbookFile('fake.pdf', png));
  await assert.rejects(imports.prepareEbookFile('unsafe.svg', Buffer.from('<svg onload="alert(1)"></svg>')));
  await assert.rejects(imports.prepareEbookFile('large.pdf', Buffer.alloc(imports.MAX_EBOOK_FILE_BYTES + 1)));
  const invalidWord = await new JSZip().file('word/document.xml', '<!DOCTYPE doc [<!ENTITY test "bad">]><w:document/>').generateAsync({ type: 'nodebuffer' });
  await assert.rejects(imports.prepareEbookFile('unsafe.docx', invalidWord));
  console.log('PASS: reference uploads, DOCX text, image normalization, signature/size checks and XML entity rejection');

  let permission = false;
  let current = 2;
  let publication = null;
  let commitCount = 0;
  let rollbackCount = 0;
  let insertedDraft = false;
  let sourceAttached = true;
  const documents = new Map(revisions.map(item => [item.id, { ...design, title: `Page version ${item.id}` }]));
  const invalidations = [];
  const transaction = {
    beginTransaction: async () => {}, release: () => {},
    commit: async () => { commitCount++; }, rollback: async () => { rollbackCount++; },
    execute: async (sql, params) => {
      if (sql.startsWith('SELECT current_revision_id')) return [[{ current_revision_id: current }]];
      if (sql.startsWith('SELECT id FROM studio_ebooks')) return [params[0] === 4 ? [{ id: 4 }] : []];
      if (sql.startsWith('SELECT id FROM studio_ebook_sources')) return [sql.includes('AND id = ?') ? (params[0] === 4 && params[1] === 7 ? [{ id: 7 }] : []) : (sourceAttached ? [{ id: 7 }] : [])];
      if (sql.startsWith('UPDATE studio_ebook_sources')) { sourceAttached = false; return [{ affectedRows: 1 }]; }
      if (sql.startsWith('INSERT INTO studio_ebook_revisions')) {
        const id = revisions.length + 1;
        revisions.push({ ...revision(id, params[1]), prompt: params[2], response: params[3] });
        documents.set(id, JSON.parse(params[4]));
        return [{ insertId: id }];
      }
      if (sql.startsWith('UPDATE studio_ebooks')) { current = params[0]; return [{ affectedRows: 1 }]; }
      if (sql.startsWith('INSERT INTO studio_ebook_page_publication')) { publication = { ebook_id: params[0], revision_id: params[1] }; return [{ affectedRows: 1 }]; }
      throw new Error(`Unexpected transaction call: ${sql}`);
    },
  };
  const pool = { getConnection: async () => transaction, execute: async (sql, params = []) => {
    if (sql.startsWith('CREATE TABLE')) return [{}];
    if (sql.startsWith('SHOW COLUMNS')) return [[{ Field: 'is_attached' }]];
    if (sql.startsWith('INSERT INTO studio_ebooks')) { insertedDraft = true; return [{ insertId: 8 }]; }
    if (sql.startsWith('SELECT * FROM studio_ebooks')) return [[{ id: params[0], title: 'Page draft', current_revision_id: params[0] === 4 ? current : null }]];
    if (sql.startsWith('SELECT id, name, mime')) return [params[0] === 4 ? [{ id: 7, name: 'cover.png', mime: 'image/png', is_attached: sourceAttached ? 1 : 0 }] : []];
    if (sql.startsWith('SELECT id, parent_id')) return [params[0] === 4 ? revisions.map(item => ({ id: item.id, parent_id: item.parentId, prompt: item.prompt, response: item.response, created_at: item.createdAt })) : []];
    if (sql.startsWith('SELECT document')) return [[{ document: JSON.stringify(documents.get(params[0] === 4 ? params[1] : params[0])) }]];
    if (sql.startsWith('SELECT ebook_id, revision_id')) return [publication ? [publication] : []];
    if (sql.startsWith('SELECT p.ebook_id')) return [publication?.revision_id ? [{ ebook_id: publication.ebook_id, document: JSON.stringify(documents.get(publication.revision_id)) }] : []];
    if (sql.startsWith('SELECT * FROM studio_ebook_sources')) return [sourceAttached ? [{ id: 7, name: 'cover.png', mime: 'image/png', filename: 'fixture.png' }] : []];
    if (sql.startsWith('SELECT name, mime, filename')) return [[{ name: 'cover.png', mime: 'image/png', filename: 'fixture.png' }]];
    if (sql.startsWith('UPDATE studio_ebooks')) {
      if (params[3] !== current) return [{ affectedRows: 0 }];
      current = params[0]; return [{ affectedRows: 1 }];
    }
    throw new Error(`Unexpected database call: ${sql}`);
  } };
  let aiOutput = { design, response: 'A redesigned client landing page.' };
  let aiInput;
  let concurrentEdit = false;
  const actions = load('src/app/actions/ebook-studio.ts', {
    '@/lib/mysql': pool,
    './admin-users': { checkAdminPermission: async () => permission },
    'next/cache': { revalidatePath: location => invalidations.push(location) },
    'node:fs/promises': { readFile: async () => png },
    genkit: { genkit: () => ({ generate: async input => { aiInput = input; if (concurrentEdit) current = 1; return { output: aiOutput }; } }) },
    '@genkit-ai/googleai': { googleAI: () => ({}) },
  });
  for (const operation of [() => actions.listStudioEbooks(), () => actions.createStudioEbook(), () => actions.getStudioEbook(4), () => actions.uploadStudioEbook(new FormData()), () => actions.readStudioEbookSource(4, 7), () => actions.detachStudioEbookSource(4, 7), () => actions.redesignStudioEbook(4, 2, 'New hero'), () => actions.moveStudioEbookHistory(4, 2, 'undo'), () => actions.publishStudioEbook(4, 2)]) {
    const response = await operation();
    assert.equal(response.success, false);
    assert.match(response.error, /permission/);
  }
  permission = true;
  const created = await actions.createStudioEbook();
  assert.equal(created.success, true);
  assert.equal(insertedDraft, true);
  assert.equal(created.data.currentRevisionId, null);
  assert.deepEqual(created.data.sources, []);
  assert.equal((await actions.getPublishedEbookPage()).data, null);
  assert.equal((await actions.moveStudioEbookHistory(4, 2, 'undo')).success, true);
  assert.equal(current, 1);
  assert.equal((await actions.moveStudioEbookHistory(4, 1, 'redo')).success, true);
  assert.equal(current, 3);
  assert.equal((await actions.moveStudioEbookHistory(4, 3, 'restore', 2)).success, true);
  assert.equal((await actions.moveStudioEbookHistory(4, 2, 'restore', 999)).success, false);
  assert.equal((await actions.moveStudioEbookHistory(4, 1, 'restore', null)).success, false);
  assert.equal((await actions.publishStudioEbook(4, 1)).success, false);
  assert.equal((await actions.publishStudioEbook(4, 2)).success, true);
  assert.equal((await actions.getPublishedEbookPage()).data.design.title, 'Page version 2');
  assert.ok(invalidations.includes('/ebook'));
  assert.equal((await actions.moveStudioEbookHistory(4, 2, 'restore', 3)).success, true);
  assert.equal((await actions.getPublishedEbookPage()).data.design.title, 'Page version 2');
  assert.equal((await actions.readPublishedEbookImage(4, 7)).success, true);
  assert.equal((await actions.readPublishedEbookImage(4, 99)).success, false);
  assert.equal((await actions.readPublishedEbookImage(99, 7)).success, false);
  console.log('PASS: admin authorization, upload-free page drafts, saved undo/redo/restore, explicit publication and private reference isolation');

  const savedKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'unit-test-only-never-transmitted';
  try {
    assert.equal((await actions.redesignStudioEbook(4, 3, 'Redesign the client /ebook page')).success, true);
    assert.equal(current, 4);
    assert.match(aiInput.prompt[0].text, /WEB PAGE/);
    assert.equal(aiInput.system, undefined);
    assert.equal(JSON.parse(aiInput.prompt[1].text).targetPage, '/ebook');
    assert.ok(JSON.parse(aiInput.prompt[1].text).currentPageDesign);
    assert.deepEqual(JSON.parse(aiInput.prompt[1].text).recentConversation.map(item => item.request), ['Edit 1', 'Edit 3']);
    assert.equal(aiInput.prompt[3].media.contentType, 'image/png');
    assert.equal((await actions.getPublishedEbookPage()).data.design.title, 'Page version 2');
    aiOutput = { design: null, response: 'Please clarify the requested page change.' };
    assert.equal((await actions.redesignStudioEbook(4, 4, 'Change the hero')).success, false);
    assert.equal(current, 4);
    aiOutput = { design: { ...design, hero: { ...design.hero, coverSourceId: 999 } }, response: 'Invalid image' };
    assert.equal((await actions.redesignStudioEbook(4, 4, 'Change cover')).success, false);
    const commitsBefore = commitCount;
    aiOutput = { design, response: 'New design' }; concurrentEdit = true;
    assert.equal((await actions.redesignStudioEbook(4, 4, 'Change it again')).success, false);
    assert.equal(commitCount, commitsBefore);
    assert.equal(rollbackCount, 1);
  } finally {
    if (savedKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = savedKey;
  }
  assert.equal((await actions.moveStudioEbookHistory(4, 1, 'restore', null)).success, true);
  assert.equal((await actions.getPublishedEbookPage()).data.design.title, 'Page version 2');
  assert.equal((await actions.publishStudioEbook(4, null)).success, true);
  assert.equal((await actions.getPublishedEbookPage()).data, null);
  assert.equal((await actions.readPublishedEbookImage(4, 7)).success, false);
  console.log('PASS: page-targeted AI prompt, draft-only saves, failed generation protection, concurrent-edit rollback and publishing the original page');

  assert.equal((await actions.moveStudioEbookHistory(4, null, 'restore', 2)).success, true);
  assert.equal((await actions.publishStudioEbook(4, 2)).success, true);
  assert.equal((await actions.detachStudioEbookSource(4, 99)).success, false);
  assert.equal(sourceAttached, true);
  const detached = await actions.detachStudioEbookSource(4, 7);
  assert.equal(detached.success, true);
  assert.equal(detached.data.sources[0].attached, false);
  assert.equal((await actions.getStudioEbook(4)).data.sources[0].attached, false);
  assert.equal((await actions.readStudioEbookSource(4, 7)).success, true);
  assert.equal((await actions.readPublishedEbookImage(4, 7)).success, true);
  assert.equal((await actions.detachStudioEbookSource(4, 7)).success, true);
  assert.equal((await actions.publishStudioEbook(4, 2)).success, true);
  process.env.GEMINI_API_KEY = 'unit-test-only-never-transmitted';
  try {
    concurrentEdit = false;
    assert.equal((await actions.redesignStudioEbook(4, 2, 'Keep the design and change the heading')).success, true);
    assert.deepEqual(JSON.parse(aiInput.prompt[1].text).sourceFiles, []);
    assert.equal(aiInput.prompt.length, 2);
    assert.equal((await actions.readPublishedEbookImage(4, 7)).success, true);
  } finally {
    if (savedKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = savedKey;
  }
  console.log('PASS: saved removal persists after reload, rejects foreign IDs, excludes detached files from AI, and preserves published and historical images');
  assert.equal((await actions.moveStudioEbookHistory(4, current, 'restore', null)).success, true);
  assert.equal((await actions.publishStudioEbook(4, null)).success, true);

  const sourceRoute = load('src/app/api/admin/ebooks/[id]/sources/[sourceId]/route.ts', { '@/app/actions/ebook-studio': { readStudioEbookSource: async () => ({ success: false, error: 'Forbidden' }) } });
  assert.equal((await sourceRoute.GET(new Request('http://localhost/source'), { params: Promise.resolve({ id: '4', sourceId: '7' }) })).status, 403);
  const publicRoute = load('src/app/api/ebook/assets/[ebookId]/[sourceId]/route.ts', { '@/app/actions/ebook-studio': actions });
  assert.equal((await publicRoute.GET(new Request('http://localhost/image'), { params: Promise.resolve({ ebookId: '4', sourceId: '7' }) })).status, 404);
  let leadQueries = 0;
  const leads = load('src/app/actions/ebook.ts', { '@/lib/mysql': { execute: async () => { leadQueries++; return [[]]; } } });
  assert.equal((await leads.submitEbookLead('invalid')).success, false);
  assert.equal(leadQueries, 0);
  assert.equal((await leads.submitEbookLead('reader@example.com')).success, true);
  console.log('PASS: protected admin source route, unpublished public image rejection and server-side email validation');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
