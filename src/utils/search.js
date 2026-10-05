export const normalizeSearchTerm = (value = '') => {
  return String(value ?? '').trim().toLowerCase();
};

export const matchesSearch = (text = '', query = '') => {
  const normalizedQuery = normalizeSearchTerm(query);

  if (!normalizedQuery) {
    return true;
  }

  return String(text ?? '').toLowerCase().includes(normalizedQuery);
};

export const matchesPartyFilter = (memberParty = '', selectedParty = 'all') => {
  if (!selectedParty || selectedParty === 'all') {
    return true;
  }

  return normalizeSearchTerm(memberParty) === normalizeSearchTerm(selectedParty);
};

export const getSearchResultSnippet = (content = '', query = '', maxLength = 180) => {
  const text = String(content ?? '').trim();
  const normalizedQuery = normalizeSearchTerm(query);

  if (!text) {
    return '';
  }

  if (!normalizedQuery) {
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
  }

  const lowerText = text.toLowerCase();
  const matchIndex = lowerText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
  }

  const contextSize = Math.max(60, Math.floor(maxLength / 2));
  const start = Math.max(0, matchIndex - contextSize);
  const end = Math.min(text.length, matchIndex + normalizedQuery.length + contextSize);

  let snippet = text.slice(start, end).trim();

  if (start > 0) {
    snippet = `…${snippet}`;
  }

  if (end < text.length) {
    snippet = `${snippet}…`;
  }

  return snippet;
};

export const buildTranscriptIndex = (speeches = [], members = [], query = '', selectedParty = 'all') => {
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const normalizedQuery = normalizeSearchTerm(query);

  return speeches
    .map((speech, index) => {
      const member = memberMap.get(speech.memberId) ?? {};
      const memberName = member.name ?? speech.attribution ?? '';
      const memberParty = member.party ?? '';

      if (!matchesPartyFilter(memberParty, selectedParty)) {
        return null;
      }

      const searchableFields = [
        { value: speech.content ?? '', weight: 3 },
        { value: speech.title ?? '', weight: 6 },
        { value: speech.subtitle ?? '', weight: 5 },
        { value: speech.attribution ?? '', weight: 4 },
        { value: memberName, weight: 8 }
      ];

      const exactScore = normalizedQuery
        ? searchableFields.reduce((total, field) => {
            const text = String(field.value ?? '');
            const lowerText = text.toLowerCase();

            if (!lowerText.includes(normalizedQuery)) {
              return total;
            }

            return total + field.weight * 10 + (lowerText.indexOf(normalizedQuery) === 0 ? field.weight * 2 : 0);
          }, 0)
        : 1;

      if (!normalizedQuery && exactScore <= 0) {
        return null;
      }

      const fallbackScore = normalizedQuery
        ? searchableFields.reduce((total, field) => {
            const text = String(field.value ?? '');
            const lowerText = text.toLowerCase();
            const matches = lowerText.match(new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || [];
            return total + matches.length * field.weight;
          }, 0)
        : 0;

      const score = normalizedQuery ? Math.max(exactScore, fallbackScore) : 1;

      if (normalizedQuery && score <= 0) {
        return null;
      }

      const resultId = speech.source_id || `${speech.memberId || 'speech'}-${speech.time || index}`;

      return {
        ...speech,
        id: resultId,
        memberName,
        memberParty,
        score,
        snippet: getSearchResultSnippet(speech.content ?? '', normalizedQuery),
        speechIndex: index,
      };
    })
    .filter(Boolean)
    .filter((entry) => {
      if (!normalizedQuery) {
        return true;
      }

      return entry.score > 0;
    })
    .sort((a, b) => {
      if (normalizedQuery) {
        return b.score - a.score || (a.time || '').localeCompare(b.time || '');
      }

      return (a.time || '').localeCompare(b.time || '');
    });
};

export const matchesSpeechSearch = ({
  content = '',
  attribution = '',
  title = '',
  subtitle = '',
  memberName = '',
  memberParty = '',
  selectedParty = 'all',
  query = ''
}) => {
  const normalizedQuery = normalizeSearchTerm(query);

  const matchesParty = matchesPartyFilter(memberParty, selectedParty);

  if (!matchesParty) {
    return false;
  }

  if (!normalizedQuery) {
    return true;
  }

  return [content, attribution, title, subtitle, memberName].some((value) =>
    matchesSearch(value, normalizedQuery)
  );
};
