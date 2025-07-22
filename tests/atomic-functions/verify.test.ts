import { describe, expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(
  ({
    isObject,
    isPlainObject,
    isArray,
    isSymbol,
    isPropertyKey,
    isNotANumber,
    isNull,
    isNullOrUndef,
    isNumber,
    isPlainNumber,
    isPlainSymbol,
    isString,
    isUndef,
  }) => {
    test('导出检查', () => {
      expect(typeof isObject).toBe('function');
      expect(typeof isArray).toBe('function');
      expect(typeof isSymbol).toBe('function');
      expect(typeof isPlainObject).toBe('function');
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
        expect(isNumber(NaN)).toBe(true);
        expect(isNumber('1')).toBe(false);
        expect(isNumber(Symbol('test'))).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber([])).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
      });

      test('isPlainNumber', () => {
        expect(isPlainNumber(1)).toBe(true);
        expect(isPlainNumber(NaN)).toBe(false);
        expect(isPlainNumber('1')).toBe(false);
        expect(isPlainNumber(Symbol('test'))).toBe(false);
        expect(isPlainNumber({})).toBe(false);
        expect(isPlainNumber([])).toBe(false);
        expect(isPlainNumber(null)).toBe(false);
        expect(isPlainNumber(undefined)).toBe(false);
      });

      test('isNotANumber', () => {
        expect(isNotANumber(1)).toBe(false);
        expect(isNotANumber(NaN)).toBe(true);
        expect(isNotANumber('1')).toBe(false);
        expect(isNotANumber(Symbol('test'))).toBe(false);
        expect(isNotANumber({})).toBe(false);
        expect(isNotANumber([])).toBe(false);
        expect(isNotANumber(null)).toBe(false);
        expect(isNotANumber(undefined)).toBe(false);
      });

      test('isString', () => {
        expect(isString('1')).toBe(true);
        expect(isString(1)).toBe(false);
        expect(isString(Symbol('test'))).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString([])).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
        expect(isString(Symbol('test'))).toBe(false);
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
