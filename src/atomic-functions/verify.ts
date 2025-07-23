import type { KUnULCase } from '@/types/base';

/**
 * 判断是一个 symbol
 */
export function isSymbol(v: unknown): v is symbol {
  return typeof v === 'symbol';
}

/**
 * 判断是一个 undefined
 */
export function isUndef(v: unknown): v is undefined {
  return typeof v === 'undefined';
}

/**
 * 判断是一个 null
 */
export function isNull(v: unknown): v is null {
  return v === null;
}

/**
 * 判断是一个 null 或者 undefined
 */
export function isNullOrUndef(v: unknown): v is null | undefined {
  return isNull(v) || isUndef(v);
}

/**
 * 判断是一个 NaN
 */
export function isNaN(v: unknown): v is number {
  return Number.isNaN(v);
}

/**
 * 判断是一个 plain symbol
 */
export function isPlainSymbol(v: unknown): v is symbol {
  return isSymbol(v) && isUndef(Symbol.keyFor(v));
}

/**
 * 判断是一个对象 (数组也返回 true)
 */
export function isObject(v: unknown): v is object {
  return typeof v === 'object' && !isNull(v);
}

/**
 * 判断是一个非数组对象
 */
export function isPlainObject(v: unknown): v is object {
  return isObject(v) && !isArray(v);
}

/**
 * 判断是一个数组
 */
export function isArray(v: unknown): v is any[] {
  return Array.isArray(v);
}

/**
 * 判断是一个字符串
 */
export function isString(v: unknown): v is string {
  return typeof v === 'string';
}

/**
 * 判断是一个数字
 */
export function isNumber(v: unknown): v is number {
  return typeof v === 'number';
}

/**
 * 判断是一个纯数字（排除 NaN）
 */
export function isPlainNumber(v: unknown): v is number {
  return isNumber(v) && !isNaN(v);
}

/**
 * 判断是一个合法的对象 key
 */
export function isPropertyKey(v: unknown): v is PropertyKey {
  return isString(v) || isNumber(v) || isSymbol(v);
}

/**
 * 判断是一个布尔值
 */
export function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

/**
 * 判断是一个 true 值
 */
export function isTrue(v: unknown): v is true | KUnULCase<'true'> {
  return v === true || (isString(v) && v.toLowerCase() === 'true');
}

/**
 * 判断是一个 false 值
 */
export function isFalse(v: unknown): v is false | KUnULCase<'false'> {
  return v === false || (isString(v) && v.toLowerCase() === 'false');
}

/**
 * 判断是一个真值
 *
 * @warn 字符串 'false' 等满足 isFalse 判断的字符串也会被视为真值
 */
export function isTruthy<T>(v: T): v is Exclude<T, false | 0 | '' | null | undefined> {
  return !!v;
}

/**
 * 判断是一个非值
 *
 * @warn 字符串 'false' 等满足 isFalse 判断的字符串不会被视为非值
 */
export function isFalsy(v: unknown): v is false | 0 | '' | null | undefined {
  return !v;
}
