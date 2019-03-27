'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeParams = normalizeParams;
exports.formDataToObject = formDataToObject;
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

function formDataToObject(formData) {
  var output = {};
  formData.forEach(function (value, key) {
    if (Object.prototype.hasOwnProperty.call(output, key)) {
      var current = output[key];
      if (!Array.isArray(current)) {
        current = output[key] = [current];
      }
      current.push(value);
    } else {
      output[key] = value;
    }
  });
  return output;
}