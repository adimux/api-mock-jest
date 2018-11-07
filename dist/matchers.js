'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jestDiff = require('jest-diff');

var _jestDiff2 = _interopRequireDefault(_jestDiff);

var _apiMock = require('api-mock');

var _apiMock2 = _interopRequireDefault(_apiMock);

var _utils = require('./utils.js');

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

function normalizeOptions(options) {
  var normalizedOpts = {};
  if ('params' in options) {
    normalizedOpts.params = (0, _utils.normalizeParams)(options.params);
  }
  if ('query' in options) {
    normalizedOpts.query = (0, _utils.normalizeParams)(options.query);
  }
  return Object.assign({}, options, normalizedOpts);
}

exports.default = {
  toHaveBeenRequested: function toHaveBeenRequested(route) {
    var _this = this;

    var called = _apiMock2.default.called(route.name);

    return {
      pass: called,
      message: function message() {
        return 'Expect ' + _this.utils.printExpected(route.name) + ' to have been requested';
      }
    };
  },
  toHaveBeenRequestedWith: function toHaveBeenRequestedWith(route, expectedOptions) {
    var _this2 = this;

    var routeCalls = _apiMock2.default.calls.filter(route.name);
    var matchingCalls = _apiMock2.default.calls.filter(route.name, expectedOptions);

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
      var diffString = (0, _jestDiff2.default)(normalizeOptions(expectedOptions), actualOptions, {
        expand: true
      });

      return {
        actual: actualOptions,
        pass: false,
        message: function message() {
          return 'Expect ' + _this2.utils.printExpected(route.name) + ' to have been requested with:\n' + (_this2.utils.printExpected(expectedOptions) + '\n') + 'Received:\n' + (_this2.utils.printReceived(actualOptions) + '\n\nDifference:\n\n' + diffString);
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