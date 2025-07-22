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
// biome-ignore lint/suspicious/noShadowRestrictedNames: 语义明确但是和 globalThis 上的 isNaN 重名
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
