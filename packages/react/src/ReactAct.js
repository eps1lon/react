/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {Thenable} from 'shared/ReactTypes';
import type {RendererTask} from './ReactCurrentActQueue';
import ReactCurrentActQueue from './ReactCurrentActQueue';
import queueMacrotask from 'shared/enqueueTask';

// `act` calls can be nested, so we track the depth. This represents the
// number of `act` scopes on the stack.
let actScopeDepth = 0;

// We only warn the first time you neglect to await an async `act` scope.
let didWarnNoAwaitAct = false;

export function act<T>(callback: () => T | Thenable<T>): Thenable<T> {
  if (__DEV__) {
    // We warn in a later task if this `act` call was not awaited.
    // To make it easier to find the `act` call that wasn't awaited, we'll add
    // the (sync) stack trace of the `act` call to the warning which we extract
    // this error if we need it.
    // eslint-disable-next-line react-internal/prod-error-codes -- Block DEV only
    const noAwaitError = new Error();

    // When ReactCurrentActQueue.current is not null, it signals to React that
    // we're currently inside an `act` scope. React will push all its tasks to
    // this queue instead of scheduling them with platform APIs.
    //
    // We set this to an empty array when we first enter an `act` scope, and
    // only unset it once we've left the outermost `act` scope — remember that
    // `act` calls can be nested.
    //
    // If we're already inside an `act` scope, reuse the existing queue.
    const prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
    const prevActQueue = ReactCurrentActQueue.current;
    const prevActScopeDepth = actScopeDepth;
    actScopeDepth++;
    const queue = (ReactCurrentActQueue.current =
      prevActQueue !== null ? prevActQueue : []);
    // Used to reproduce behavior of `batchedUpdates` in legacy mode. Only
    // set to `true` while the given callback is executed, not for updates
    // triggered during an async event, because this is how the legacy
    // implementation of `act` behaved.
    ReactCurrentActQueue.isBatchingLegacy = true;

    let result;
    // This tracks whether the `act` call is awaited. In certain cases, not
    // awaiting it is a mistake, so we will detect that and warn.
    let didAwaitActCall = false;
    try {
      result = callback();

      // `isBatchingLegacy` gets reset using the regular stack, not the async
      // one used to track `act` scopes. Why, you may be wondering? Because
      // that's how it worked before version 18. Yes, it's confusing! We should
      // delete legacy mode!!
      ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
    } catch (error) {
      // `isBatchingLegacy` gets reset using the regular stack, not the async
      // one used to track `act` scopes. Why, you may be wondering? Because
      // that's how it worked before version 18. Yes, it's confusing! We should
      // delete legacy mode!!
      ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
      popActScope(prevActQueue, prevActScopeDepth);
      throw error;
    }

    // A promise/thenable was returned from the callback. Wait for it to
    // resolve before flushing the queue.
    //
    // TODO: Implement `act` as an async function.
    const thenable =
      result !== null &&
      typeof result === 'object' &&
      // $FlowFixMe[method-unbinding]
      typeof result.then === 'function'
        ? ((result: any): Thenable<T>)
        : Promise.resolve(((result: any): T));

    // Warn if the an `act` call with an async scope is not awaited. In a
    // future release, consider making this an error.
    queueSeveralMicrotasks(() => {
      if (!didAwaitActCall && !didWarnNoAwaitAct) {
        didWarnNoAwaitAct = true;
        const stackAddendum = noAwaitError.stack
          ? ' at\n' + noAwaitError.stack
          : '.';
        console.error(
          '`act` has to be awaited to apply all state updates. ' +
            'You called `act()` without await%s',
          stackAddendum,
        );
      }
    });

    return {
      then(resolve: T => mixed, reject: mixed => mixed) {
        didAwaitActCall = true;
        thenable.then(
          returnValue => {
            popActScope(prevActQueue, prevActScopeDepth);
            if (prevActScopeDepth === 0) {
              // We're exiting the outermost `act` scope. Flush the queue.
              try {
                flushActQueue(queue);
                queueMacrotask(() =>
                  // Recursively flush tasks scheduled by a microtask.
                  recursivelyFlushAsyncActWork(returnValue, resolve, reject),
                );
              } catch (error) {
                // `thenable` might not be a real promise, and `flushActQueue`
                // might throw, so we need to wrap `flushActQueue` in a
                // try/catch.
                reject(error);
              }
            } else {
              resolve(returnValue);
            }
          },
          error => {
            popActScope(prevActQueue, prevActScopeDepth);
            reject(error);
          },
        );
      },
    };
  } else {
    throw new Error('act(...) is not supported in production builds of React.');
  }
}

function popActScope(
  prevActQueue: null | Array<RendererTask>,
  prevActScopeDepth: number,
) {
  if (__DEV__) {
    if (prevActScopeDepth !== actScopeDepth - 1) {
      console.error(
        'You seem to have overlapping act() calls, this is not supported. ' +
          'Be sure to await previous act() calls before making a new one. ',
      );
    }
    actScopeDepth = prevActScopeDepth;
  }
}

function recursivelyFlushAsyncActWork<T>(
  returnValue: T,
  resolve: T => mixed,
  reject: mixed => mixed,
) {
  if (__DEV__) {
    // Check if any tasks were scheduled asynchronously.
    const queue = ReactCurrentActQueue.current;
    if (queue !== null) {
      if (queue.length !== 0) {
        // Async tasks were scheduled, mostly likely in a microtask.
        // Keep flushing until there are no more.
        try {
          flushActQueue(queue);
          // The work we just performed may have schedule additional async
          // tasks. Wait a macrotask and check again.
          queueMacrotask(() =>
            recursivelyFlushAsyncActWork(returnValue, resolve, reject),
          );
        } catch (error) {
          // Leave remaining tasks on the queue if something throws.
          reject(error);
        }
      } else {
        // The queue is empty. We can finish.
        ReactCurrentActQueue.current = null;
        resolve(returnValue);
      }
    } else {
      resolve(returnValue);
    }
  }
}

let isFlushing = false;
function flushActQueue(queue: Array<RendererTask>) {
  if (__DEV__) {
    if (!isFlushing) {
      // Prevent re-entrance.
      isFlushing = true;
      let i = 0;
      try {
        for (; i < queue.length; i++) {
          let callback: RendererTask = queue[i];
          do {
            ReactCurrentActQueue.didUsePromise = false;
            const continuation = callback(false);
            if (continuation !== null) {
              if (ReactCurrentActQueue.didUsePromise) {
                // The component just suspended. Yield to the main thread in
                // case the promise is already resolved. If so, it will ping in
                // a microtask and we can resume without unwinding the stack.
                queue[i] = callback;
                queue.splice(0, i);
                return;
              }
              callback = continuation;
            } else {
              break;
            }
          } while (true);
        }
        // We flushed the entire queue.
        queue.length = 0;
      } catch (error) {
        // If something throws, leave the remaining callbacks on the queue.
        queue.splice(0, i + 1);
        throw error;
      } finally {
        isFlushing = false;
      }
    }
  }
}

// Some of our warnings attempt to detect if the `act` call is awaited by
// checking in an asynchronous task. Wait a few microtasks before checking. The
// only reason one isn't sufficient is we want to accommodate the case where an
// `act` call is returned from an async function without first being awaited,
// since that's a somewhat common pattern. If you do this too many times in a
// nested sequence, you might get a warning, but you can always fix by awaiting
// the call.
//
// A macrotask would also work (and is the fallback) but depending on the test
// environment it may cause the warning to fire too late.
const queueSeveralMicrotasks =
  typeof queueMicrotask === 'function'
    ? (callback: () => void) => {
        queueMicrotask(() => queueMicrotask(callback));
      }
    : queueMacrotask;
