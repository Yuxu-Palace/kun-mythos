import type { KAnyFunc, KUnULCase } from '@/types/base';

/** 判断是一个 symbol */
export function isSymbol(_v: unknown): _v is symbol {
  return typeof _v === 'symbol';
}

/** 判断是一个 undefined */
export function isUndef(_v: unknown): _v is undefined {
  return typeof _v === 'undefined';
}

/** 判断是一个 null */
export function isNull(_v: unknown): _v is null {
  return _v === null;
}

/** 判断是一个 null 或者 undefined */
export function isNullOrUndef(_v: unknown): _v is null | undefined {
  return isNull(_v) || isUndef(_v);
}

/** 判断是一个 NaN */
export function isNaN(_v: unknown): _v is number {
  return Number.isNaN(_v);
}

/** 判断是一个 plain symbol */
export function isPlainSymbol(_v: unknown): _v is symbol {
  return isSymbol(_v) && isUndef(Symbol.keyFor(_v));
}

/** 判断是一个对象 (数组也返回 true) */
export function isObject(_v: unknown): _v is object {
  return typeof _v === 'object' && !isNull(_v);
}

/** 判断是一个非数组对象 */
export function isPlainObject(_v: unknown): _v is object {
  return isObject(_v) && !isArray(_v);
}

/** 判断是一个数组 */
export function isArray(_v: unknown): _v is any[] {
  return Array.isArray(_v);
}

/** 判断是一个字符串 */
export function isString(_v: unknown): _v is string {
  return typeof _v === 'string';
}

/** 判断是一个数字 */
export function isNumber(_v: unknown): _v is number {
  return typeof _v === 'number';
}

/** 判断是一个纯数字 (排除 NaN) */
export function isPlainNumber(_v: unknown): _v is number {
  return isNumber(_v) && !isNaN(_v);
}

/** 判断是一个合法的对象 key */
export function isPropertyKey(_v: unknown): _v is PropertyKey {
  return isString(_v) || isNumber(_v) || isSymbol(_v);
}

/** 判断是一个布尔值 */
export function isBoolean(_v: unknown): _v is boolean {
  return typeof _v === 'boolean';
}

/** 判断是一个 true 值 */
export function isTrue(_v: unknown): _v is true | KUnULCase<'true'> {
  return _v === true || (isString(_v) && _v.toLowerCase() === 'true');
}

/** 判断是一个 false 值 */
export function isFalse(_v: unknown): _v is false | KUnULCase<'false'> {
  return _v === false || (isString(_v) && _v.toLowerCase() === 'false');
}

/**
 * 判断是一个真值
 *
 * @warn 字符串 'false' 等满足 isFalse 判断的字符串也会被视为真值
 */
export function isTruthy<T>(_v: T): _v is Exclude<T, false | 0 | '' | null | undefined> {
  return !!_v;
}

/**
 * 判断是一个非值
 *
 * @warn 字符串 'false' 等满足 isFalse 判断的字符串不会被视为非值
 */
export function isFalsy(_v: unknown): _v is false | 0 | '' | null | undefined {
  return !_v;
}

/** 判断是一个函数 */
export function isFunction(_v: unknown): _v is KAnyFunc {
  return typeof _v === 'function';
}

/** 判断是一个 Promise */
export function isPromise(_v: unknown): _v is Promise<any> {
  // @ts-expect-error
  return isObject(_v) && isFunction(_v.then);
}

export function isDate(_v: unknown): _v is Date {
  return _v instanceof Date;
}
