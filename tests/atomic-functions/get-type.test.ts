import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ getType }) => {
  test('导出测试', () => {
    expect(typeof getType).toBe('function');
  });

  test('getType 测试', () => {
    expect(getType(1)).toBe('number');
    expect(getType('1')).toBe('string');
    expect(getType(true)).toBe('boolean');
    expect(getType(null)).toBe('null');
    expect(getType(undefined)).toBe('undefined');
    expect(getType({})).toBe('object');
    expect(getType([])).toBe('array');
    expect(getType(Symbol('test'))).toBe('symbol');
    expect(getType(new Date())).toBe('date');
    expect(getType(Promise.resolve())).toBe('promise');
    expect(getType(BigInt('1'))).toBe('bigint');
    expect(getType(new Error('test error'))).toBe('error');
    expect(getType(new Map())).toBe('map');
    expect(getType(new Set())).toBe('set');
    expect(getType(new WeakMap())).toBe('weakmap');
    expect(getType(new WeakSet())).toBe('weakset');
    expect(getType(/test/)).toBe('regexp');
    expect(getType(new URL('https://example.com'))).toBe('url');
    expect(getType(new URLSearchParams('test=1'))).toBe('urlsearchparams');
    expect(getType(new Blob(['']))).toBe('blob');
    expect(getType(new File([''], 'test.txt'))).toBe('file');
    expect(getType(new FormData())).toBe('formdata');
    expect(getType(new ReadableStream())).toBe('readablestream');
    expect(getType(new WritableStream())).toBe('writablestream');
    expect(getType(new TransformStream())).toBe('transformstream');
    expect(getType(new ArrayBuffer(1))).toBe('arraybuffer');
    expect(getType(new Int8Array(1))).toBe('int8array');
    expect(getType(new Uint8Array(1))).toBe('uint8array');
    expect(getType(new Uint8ClampedArray(1))).toBe('uint8clampedarray');
    expect(getType(new Int16Array(1))).toBe('int16array');
    expect(getType(new Uint16Array(1))).toBe('uint16array');
    expect(getType(new Int32Array(1))).toBe('int32array');
    expect(getType(new Uint32Array(1))).toBe('uint32array');
    expect(getType(new Float32Array(1))).toBe('float32array');
    expect(getType(new Float64Array(1))).toBe('float64array');
    expect(getType(new BigInt64Array(1))).toBe('bigint64array');
    expect(getType(new BigUint64Array(1))).toBe('biguint64array');
    expect(getType(new DataView(new ArrayBuffer(1)))).toBe('dataview');
    expect(getType(new SharedArrayBuffer(1))).toBe('sharedarraybuffer');
    expect(getType({ [Symbol.toStringTag]: 'test' })).toBe('test');
  });
});
