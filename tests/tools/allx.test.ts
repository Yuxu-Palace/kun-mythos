import { describe, expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ sleep, allx }) => {
  test('导出检查', () => {
    expect(typeof allx).toBe('function');
  });

  describe('基础功能测试', () => {
    test('执行简单的并行任务', async () => {
      const result = await allx({
        task1: async () => 1,
        task2: async () => 2,
        task3: async () => 3,
      });

      expect(result).toEqual({
        task1: 1,
        task2: 2,
        task3: 3,
      });
    });

    test('执行同步任务', async () => {
      const result = await allx({
        task1: () => 'hello',
        task2: () => 'world',
      });

      expect(result).toEqual({
        task1: 'hello',
        task2: 'world',
      });
    });

    test('混合同步和异步任务', async () => {
      const result = await allx({
        sync: () => 'sync',
        async: async () => 'async',
      });

      expect(result).toEqual({
        sync: 'sync',
        async: 'async',
      });
    });

    test('返回不同类型的值', async () => {
      const result = await allx({
        number: () => 42,
        string: () => 'test',
        boolean: () => true,
        null: () => null,
        undefined: () => {},
        object: () => {
          return { key: 'value' };
        },
        array: () => [1, 2, 3],
      });

      expect(result).toEqual({
        number: 42,
        string: 'test',
        boolean: true,
        null: null,
        undefined: undefined,
        object: { key: 'value' },
        array: [1, 2, 3],
      });
    });

    test('空任务对象', async () => {
      const result = await allx({});
      expect(result).toEqual({});
    });
  });

  describe('任务依赖测试', () => {
    test('任务可以依赖其他任务的结果', async () => {
      const result = await allx({
        task1: async () => 10,
        task2: async function () {
          const value = await this.$.task1;
          return value * 2;
        },
      });

      expect(result).toEqual({
        task1: 10,
        task2: 20,
      });
    });

    test('多个任务依赖同一个任务', async () => {
      const result = await allx({
        base: async () => 5,
        double: async function () {
          const value = await this.$.base;
          return value * 2;
        },
        triple: async function () {
          const value = await this.$.base;
          return value * 3;
        },
      });

      expect(result).toEqual({
        base: 5,
        double: 10,
        triple: 15,
      });
    });

    test('链式依赖', async () => {
      const result = await allx({
        task1: async () => 1,
        task2: async function () {
          const value = await this.$.task1;
          return value + 1;
        },
        task3: async function () {
          const value = await this.$.task2;
          return value + 1;
        },
      });

      expect(result).toEqual({
        task1: 1,
        task2: 2,
        task3: 3,
      });
    });

    test('复杂的依赖关系', async () => {
      const result = await allx({
        a: async () => 1,
        b: async () => 2,
        c: async function () {
          const [aVal, bVal] = await Promise.all([this.$.a, this.$.b]);
          return aVal + bVal;
        },
        d: async function () {
          const cVal = await this.$.c;
          return cVal * 2;
        },
      });

      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 3,
        d: 6,
      });
    });

    test('任务可以依赖多个其他任务', async () => {
      const result = await allx({
        task1: async () => 10,
        task2: async () => 20,
        task3: async () => 30,
        sum: async function () {
          const [v1, v2, v3] = await Promise.all([this.$.task1, this.$.task2, this.$.task3]);
          return v1 + v2 + v3;
        },
      });

      expect(result).toEqual({
        task1: 10,
        task2: 20,
        task3: 30,
        sum: 60,
      });
    });

    test('同步任务依赖异步任务', async () => {
      const result = await allx({
        async: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'async result';
        },
        sync: async function () {
          const value = await this.$.async;
          return `got ${value}`;
        },
      });

      expect(result).toEqual({
        async: 'async result',
        sync: 'got async result',
      });
    });

    test('依赖已完成的任务', async () => {
      const result = await allx({
        task1: async () => 1,
        task2: async function () {
          await sleep(10);
          const value = await this.$.task1;
          return value + 1;
        },
      });

      expect(result).toEqual({
        task1: 1,
        task2: 2,
      });
    });
  });

  describe('错误处理测试', () => {
    test('任务抛出错误时应该被捕获', async () => {
      await expect(
        allx({
          task1: async () => {
            throw new Error('Task error');
          },
        }),
      ).rejects.toThrow('Task error');
    });

    test('依赖的任务失败时，依赖它的任务也应该失败', async () => {
      await expect(
        allx({
          task1: async () => {
            throw new Error('Task1 failed');
          },
          task2: async function () {
            await this.$.task1;
            return 'should not reach here';
          },
        }),
      ).rejects.toThrow('Task1 failed');
    });

    test('访问不存在的任务应该抛出错误', async () => {
      await expect(
        allx({
          task1: async function () {
            // @ts-expect-error - 测试访问不存在的任务
            await this.$.nonExistent;
            return 'should not reach here';
          },
        }),
      ).rejects.toThrow('Unknown task "nonExistent"');
    });

    test('非函数任务应该直接将值存进结果中', async () => {
      expect(
        await allx({
          task1: 'not a function',
        }),
      ).toEqual({ task1: 'not a function' });

      expect(
        await allx({
          promise: Promise.resolve('promise result'),
        }),
      ).toEqual({ promise: 'promise result' });

      expect(
        await allx({
          number: () => 42,
          number2: 10,
          promise: Promise.resolve('promise result'),
          async numSum() {
            return (await this.$.number) + (await this.$.number2);
          },
        }),
      ).toEqual({ number: 42, number2: 10, promise: 'promise result', numSum: 52 });
    });

    test('多个任务失败时应该抛出第一个错误', async () => {
      await expect(
        allx({
          task1: async () => {
            throw new Error('Error 1');
          },
          task2: async () => {
            throw new Error('Error 2');
          },
        }),
      ).rejects.toThrow(/Error [12]/);
    });

    test('部分任务失败不影响其他独立任务', async () => {
      const executedTasks: string[] = [];

      await expect(() =>
        allx({
          success: async () => {
            executedTasks.push('success');
            return 'ok';
          },
          fail: async () => {
            executedTasks.push('fail');
            throw new Error('Failed');
          },
        }),
      ).rejects.toThrow('Failed');

      expect(executedTasks).toContain('success');
      expect(executedTasks).toContain('fail');
    });
  });

  describe('执行顺序和并行性测试', () => {
    test('独立任务应该并行执行', async () => {
      const executionOrder: number[] = [];

      const result = await allx({
        task1: async () => {
          await new Promise((resolve) => setTimeout(resolve, 30));
          executionOrder.push(1);
          return 1;
        },
        task2: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          executionOrder.push(2);
          return 2;
        },
        task3: async () => {
          await new Promise((resolve) => setTimeout(resolve, 20));
          executionOrder.push(3);
          return 3;
        },
      });

      // 由于并行执行，task2 应该最先完成
      expect(executionOrder[0]).toBe(2);
      expect(result).toEqual({ task1: 1, task2: 2, task3: 3 });
    });

    test('有依赖的任务应该等待依赖完成', async () => {
      const executionOrder: string[] = [];

      const result = await allx({
        task1: async () => {
          executionOrder.push('task1-start');
          await new Promise((resolve) => setTimeout(resolve, 20));
          executionOrder.push('task1-end');
          return 1;
        },
        task2: async function () {
          executionOrder.push('task2-start');
          const value = await this.$.task1;
          executionOrder.push('task2-end');
          return value + 1;
        },
      });

      expect(executionOrder).toEqual(['task1-start', 'task2-start', 'task1-end', 'task2-end']);
      expect(result).toEqual({ task1: 1, task2: 2 });
    });

    test('多个任务同时等待同一个依赖', async () => {
      let baseExecutionCount = 0;

      const result = await allx({
        base: async () => {
          baseExecutionCount++;
          await new Promise((resolve) => setTimeout(resolve, 20));
          return 10;
        },
        dependent1: async function () {
          const value = await this.$.base;
          return value + 1;
        },
        dependent2: async function () {
          const value = await this.$.base;
          return value + 2;
        },
        dependent3: async function () {
          const value = await this.$.base;
          return value + 3;
        },
      });

      // base 任务应该只执行一次
      expect(baseExecutionCount).toBe(1);
      expect(result).toEqual({
        base: 10,
        dependent1: 11,
        dependent2: 12,
        dependent3: 13,
      });
    });
  });

  describe('边界情况测试', () => {
    test('任务返回 Promise', async () => {
      const result = await allx({
        task: () => Promise.resolve(42),
      });

      expect(result).toEqual({ task: 42 });
    });

    test('任务返回已解决的 Promise', async () => {
      const resolvedPromise = Promise.resolve('resolved');
      const result = await allx({
        task: () => resolvedPromise,
      });

      expect(result).toEqual({ task: 'resolved' });
    });

    test('使用 Symbol 作为任务名', async () => {
      const taskSymbol = Symbol('task');
      const result = await allx({
        [taskSymbol]: async () => 'symbol task',
      });

      expect(result[taskSymbol]).toBe('symbol task');
    });

    test('任务名包含特殊字符', async () => {
      const result = await allx({
        'task-1': async () => 1,
        task_2: async () => 2,
        'task.3': async () => 3,
        task$4: async () => 4,
      });

      expect(result).toEqual({
        'task-1': 1,
        task_2: 2,
        'task.3': 3,
        task$4: 4,
      });
    });

    test('任务返回大对象', async () => {
      const largeObject = { data: new Array(1000).fill(0).map((_, i) => i) };
      const result = await allx({
        task: async () => largeObject,
      });

      expect(result.task).toEqual(largeObject);
    });

    test('任务中使用 this 上下文', async () => {
      const result = await allx({
        task1: async () => 'value1',
        task2: async function () {
          expect(this.$).toBeDefined();
          expect(typeof this.$.task1).toBe('object'); // Promise
          return 'value2';
        },
      });

      expect(result).toEqual({
        task1: 'value1',
        task2: 'value2',
      });
    });

    test('任务返回函数', async () => {
      const fn = () => 'inner function';
      const result = await allx({
        task: async () => fn,
      });

      expect(typeof result.task).toBe('function');
      expect(result.task()).toBe('inner function');
    });

    test('任务返回类实例', async () => {
      class TestClass {
        value = 42;
        getValue() {
          return this.value;
        }
      }

      const result = await allx({
        task: async () => new TestClass(),
      });

      expect(result.task).toBeInstanceOf(TestClass);
      expect(result.task.getValue()).toBe(42);
    });

    test('循环依赖检测（间接）', async () => {
      // 注意：当前实现可能不会检测循环依赖，这个测试验证行为
      const promise = allx({
        task1: async function () {
          await this.$.task2;
          return 1;
        },
        task2: async function () {
          await this.$.task1;
          return 2;
        },
      });

      // 循环依赖会导致死锁，使用 timeout 来检测
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: possible circular dependency')), 100),
      );

      await expect(Promise.race([promise, timeout])).rejects.toThrow();
    });
  });

  describe('性能和压力测试', () => {
    test('处理大量独立任务', async () => {
      const tasks: Record<string, () => Promise<number>> = {};
      const taskCount = 100;

      for (let i = 0; i < taskCount; i++) {
        tasks[`task${i}`] = async () => i;
      }

      const result = await allx(tasks);

      expect(Object.keys(result).length).toBe(taskCount);
      for (let i = 0; i < taskCount; i++) {
        expect(result[`task${i}`]).toBe(i);
      }
    });

    test('处理深层依赖链', async () => {
      const depth = 20;
      const tasks: Record<string, any> = {
        task0: async () => 0,
      };

      for (let i = 1; i < depth; i++) {
        tasks[`task${i}`] = async function () {
          const value = await this.$[`task${i - 1}`];
          return value + 1;
        };
      }

      const result = await allx(tasks);

      expect(result[`task${depth - 1}`]).toBe(depth - 1);
    });

    test('混合独立和依赖任务', async () => {
      const result = await allx({
        independent1: async () => 1,
        independent2: async () => 2,
        independent3: async () => 3,
        dependent1: async function () {
          const value = await this.$.independent1;
          return value * 10;
        },
        dependent2: async function () {
          const [v1, v2] = await Promise.all([this.$.independent2, this.$.independent3]);
          return v1 + v2;
        },
        final: async function () {
          const [d1, d2] = await Promise.all([this.$.dependent1, this.$.dependent2]);
          return d1 + d2;
        },
      });

      expect(result).toEqual({
        independent1: 1,
        independent2: 2,
        independent3: 3,
        dependent1: 10,
        dependent2: 5,
        final: 15,
      });
    });
  });

  describe('实际使用场景测试', () => {
    test('模拟数据获取场景', async () => {
      const result = await allx({
        user: async () => {
          return { id: 1, name: 'John' };
        },
        posts: async function () {
          const user = await this.$.user;
          return [
            { userId: user.id, title: 'Post 1' },
            { userId: user.id, title: 'Post 2' },
          ];
        },
        comments: async function () {
          const posts = await this.$.posts;
          return posts.map((post: { title: string }) => {
            return { postTitle: post.title, comment: 'Great!' };
          });
        },
      });

      expect(result.user).toEqual({ id: 1, name: 'John' });
      expect(result.posts).toHaveLength(2);
      expect(result.comments).toHaveLength(2);
    });

    test('模拟配置加载场景', async () => {
      const result = await allx({
        baseConfig: async () => {
          return { apiUrl: 'https://api.example.com' };
        },
        userConfig: async () => {
          return { theme: 'dark' };
        },
        mergedConfig: async function () {
          const [base, user] = await Promise.all([this.$.baseConfig, this.$.userConfig]);
          return { ...base, ...user };
        },
      });

      expect(result.mergedConfig).toEqual({
        apiUrl: 'https://api.example.com',
        theme: 'dark',
      });
    });

    test('模拟并行 API 调用', async () => {
      const result = await allx({
        api1: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { data: 'api1' };
        },
        api2: async () => {
          await new Promise((resolve) => setTimeout(resolve, 15));
          return { data: 'api2' };
        },
        api3: async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return { data: 'api3' };
        },
        combined: async function () {
          const [r1, r2, r3] = await Promise.all([this.$.api1, this.$.api2, this.$.api3]);
          return [r1.data, r2.data, r3.data];
        },
      });

      expect(result.combined).toEqual(['api1', 'api2', 'api3']);
    });
  });

  describe('类型和接口测试', () => {
    test('验证返回值类型保持一致', async () => {
      const result = await allx({
        string: async () => 'test' as const,
        number: async () => 42 as const,
        boolean: async () => true as const,
      });

      // TypeScript 类型检查
      const _stringCheck: 'test' = result.string;
      const _numberCheck: 42 = result.number;
      const _booleanCheck: true = result.boolean;

      expect(result.string).toBe('test');
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
    });

    test('options 参数（当前为空）', async () => {
      const result = await allx(
        {
          task: async () => 'value',
        },
        {},
      );

      expect(result).toEqual({ task: 'value' });
    });
  });

  test('allSettled 测试', async () => {
    const result = await allx(
      {
        task1: async () => {
          throw new Error('error1');
        },
        task2: async () => 'value2',
        task3: 0,
        // 依赖正常任务
        async task4() {
          return (await this.$.task2) + (await this.$.task3);
        },
        // 依赖报错任务
        async task5() {
          return (await this.$.task1) + (await this.$.task2);
        },
      },
      { allSettled: true },
    );

    expect(result).toEqual({
      task1: { status: 'rejected', reason: new Error('error1') },
      task2: { status: 'fulfilled', value: 'value2' },
      task3: { status: 'fulfilled', value: 0 },
      task4: { status: 'fulfilled', value: 'value20' },
      task5: { status: 'rejected', reason: new Error('error1') },
    });
  });
});
