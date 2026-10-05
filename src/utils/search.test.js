import { matchesSearch, normalizeSearchTerm } from './search';

describe('search utilities', () => {
  test('normalizes query strings for comparison', () => {
    expect(normalizeSearchTerm('  FINANCE  ')).toBe('finance');
  });

  test('matches content case-insensitively', () => {
    expect(matchesSearch('The Minister of Finance', 'FINANCE')).toBe(true);
    expect(matchesSearch('The Minister of Finance', 'security')).toBe(false);
  });

  test('treats an empty search as matching everything', () => {
    expect(matchesSearch('This is a speech', '')).toBe(true);
  });
});
