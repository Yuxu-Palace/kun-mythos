import { assertType, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(({ assertNever }) => {
  test('导出检查', () => {
    expect(typeof assertNever).toBe('function');
  });

  test('基本使用', () => {
    expect(() => assertNever({} as never)).toThrow(TypeError);
  });

  test('自定义错误信息', () => {
    expect(() => assertNever({} as never, 'Custom error message')).toThrow('Custom error message');
    expect(() => assertNever('foo' as never, 'Unsupported type')).toThrow('Unsupported type');
  });

  test('在联合类型穷尽性检查中使用', () => {
    type Status = 'success' | 'error' | 'pending';

    const handleStatus = (status: Status): string => {
      switch (status) {
        case 'success':
          return 'Success!';
        case 'error':
          return 'Error!';
        case 'pending':
          return 'Pending...';
        default:
          return assertNever(status, `Unhandled status: ${status}`);
      }
    };

    expect(handleStatus('success')).toBe('Success!');
    expect(handleStatus('error')).toBe('Error!');
    expect(handleStatus('pending')).toBe('Pending...');
  });

  test('未处理的联合类型分支会抛出错误', () => {
    type Action = 'create' | 'update' | 'delete';

    const handleAction = (action: Action): string => {
      switch (action) {
        case 'create':
          return 'Created';
        case 'update':
          return 'Updated';
        default:
          return assertNever(action as never, `Unhandled action: ${action}`);
      }
    };

    expect(handleAction('create')).toBe('Created');
    expect(handleAction('update')).toBe('Updated');
    expect(() => handleAction('delete')).toThrow('Unhandled action: delete');
  });
});

test('类型测试', async () => {
  const { assertNever } = await loadModule();

  type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; size: number };

  const getArea = (shape: Shape): number => {
    switch (shape.kind) {
      case 'circle':
        return Math.PI * shape.radius ** 2;
      case 'square':
        return shape.size ** 2;
      default:
        assertType<never>(shape);
        return assertNever(shape, `Unhandled shape: ${(shape as any).kind}`);
    }
  };

  expect(getArea({ kind: 'circle', radius: 5 })).toBeCloseTo(78.54, 2);
  expect(getArea({ kind: 'square', size: 4 })).toBe(16);

  // 测试类型守卫
  type Color = 'red' | 'green' | 'blue';

  const processColor = (color: Color): string => {
    if (color === 'red') {
      return 'Red color';
    }
    if (color === 'green') {
      return 'Green color';
    }
    if (color === 'blue') {
      return 'Blue color';
    }
    assertType<never>(color);
    return assertNever(color);
  };

  expect(processColor('red')).toBe('Red color');
  expect(processColor('green')).toBe('Green color');
  expect(processColor('blue')).toBe('Blue color');
});
