function normalizeValue(value) {
  if (typeof value === 'string') {
    return value;
  } if (typeof value === 'number') {
    return String(value);
  } else if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  throw new Error('Invalid query parameter / url parameter value');
}

export function normalizeParams(params) {
  const normalized = {};
  Object.keys(params).forEach((key) => {
    normalized[key] = normalizeValue(params[key]);
  });
  return normalized;
}

