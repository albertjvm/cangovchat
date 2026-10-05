export const stripHtml = (value = '') => {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const normalizeSpeech = (rawSpeech = {}) => {
  const {
    attribution,
    h1,
    h2,
    content,
    politician_url,
    time,
    source_id,
    ...rest
  } = rawSpeech;

  const memberId = politician_url?.split('/')[2] ?? null;

  return {
    ...rest,
    attribution: attribution?.en ?? attribution ?? '',
    memberId,
    content: stripHtml(content?.en ?? content ?? ''),
    title: h1?.en ?? h1 ?? '',
    subtitle: h2?.en ?? h2 ?? '',
    time: time ?? '',
    source_id: source_id ?? '',
  };
};
