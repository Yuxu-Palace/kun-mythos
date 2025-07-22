/**
 * Determines whether the given value is a symbol.
 *
 * @returns True if the value is of type `symbol`.
 */
export function isSymbol(v: unknown): v is symbol {
  return typeof v === 'symbol';
}

/**
 * Returns true if the value is undefined.
 */
export function isUndef(v: unknown): v is undefined {
  return typeof v === 'undefined';
}

/**
 * Returns true if the value is strictly equal to null.
 */
export function isNull(v: unknown): v is null {
  return v === null;
}

/**
 * Determines whether a value is either null or undefined.
 *
 * @returns True if the value is null or undefined; otherwise, false.
 */
export function isNullOrUndef(v: unknown): v is null | undefined {
  return isNull(v) || isUndef(v);
}

/**
 * Determines whether the given value is NaN (Not-a-Number).
 *
 * @returns True if the value is of type number and is NaN; otherwise, false.
 */
export function isNotANumber(v: unknown): v is number {
  return Number.isNaN(v);
}

/**
 * Returns true if the value is a symbol that is not registered in the global symbol registry.
 *
 * A plain symbol is a symbol that was not created using `Symbol.for`.
 */
export function isPlainSymbol(v: unknown): v is symbol {
  return isSymbol(v) && isUndef(Symbol.keyFor(v));
}

/**
 * Returns true if the value is an object that is not an array.
 *
 * A plain object is any non-null object that is not an array.
 */
export function isPlainObject(v: unknown): v is object {
  return isObject(v) && !isArray(v);
}

/**
 * Determines whether the given value is an object, including arrays.
 *
 * @returns True if the value is a non-null object.
 */
export function isObject(v: unknown): v is object {
  return typeof v === 'object' && !isNull(v);
}

/**
 * Determines whether the given value is an array.
 *
 * @returns True if the value is an array; otherwise, false.
 */
export function isArray(v: unknown): v is any[] {
  return Array.isArray(v);
}

/**
 * Determines whether the given value is a string.
 *
 * @returns True if the value is of type string; otherwise, false.
 */
export function isString(v: unknown): v is string {
  return typeof v === 'string';
}

/**
 * Determines whether the given value is of type number.
 *
 * @returns True if the value is a number; otherwise, false.
 */
export function isNumber(v: unknown): v is number {
  return typeof v === 'number';
}

/**
 * Determines whether the value is a number and not NaN.
 *
 * @returns True if the value is a finite number, excluding NaN.
 */
export function isPlainNumber(v: unknown): v is number {
  return isNumber(v) && !isNotANumber(v);
}

/**
 * Determines whether a value is a valid object property key.
 *
 * Returns true if the value is a string, number, or symbol, which are the only types allowed as property keys in JavaScript objects.
 */
export function isPropertyKey(v: unknown): v is PropertyKey {
  return isString(v) || isNumber(v) || isSymbol(v);
}
