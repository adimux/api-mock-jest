import diff from 'jest-diff';
import { normalizeParams, formDataToObject } from './utils';

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

function isFormData(obj) {
  if (window && window.FormData) {
    return obj instanceof window.FormData;
  }
  return false;
}

function normalizeBody(body) {
  if (isFormData(body)) {
    return formDataToObject(body);
  }
  return body;
}

function normalizeExpectedOptions(options) {
  const normalizedOpts = {};
  if ('params' in options) {
    normalizedOpts.params = normalizeParams(options.params);
  }
  if ('query' in options) {
    normalizedOpts.query = normalizeParams(options.query);
  }
  if ('body' in options) {
    normalizedOpts.body = normalizeBody(options.body);
  }
  return Object.assign({}, options, normalizedOpts);
}

function normalizeActualOptions(options) {
  const normalizedOpts = {};
  if (options.body) {
    normalizedOpts.body = normalizeBody(options.body);
  }
  return Object.assign({}, options, normalizedOpts);
}

export default function matchers(apiMock) {
  return {
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

      const routeCalled = routeCalls.length > 0;
      const optionsMatch = matchingCalls.length > 0;

      if (routeCalled && optionsMatch) {
        return {
          pass: true,
          message: () => `Expect ${this.utils.printExpected(route.name)} to have been requested with:\n${this.utils.printExpected(expectedOptions)}`,
        };
      } else if (routeCalled && !optionsMatch) {
        const call = last(routeCalls);
        const optionsKeys = Object.keys(expectedOptions);
        const actualOptions = pick(call, optionsKeys);
	const normExpected = normalizeExpectedOptions(expectedOptions);
	const normActual = normalizeActualOptions(actualOptions);
        const diffString = diff(normExpected, normActual, {
          expand: true,
        });

        return {
          actual: actualOptions,
          pass: false,
          message: () => `Expect ${this.utils.printExpected(route.name)} to have been requested with:\n`
            + `${this.utils.printExpected(normExpected)}\n`
            + `Received:\n`
            + `${this.utils.printReceived(normActual)}\n\nDifference:\n\n${diffString}`,
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
  };
}
