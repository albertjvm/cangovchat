import {
  buildTranscriptIndex,
  getSearchResultSnippet,
  matchesSearch,
  matchesSpeechSearch,
  normalizeSearchTerm,
} from './search';

describe('search utilities', () => {
  test('normalizes query strings for comparison', () => {
    expect(normalizeSearchTerm('  FINANCE  ')).toBe('finance');
  });

  test('matches content case-insensitively', () => {
    expect(matchesSearch('The Minister of Finance', 'FINANCE')).toBe(true);
    expect(matchesSearch('The Minister of Finance', 'security')).toBe(false);
  });

  test('matches member and transcript metadata', () => {
    expect(matchesSpeechSearch({
      content: 'The minister spoke on tax policy',
      attribution: 'The Speaker',
      title: 'Budget debate',
      subtitle: 'Order of business',
      memberName: 'Tom Kmiec',
      memberParty: 'Conservative',
      selectedParty: 'all',
      query: 'kmiec'
    })).toBe(true);
  });

  test('supports filtering by party', () => {
    expect(matchesSpeechSearch({
      content: 'The minister spoke on tax policy',
      attribution: 'The Speaker',
      title: 'Budget debate',
      subtitle: 'Order of business',
      memberName: 'Tom Kmiec',
      memberParty: 'Conservative',
      selectedParty: 'Liberal',
      query: 'kmiec'
    })).toBe(false);
  });

  test('treats an empty search as matching everything', () => {
    expect(matchesSearch('This is a speech', '')).toBe(true);
  });

  test('extracts the snippet around the actual search hit', () => {
    const snippet = getSearchResultSnippet(
      'The government will support the tax credit for families and expand the tax relief program next quarter.',
      'tax relief'
    );

    expect(snippet).toContain('tax relief');
    expect(snippet).toContain('support');
    expect(snippet).toContain('program');
    expect(snippet.length).toBeLessThan(220);
  });

  test('builds a transcript index and ranks exact matches higher than weaker matches', () => {
    const speeches = [
      {
        source_id: 'a',
        memberId: 'm-1',
        content: 'We will review tax policy and discuss funding for the next fiscal year.',
        attribution: 'The Speaker',
        title: 'Budget review',
        subtitle: 'Order of business',
        time: '2026-01-01 10:00:00'
      },
      {
        source_id: 'b',
        memberId: 'm-2',
        content: 'The tax relief package is essential to families and small businesses.',
        attribution: 'The Speaker',
        title: 'Tax relief',
        subtitle: 'Committee hearing',
        time: '2026-01-02 11:00:00'
      }
    ];

    const members = [
      { id: 'm-1', name: 'Jane Brown', party: 'Liberal' },
      { id: 'm-2', name: 'John Smith', party: 'Conservative' }
    ];

    const indexed = buildTranscriptIndex(speeches, members, 'tax', 'all');

    expect(indexed[0].source_id).toBe('b');
    expect(indexed[0].score).toBeGreaterThan(indexed[1].score);
    expect(indexed[0].snippet).toContain('tax relief');
  });
});
