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

export function formDataToObject (formData) {
  const output = {};
  formData.forEach(
    (value, key) => {
      // Check if property already exists
      if (Object.prototype.hasOwnProperty.call(output, key)) {
        let current = output[key];
        if ( !Array.isArray(current) ) {
          // If it's not an array, convert it to an array.
          current = output[key] = [current];
        }
        current.push(value); // Add the new value to the array.
      } else {
        output[key] = value;
      }
    }
  );
  return output;
}


