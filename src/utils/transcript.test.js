import { normalizeSpeech, stripHtml } from './transcript';

describe('transcript utilities', () => {
  test('strips html tags and collapses whitespace', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  test('normalizes a raw speech object into the app shape', () => {
    const normalized = normalizeSpeech({
      attribution: { en: 'The Speaker' },
      h1: { en: 'Opening remarks' },
      h2: { en: 'Debate order' },
      content: { en: '<i>Hello</i> there' },
      politician_url: 'https://api.openparliament.ca/politicians/123/',
      time: '2026-09-25 12:15:00',
      source_id: '42',
    });

    expect(normalized.attribution).toBe('The Speaker');
    expect(normalized.memberId).toBe('123');
    expect(normalized.content).toBe('Hello there');
    expect(normalized.title).toBe('Opening remarks');
    expect(normalized.subtitle).toBe('Debate order');
    expect(normalized.source_id).toBe('42');
  });
});
