import { isFunction } from '@/atomic-functions/verify';
import { withResolvers } from '@/atomic-functions/with-resolvers';
import type { KAnyFunc } from '@/types/base';

interface AllxOptions {}

interface AllxContext<M extends Record<string, KAnyFunc>> {
  $: { [P in keyof M]: Promise<Awaited<ReturnType<M[P]>>> };
}

type AllxResult<M extends Record<string, KAnyFunc>> = Promise<{
  [P in keyof M]: Awaited<ReturnType<M[P]>>;
}>;

function createDepProxy(tasks: Record<string, KAnyFunc>, results: Record<string, any>) {
  const resolverMap: Record<string, PromiseWithResolvers<any>> = {};
  const taskNameSet = new Set(Reflect.ownKeys(tasks) as string[]);

  const depProxy = new Proxy(resolverMap, {
    async get(target: Record<string, PromiseWithResolvers<any>>, depName: string, receiver: any) {
      if (!taskNameSet.has(depName)) {
        return Promise.reject(new Error(`Unknown task "${String(depName)}"`));
      }
      if (results[depName]) {
        return Promise.resolve(results[depName]);
      }
      const depResolvers = Reflect.get(target, depName, receiver);
      if (depResolvers) {
        return depResolvers.promise;
      }
      const resolvers = withResolvers();
      Reflect.set(target, depName, resolvers, receiver);
      const cleanup = () => {
        delete target[depName];
      };
      return resolvers.promise.then(
        (value) => {
          cleanup();
          return value;
        },
        (error) => {
          cleanup();
          throw error;
        },
      );
    },
  });

  return { depProxy, taskNameSet, resolverMap };
}

/**
 * 支持自动依赖优化和完整类型推断的 Promise.all, 执行任务时自动解决依赖关系。
 *
 * @platform web, node, webworker
 * @example
 * const { a, b, c } = await allx({
 *   a() { return 1 },
 *   async b() { return 'hello' },
 *   async c() { return (await this.$.a) + 10 }
 * })
 */
export async function allx<M extends Record<string, KAnyFunc>>(
  tasks: M & ThisType<AllxContext<M>>,
  _options?: AllxOptions,
): AllxResult<M> {
  const results: Record<string, any> = {};
  const { depProxy, taskNameSet, resolverMap } = createDepProxy(tasks, results);

  const context = {
    $: depProxy,
  };

  const promises = [] as Promise<any>[];

  taskNameSet.forEach(async (name) => {
    const taskFn = tasks[name];
    const taskResolvers = withResolvers();
    taskResolvers.promise.then(
      (value) => {
        results[name] = value;
        const depResolvers = resolverMap[name];
        if (depResolvers) {
          depResolvers.resolve(value);
        }
        return value;
      },
      (error) => {
        const depResolvers = resolverMap[name];
        if (depResolvers) {
          depResolvers.reject(error);
        }
      },
    );
    promises.push(taskResolvers.promise);

    if (!isFunction(taskFn)) {
      taskResolvers.reject(new Error(`Task "${String(name)}" is not a function`));
      return;
    }
    try {
      const result = await taskFn.call(context);
      taskResolvers.resolve(result);
    } catch (error) {
      taskResolvers.reject(error);
    }
  });

  return Promise.all(promises).then(() => results as any);
}
