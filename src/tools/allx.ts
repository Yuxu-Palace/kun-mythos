import { isFunction, isPromise } from '@/atomic-functions/verify';
import { withResolvers } from '@/atomic-functions/with-resolvers';
import type { KAnyFunc } from '@/types/base';

interface AllxOptions {
  allSettled?: boolean;
}

interface AllxContext<M extends Record<string, KAnyFunc>> {
  $: {
    [P in keyof M]: M[P] extends KAnyFunc
      ? ReturnType<M[P]> extends Promise<infer R>
        ? Promise<R>
        : Promise<ReturnType<M[P]>>
      : Promise<Awaited<M[P]>>;
  };
}

type AllxResult<M extends Record<string, KAnyFunc>, O extends AllxOptions = AllxOptions> = {
  [P in keyof M]: O['allSettled'] extends true
    ? PromiseSettledResult<Awaited<ReturnType<M[P]>>>
    : Awaited<ReturnType<M[P]>>;
};

function createDepProxy(tasks: Record<string, KAnyFunc>, results: Record<string, any>, options?: AllxOptions) {
  const resolverMap = new Map<string, PromiseWithResolvers<any>>();
  const taskNameSet = new Set(Reflect.ownKeys(tasks) as string[]);

  const depProxy = new Proxy(
    {},
    {
      async get(_, depName: string) {
        if (!taskNameSet.has(depName)) {
          return Promise.reject(new Error(`Unknown task "${String(depName)}"`));
        }
        if (results[depName]) {
          if ((options || {}).allSettled) {
            return Promise.resolve(results[depName].value);
          }
          return Promise.resolve(results[depName]);
        }
        const depResolvers = resolverMap.get(depName);
        if (depResolvers) {
          return depResolvers.promise;
        }
        const resolvers = withResolvers();
        resolverMap.set(depName, resolvers);
        const cleanup = () => {
          resolverMap.delete(depName);
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
    },
  );

  return { depProxy, taskNameSet, resolverMap };
}

function getValueFormatFunc(options?: AllxOptions) {
  if (!options) {
    return (value: any, _type: PromiseSettledResult<any>['status'] = 'fulfilled') => value;
  }
  if (options.allSettled) {
    return (value: any, status: PromiseSettledResult<any>['status'] = 'fulfilled') =>
      status === 'fulfilled' ? { status, value } : { status, reason: value };
  }
  return (value: any, _type: PromiseSettledResult<any>['status'] = 'fulfilled') => value;
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
export async function allx<M extends Record<string, any>, O extends AllxOptions>(
  tasks: M & ThisType<AllxContext<M>>,
  options?: O,
): Promise<AllxResult<M, O>> {
  const { allSettled } = options || {};
  const results: Record<string, any> = {};
  const { depProxy, taskNameSet, resolverMap } = createDepProxy(tasks, results, options);
  const valueFormat = getValueFormatFunc(options);

  const context = {
    $: depProxy,
  };

  const promises = [] as Promise<any>[];

  taskNameSet.forEach(async (name) => {
    const taskFn = tasks[name];

    const taskResolvers = withResolvers();
    taskResolvers.promise.then(
      (value) => {
        results[name] = valueFormat(value, 'fulfilled');
        const depResolvers = resolverMap.get(name);
        if (depResolvers) {
          depResolvers.resolve(value);
        }
        return value;
      },
      (error) => {
        const depResolvers = resolverMap.get(name);
        if (allSettled) {
          results[name] = valueFormat(error, 'rejected');
        }
        if (depResolvers) {
          depResolvers.reject(error);
        }
      },
    );

    promises.push(taskResolvers.promise);

    if (isPromise(taskFn)) {
      await taskFn.then(taskResolvers.resolve, taskResolvers.reject);
      return;
    }
    if (!isFunction(taskFn)) {
      taskResolvers.resolve(taskFn);
      return;
    }

    try {
      const result = await taskFn.call(context);
      taskResolvers.resolve(result);
    } catch (error) {
      taskResolvers.reject(error);
    }
  });

  if (allSettled) {
    return Promise.allSettled(promises).then(() => results as any);
  }

  return Promise.all(promises).then(() => results as any);
}
