import diff from 'jest-diff';
import apiMock from 'api-mock';
import { normalizeParams } from './utils.js';

function pick(obj, keys) {
  const res = {};
  keys.forEach((k) => {
    if (k in obj) {
      res[k] = obj[k];
    }
  })
  return res;
}

function last(list) {
  return list[list.length - 1];
}

function normalizeOptions(options) {
  const normalizedOpts = {};
  if ('params' in options) {
    normalizedOpts.params = normalizeParams(options.params);
  }
  if ('query' in options) {
    normalizedOpts.query = normalizeParams(options.query);
  }
  return Object.assign({}, options, normalizedOpts);
}

export default {
  toHaveBeenRequested(route) {
    const called = apiMock.called(route.name);

    return {
      pass: called,
      message: () => `Expect ${this.utils.printExpected(route.name)} to have been requested`,
    };
  },
  toHaveBeenRequestedWith(route, expectedOptions) {
    const routeCalls = apiMock.calls.filter(route.name);
    const matchingCalls = apiMock.calls.filter(route.name, expectedOptions);

    const routeCalled = routeCalls.calls.length > 0;
    const optionsMatch = matchingCalls.calls.length > 0;

    if (routeCalled && optionsMatch) {
      return {
        pass: true,
        message: () => `Expect ${this.utils.printExpected(route.name)} to have been requested with:\n${this.utils.printExpected(expectedOptions)}`,
      };
    } else if (routeCalled && !optionsMatch) {
      const call = last(routeCalls.calls);
      const optionsKeys = Object.keys(expectedOptions);
      const actualOptions = pick(call, optionsKeys);
      const diffString = diff(normalizeOptions(expectedOptions), actualOptions, {
        expand: true,
      });

      return {
        actual: actualOptions,
        pass: false,
        message: () => `Expect ${this.utils.printExpected(route.name)} to have been requested with:\n`
        + `${this.utils.printExpected(expectedOptions)}\n`
        + `Received:\n`
        + `${this.utils.printReceived(actualOptions)}\n\nDifference:\n\n${diffString}`,
      };
    }

    return {
      actual: 'not called',
      pass: false,
      message: () => `Expect ${this.utils.printExpected(route.name)} to have been requested with:\n`
      + `${this.utils.printExpected(expectedOptions)}\n`
      + `Received:\n${this.utils.printReceived('not called')}`,
    };
  },
}
