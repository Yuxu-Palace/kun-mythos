import { assertType, describe, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(
  ({
    isObject,
    isPlainObject,
    isArray,
    isSymbol,
    isPropertyKey,
    isNaN,
    isNull,
    isNullOrUndef,
    isNumber,
    isPlainNumber,
    isPlainSymbol,
    isString,
    isUndef,
    isTrue,
    isFalse,
    isBoolean,
    isFalsy,
    isTruthy,
    isFunction,
    isPromise,
  }) => {
    test('导出检查', () => {
      expect(typeof isPromise).toBe('function');
      expect(typeof isObject).toBe('function');
      expect(typeof isArray).toBe('function');
      expect(typeof isSymbol).toBe('function');
      expect(typeof isPlainObject).toBe('function');
      expect(typeof isPropertyKey).toBe('function');
      expect(typeof isNaN).toBe('function');
      expect(typeof isNull).toBe('function');
      expect(typeof isNullOrUndef).toBe('function');
      expect(typeof isNumber).toBe('function');
      expect(typeof isPlainNumber).toBe('function');
      expect(typeof isPlainSymbol).toBe('function');
      expect(typeof isString).toBe('function');
      expect(typeof isUndef).toBe('function');
      expect(typeof isTrue).toBe('function');
      expect(typeof isFalse).toBe('function');
      expect(typeof isBoolean).toBe('function');
      expect(typeof isFalsy).toBe('function');
      expect(typeof isTruthy).toBe('function');
      expect(typeof isFunction).toBe('function');
    });

    test('isPromise', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(1)).toBe(false);
      expect(isPromise(Promise.reject().catch(() => {}))).toBe(true);
      expect(isPromise('1')).toBe(false);
      expect(isPromise(Symbol('test'))).toBe(false);
      expect(isPromise({})).toBe(false);
      expect(isPromise([])).toBe(false);
      expect(isPromise(new Promise(() => {}))).toBe(true);
      // biome-ignore lint/suspicious/noThenProperty: test
      expect(isPromise({ then: () => {} })).toBe(true);
    });

    test('isFunction', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(1)).toBe(false);
      expect(isFunction('1')).toBe(false);
      expect(isFunction(Symbol('test'))).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction([])).toBe(false);
    });

    test('isTruthy', () => {
      expect(isTruthy(true)).toBe(true);
      expect(isTruthy(false)).toBe(false);
      expect(isTruthy('true')).toBe(true);
      expect(isTruthy('True')).toBe(true);
      expect(isTruthy('tRuE')).toBe(true);
      expect(isTruthy('false')).toBe(true);
      expect(isTruthy('False')).toBe(true);
      expect(isTruthy('fAlSE')).toBe(true);
      expect(isTruthy('')).toBe(false);
      expect(isTruthy(0)).toBe(false);
      expect(isTruthy(1)).toBe(true);
      expect(isTruthy(null)).toBe(false);
      expect(isTruthy(undefined)).toBe(false);
      expect(isTruthy(Symbol('test'))).toBe(true);
      expect(isTruthy({})).toBe(true);
      expect(isTruthy([])).toBe(true);
    });

    test('isTrue', () => {
      expect(isTrue(true)).toBe(true);
      expect(isTrue(false)).toBe(false);
      expect(isTrue('true')).toBe(true);
      expect(isTrue('True')).toBe(true);
      expect(isTrue('tRuE')).toBe(true);
      expect(isTrue('false')).toBe(false);
      expect(isTrue('False')).toBe(false);
      expect(isTrue('fAlSE')).toBe(false);
      expect(isTrue('')).toBe(false);
      expect(isTrue(0)).toBe(false);
      expect(isTrue(1)).toBe(false);
      expect(isTrue(null)).toBe(false);
      expect(isTrue(undefined)).toBe(false);
      expect(isTrue(Symbol('test'))).toBe(false);
      expect(isTrue({})).toBe(false);
      expect(isTrue([])).toBe(false);
    });

    test('isFalse', () => {
      expect(isFalse(true)).toBe(false);
      expect(isFalse(false)).toBe(true);
      expect(isFalse('true')).toBe(false);
      expect(isFalse('True')).toBe(false);
      expect(isFalse('tRuE')).toBe(false);
      expect(isFalse('false')).toBe(true);
      expect(isFalse('False')).toBe(true);
      expect(isFalse('fAlSE')).toBe(true);
      expect(isFalse('')).toBe(false);
      expect(isFalse(0)).toBe(false);
      expect(isFalse(1)).toBe(false);
      expect(isFalse(null)).toBe(false);
      expect(isFalse(undefined)).toBe(false);
      expect(isFalse(Symbol('test'))).toBe(false);
      expect(isFalse({})).toBe(false);
      expect(isFalse([])).toBe(false);
    });

    test('isBoolean', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean('True')).toBe(false);
      expect(isBoolean('tRuE')).toBe(false);
      expect(isBoolean('false')).toBe(false);
      expect(isBoolean('False')).toBe(false);
      expect(isBoolean('fAlSE')).toBe(false);
      expect(isBoolean('')).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
      expect(isBoolean(Symbol('test'))).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean([])).toBe(false);
    });

    test('isFalsy', () => {
      expect(isFalsy(true)).toBe(false);
      expect(isFalsy(false)).toBe(true);
      expect(isFalsy('true')).toBe(false);
      expect(isFalsy('True')).toBe(false);
      expect(isFalsy('tRuE')).toBe(false);
      expect(isFalsy('false')).toBe(false);
      expect(isFalsy('False')).toBe(false);
      expect(isFalsy('fAlSE')).toBe(false);
      expect(isFalsy('')).toBe(true);
      expect(isFalsy(0)).toBe(true);
      expect(isFalsy(1)).toBe(false);
      expect(isFalsy(null)).toBe(true);
      expect(isFalsy(undefined)).toBe(true);
      expect(isFalsy(Symbol('test'))).toBe(false);
      expect(isFalsy({})).toBe(false);
      expect(isFalsy([])).toBe(false);
    });

    describe('基本使用', () => {
      test('isUndef', () => {
        expect(isUndef(undefined)).toBe(true);
        expect(isUndef(null)).toBe(false);
        expect(isUndef(1)).toBe(false);
        expect(isUndef('1')).toBe(false);
        expect(isUndef(Symbol('test'))).toBe(false);
        expect(isUndef({})).toBe(false);
        expect(isUndef([])).toBe(false);
      });

      test('isNull', () => {
        expect(isNull(null)).toBe(true);
        expect(isNull(undefined)).toBe(false);
        expect(isNull(1)).toBe(false);
        expect(isNull('1')).toBe(false);
        expect(isNull(Symbol('test'))).toBe(false);
        expect(isNull({})).toBe(false);
        expect(isNull([])).toBe(false);
      });

      test('isNullOrUndef', () => {
        expect(isNullOrUndef(undefined)).toBe(true);
        expect(isNullOrUndef(null)).toBe(true);
        expect(isNullOrUndef(1)).toBe(false);
        expect(isNullOrUndef('1')).toBe(false);
        expect(isNullOrUndef(Symbol('test'))).toBe(false);
        expect(isNullOrUndef({})).toBe(false);
        expect(isNullOrUndef([])).toBe(false);
      });

      test('isNumber', () => {
        expect(isNumber(1)).toBe(true);
        expect(isNumber(Number.NaN)).toBe(true);
        expect(isNumber('1')).toBe(false);
        expect(isNumber(Symbol('test'))).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber([])).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
      });

      test('isPlainNumber', () => {
        expect(isPlainNumber(1)).toBe(true);
        expect(isPlainNumber(Number.NaN)).toBe(false);
        expect(isPlainNumber('1')).toBe(false);
        expect(isPlainNumber(Symbol('test'))).toBe(false);
        expect(isPlainNumber({})).toBe(false);
        expect(isPlainNumber([])).toBe(false);
        expect(isPlainNumber(null)).toBe(false);
        expect(isPlainNumber(undefined)).toBe(false);
      });

      test('isNaN', () => {
        expect(isNaN(1)).toBe(false);
        expect(isNaN(Number.NaN)).toBe(true);
        expect(isNaN('1')).toBe(false);
        expect(isNaN(Symbol('test'))).toBe(false);
        expect(isNaN({})).toBe(false);
        expect(isNaN([])).toBe(false);
        expect(isNaN(null)).toBe(false);
        expect(isNaN(undefined)).toBe(false);
      });

      test('isString', () => {
        expect(isString('1')).toBe(true);
        expect(isString(1)).toBe(false);
        expect(isString(Symbol('test'))).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString([])).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
      });

      test('isPlainSymbol', () => {
        expect(isPlainSymbol(Symbol('test'))).toBe(true);
        expect(isPlainSymbol(Symbol.for('test'))).toBe(false);
        expect(isPlainSymbol({})).toBe(false);
        expect(isPlainSymbol([])).toBe(false);
        expect(isPlainSymbol(1)).toBe(false);
        expect(isPlainSymbol('1')).toBe(false);
        expect(isPlainSymbol(null)).toBe(false);
        expect(isPlainSymbol(undefined)).toBe(false);
      });

      test('isObject', () => {
        expect(isObject(Symbol('test'))).toBe(false);
        expect(isObject(Symbol.for('test'))).toBe(false);
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true);
        expect(isObject(1)).toBe(false);
        expect(isObject('1')).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject(undefined)).toBe(false);
      });

      test('isPlainObject', () => {
        expect(isPlainObject(Symbol('test'))).toBe(false);
        expect(isPlainObject(Symbol.for('test'))).toBe(false);
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject(1)).toBe(false);
        expect(isPlainObject('1')).toBe(false);
        expect(isPlainObject(null)).toBe(false);
        expect(isPlainObject(undefined)).toBe(false);
      });

      test('isArray', () => {
        expect(isArray(Symbol('test'))).toBe(false);
        expect(isArray(Symbol.for('test'))).toBe(false);
        expect(isArray({})).toBe(false);
        expect(isArray([])).toBe(true);
        expect(isArray(1)).toBe(false);
        expect(isArray('1')).toBe(false);
        expect(isArray(null)).toBe(false);
        expect(isArray(undefined)).toBe(false);
      });

      test('isSymbol', () => {
        expect(isSymbol(Symbol('test'))).toBe(true);
        expect(isSymbol(Symbol.for('test'))).toBe(true);
        expect(isSymbol({})).toBe(false);
        expect(isSymbol([])).toBe(false);
        expect(isSymbol(1)).toBe(false);
        expect(isSymbol('1')).toBe(false);
        expect(isSymbol(null)).toBe(false);
        expect(isSymbol(undefined)).toBe(false);
      });

      test('isPropertyKey', () => {
        expect(isPropertyKey(Symbol('test'))).toBe(true);
        expect(isPropertyKey(Symbol.for('test'))).toBe(true);
        expect(isPropertyKey({})).toBe(false);
        expect(isPropertyKey([])).toBe(false);
        expect(isPropertyKey(1)).toBe(true);
        expect(isPropertyKey('1')).toBe(true);
        expect(isPropertyKey(null)).toBe(false);
        expect(isPropertyKey(undefined)).toBe(false);
      });
    });
  },
);

import type { KEqual } from '@/index';

describe('类型检查', async () => {
  const { isFalsy, isTruthy, isTrue } = await loadModule();

  test('isFalsy', () => {
    const a = '';
    if (isFalsy(a)) {
      assertType<''>(a);
    } else {
      assertType<KEqual<typeof a, never>>(true);
    }

    const b = '1';
    if (isFalsy(b)) {
      assertType<KEqual<typeof b, never>>(true);
    } else {
      assertType<'1'>(b);
    }

    const c = 0;
    if (isFalsy(c)) {
      assertType<0>(c);
    } else {
      assertType<KEqual<typeof c, never>>(true);
    }

    const d: string = '';
    if (isFalsy(d)) {
      assertType<''>(d);
    } else {
      assertType<string>(d);
    }

    const e = Math.random() > 0.5 ? '1' : 0;
    if (isFalsy(e)) {
      assertType<0>(e);
    } else {
      assertType<'1'>(e);
    }

    const f = Math.random() > 0.5 ? '' : 0;
    if (isFalsy(f)) {
      assertType<KEqual<typeof f, '' | 0>>(true);
    } else {
      assertType<KEqual<typeof f, never>>(true);
    }
  });

  test('isTruthy', () => {
    const a = '';
    if (isTruthy(a)) {
      assertType<KEqual<typeof a, never>>(true);
    } else {
      assertType<''>(a);
    }

    const b = '1';
    if (isTruthy(b)) {
      assertType<'1'>(b);
    } else {
      assertType<KEqual<typeof b, never>>(true);
    }

    const c = 0;
    if (isTruthy(c)) {
      assertType<KEqual<typeof c, never>>(true);
    } else {
      assertType<0>(c);
    }

    const d: string = '';
    if (isTruthy(d)) {
      assertType<string>(d);
    } else {
      assertType<''>(d);
    }

    const e = Math.random() > 0.5 ? '1' : 0;
    if (isTruthy(e)) {
      assertType<'1'>(e);
    } else {
      assertType<0>(e);
    }

    const f = Math.random() > 0.5 ? '' : 0;
    if (isTruthy(f)) {
      assertType<KEqual<typeof f, never>>(true);
    } else {
      assertType<KEqual<typeof f, '' | 0>>(true);
    }
  });

  test('isTrue', () => {
    const a = true;
    if (isTrue(a)) {
      assertType<true>(a);
    } else {
      assertType<KEqual<typeof a, never>>(true);
    }

    const b = false;
    if (isTrue(b)) {
      assertType<KEqual<typeof b, never>>(true);
    } else {
      assertType<false>(b);
    }

    const c = Math.random() > 0.5;
    if (isTrue(c)) {
      assertType<true>(c);
    } else {
      assertType<false>(c);
    }

    const d = 'TruE';
    if (isTrue(d)) {
      assertType<'TruE'>(d);
    } else {
      assertType<KEqual<typeof d, never>>(true);
    }
  });
});
