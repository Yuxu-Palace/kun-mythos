import { getNow } from './get-now';
import { withResolvers } from './with-resolvers';

type SleepController = {
  resolve: (cancel?: boolean) => void;
  abort: () => void;
};

function mergeController(promise: Promise<any>, controller: SleepController) {
  return Object.assign({}, promise, controller, {
    // biome-ignore lint/suspicious/noThenProperty: 代理 then 方法方便 controller 的传递
    then: (...args: any[]) => mergeController(promise.then(...args), controller),
    catch: (...args: any[]) => mergeController(promise.catch(...args), controller),
    finally: (...args: any[]) => mergeController(promise.finally(...args), controller),
  });
}

type ProxyPromise<T> = Omit<Promise<T>, 'then' | 'catch' | 'finally'> &
  SleepController & {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A ProxyPromise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): ProxyPromise<TResult1 | TResult2>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A ProxyPromise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): ProxyPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A ProxyPromise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): ProxyPromise<T>;
  };

/**
 * 等待一段时间
 *
 * @param time 等待时间
 */
export function sleep(time: number): ProxyPromise<boolean> {
  const { promise, resolve } = withResolvers<boolean>();

  const end = (flag: boolean) => {
    clearTimeout(timer);
    resolve(flag);
  };

  const timer = setTimeout(() => end(false), time);

  return mergeController(promise, {
    resolve: (cancel = true) => end(cancel),
    abort: () => end(true),
  });
}

export function sleepSync(time: number) {
  const cur = getNow();
  while (getNow() - cur < time);
}
