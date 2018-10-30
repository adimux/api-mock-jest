import matchers from '../src/matchers';
import ApiMock from 'api-mock';
import jestDiff from 'jest-diff';

jest.mock('jest-diff', () => {
  return (expected, actual) => {
    return `diff(${JSON.stringify(expected)}, ${JSON.stringify(actual)})`;
  }
})

const {
  toHaveBeenRequested,
  toHaveBeenRequestedWith,
} = matchers;


function mockRouteFactory(name) {
  return { name };
}
function mockCallFactory({
  route = mockRouteFactory('a_route'),
  params = undefined,
  query = undefined,
  body = undefined
} = {}) {
  return {
    params,
    query,
    body,
    route,
  }
}
function print(v) {
  return typeof v ==='object' ? JSON.stringify(v) : v;
}

describe('ApiMock Matchers', () => {
  
  const mockMatcherContext = {
    utils: {
      printExpected: e => `expected(${print(e)})`,
      printReceived: r => `received(${print(r)})`,
    }
  }

  describe('toHaveBeenRequested', () => {
    let route = mockRouteFactory('get_dashboard');

    beforeEach(() => {
      ApiMock.called = jest.fn();
    })

    it('should mark as pass if the route was called', () => {
      ApiMock.called.mockReturnValue(true);
      const result = toHaveBeenRequested.call(mockMatcherContext, route);
      expect(result.pass).toBe(true);
      expect(ApiMock.called).toHaveBeenCalledWith('get_dashboard');
    })

    it('should mark as not passed if the route was not called', () => {
      ApiMock.called.mockReturnValue(false);
      const result = toHaveBeenRequested.call(mockMatcherContext, route);
      expect(result.pass).toBe(false);
      expect(ApiMock.called).toHaveBeenCalledWith('get_dashboard');
    })

    it('should return an appropriate message describing the assertion, in both cases', () => {
      ApiMock.called.mockReturnValue(false);
      const result = toHaveBeenRequested.call(mockMatcherContext, route);
      expect(result.message()).toEqual('Expect expected(get_dashboard) to have been requested');
    })
  })

  describe('toHaveBeenRequestedWith', () => {
    let route = mockRouteFactory('get_dashboard');

    beforeEach(() => {
      ApiMock.calls.filter = jest.fn();
    })

    describe('Given the route was called with the right options', () => {
      let routeCalls;
      let matchingCalls;
      let matchResult;
      let expectedOptions = {
            // Query params
            query: {
              foo: 'bar',
            },
            // URL params
            params: {
              cart_id: '1'
            },
            body: {
              id: 1,
              name: 'banana'
            }
          };

      beforeEach(() => {
        routeCalls = [mockCallFactory()];
        matchingCalls = [mockCallFactory()];
        ApiMock.calls.filter.mockReturnValueOnce({ calls: routeCalls });
        ApiMock.calls.filter.mockReturnValueOnce({ calls: matchingCalls });
        matchResult = toHaveBeenRequestedWith.call(
          mockMatcherContext,
          route,
          expectedOptions);
      })

      it('should mark the test as passed', () => {
        expect(matchResult.pass).toBe(true);
      })

      it('should return a message describing the assertion that was made', () => {
        const expectedMessage = `Expect expected(get_dashboard) to have been requested with:\nexpected(${JSON.stringify(expectedOptions)})`;
        expect(matchResult.message()).toEqual(expectedMessage);
      })
    })

    describe('Given the route was called, but with the wrong options', () => {
      let lastCall;
      let matchResult;
      let expectedOptions = {
        // Query params
        query: {
          foo: 'bar',
        },
        // URL params
        params: {
          cart_id: '1'
        },
        body: {
          id: 1,
          name: 'banana'
        }
      };

      beforeEach(() => {
        lastCall = mockCallFactory({ query: { bla: 'bla' }, params: { si: 'so' }, route: { name: 'dashboard' } });
        ApiMock.calls.filter.mockReturnValueOnce({ calls: [mockRouteFactory(), mockRouteFactory(), lastCall] });
        ApiMock.calls.filter.mockReturnValueOnce({ calls: [] });
        matchResult = toHaveBeenRequestedWith.call(
          mockMatcherContext,
          route,
          expectedOptions);
      })

      it('should mark the test as failed', () => {
        expect(matchResult.pass).toBe(false);
      })

      it('should return a message describing the assertion that was made, with the difference between the expected options and the actual ones, for the last call that was made', () => {
        const actualOptions = { query: { bla: 'bla' }, params: { si: 'so' } };
        const expectedDiff = `diff(${print(expectedOptions)}, ${print(actualOptions)})`;
        const expectedMessage = `Expect expected(get_dashboard) to have been requested with:`
        + `\nexpected(${JSON.stringify(expectedOptions)})`
        + `\nReceived:`
        + `\nreceived(${JSON.stringify(actualOptions)})`
        + `\n\nDifference:`
        + `\n\n${expectedDiff}`;
        expect(matchResult.message()).toEqual(expectedMessage);
      })
    })
  })

  describe('Given the route was not called at all', () => {
    const route = mockRouteFactory('get_dashboard');
    let matchResult;
    let expectedOptions = {
      // Query params
      query: {
        foo: 'bar',
      },
      // URL params
      params: {
        cart_id: '1'
      },
      body: {
        id: 1,
        name: 'banana'
      }
    };

    beforeEach(() => {
      ApiMock.calls.filter.mockReturnValueOnce({ calls: [] });
      ApiMock.calls.filter.mockReturnValueOnce({ calls: [] });
      matchResult = toHaveBeenRequestedWith.call(
        mockMatcherContext,
        route,
        expectedOptions);
    })

    it('should mark the test as failed', () => {
      expect(matchResult.pass).toBe(false);
    })

    it('should return a message describing the assertion that was made', () => {
      const expectedMessage = `Expect expected(get_dashboard) to have been requested with:`
      + `\nexpected(${JSON.stringify(expectedOptions)})`
      + `\nReceived:`
      + `\nreceived(not called)`;
      expect(matchResult.message()).toEqual(expectedMessage);
    })
  })
})