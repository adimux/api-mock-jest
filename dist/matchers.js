'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = matchers;

var _jestDiff = require('jest-diff');

var _jestDiff2 = _interopRequireDefault(_jestDiff);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function pick(obj, keys) {
  var res = {};
  keys.forEach(function (k) {
    if (k in obj) {
      res[k] = obj[k];
    }
  });
  return res;
}

function last(list) {
  return list[list.length - 1];
}

function isFormData(obj) {
  if (window && window.FormData) {
    return obj instanceof window.FormData;
  }
  return false;
}

function normalizeBody(body) {
  if (isFormData(body)) {
    return (0, _utils.formDataToObject)(body);
  }
  return body;
}

function normalizeExpectedOptions(options) {
  var normalizedOpts = {};
  if ('params' in options) {
    normalizedOpts.params = (0, _utils.normalizeParams)(options.params);
  }
  if ('query' in options) {
    normalizedOpts.query = (0, _utils.normalizeParams)(options.query);
  }
  if ('body' in options) {
    normalizedOpts.body = normalizeBody(options.body);
  }
  return Object.assign({}, options, normalizedOpts);
}

function normalizeActualOptions(options) {
  var normalizedOpts = {};
  if (options.body) {
    normalizedOpts.body = normalizeBody(options.body);
  }
  return Object.assign({}, options, normalizedOpts);
}

function matchers(apiMock) {
  return {
    toHaveBeenRequested: function toHaveBeenRequested(route) {
      var _this = this;

      var called = apiMock.called(route.name);

      return {
        pass: called,
        message: function message() {
          return 'Expect ' + _this.utils.printExpected(route.name) + ' to have been requested';
        }
      };
    },
    toHaveBeenRequestedWith: function toHaveBeenRequestedWith(route, expectedOptions) {
      var _this2 = this;

      var routeCalls = apiMock.calls.filter(route.name);
      var matchingCalls = apiMock.calls.filter(route.name, expectedOptions);

      var routeCalled = routeCalls.length > 0;
      var optionsMatch = matchingCalls.length > 0;

      if (routeCalled && optionsMatch) {
        return {
          pass: true,
          message: function message() {
            return 'Expect ' + _this2.utils.printExpected(route.name) + ' to have been requested with:\n' + _this2.utils.printExpected(expectedOptions);
          }
        };
      } else if (routeCalled && !optionsMatch) {
        var call = last(routeCalls);
        var optionsKeys = Object.keys(expectedOptions);
        var actualOptions = pick(call, optionsKeys);
        var normExpected = normalizeExpectedOptions(expectedOptions);
        var normActual = normalizeActualOptions(actualOptions);
        var diffString = (0, _jestDiff2.default)(normExpected, normActual, {
          expand: true
        });

        return {
          actual: actualOptions,
          pass: false,
          message: function message() {
            return 'Expect ' + _this2.utils.printExpected(route.name) + ' to have been requested with:\n' + (_this2.utils.printExpected(normExpected) + '\n') + 'Received:\n' + (_this2.utils.printReceived(normActual) + '\n\nDifference:\n\n' + diffString);
          }
        };
      }

      return {
        actual: 'not called',
        pass: false,
        message: function message() {
          return 'Expect ' + _this2.utils.printExpected(route.name) + ' to have been requested with:\n' + (_this2.utils.printExpected(expectedOptions) + '\n') + ('Received:\n' + _this2.utils.printReceived('not called'));
        }
      };
    }
  };
}