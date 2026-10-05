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
