'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeParams = normalizeParams;
function normalizeValue(value) {
  if (typeof value === 'string') {
    return value;
  }if (typeof value === 'number') {
    return String(value);
  } else if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  throw new Error('Invalid query parameter / url parameter value');
}

function normalizeParams(params) {
  var normalized = {};
  Object.keys(params).forEach(function (key) {
    normalized[key] = normalizeValue(params[key]);
  });
  return normalized;
}