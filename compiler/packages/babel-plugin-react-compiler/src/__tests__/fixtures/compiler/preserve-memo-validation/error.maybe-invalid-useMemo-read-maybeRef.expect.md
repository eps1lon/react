
## Input

```javascript
// @validatePreserveExistingMemoizationGuarantees
import {useMemo} from 'react';

function useHook(maybeRef, shouldRead) {
  return useMemo(() => {
    return () => [maybeRef.current];
  }, [shouldRead, maybeRef]);
}

```


## Error

```
Found 1 error:

Memoization: Compilation skipped because existing memoization could not be preserved

React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `maybeRef.current`, but the source dependencies were [shouldRead, maybeRef]. Differences in ref.current access.

error.maybe-invalid-useMemo-read-maybeRef.ts:5:17
  3 |
  4 | function useHook(maybeRef, shouldRead) {
> 5 |   return useMemo(() => {
    |                  ^^^^^^^
> 6 |     return () => [maybeRef.current];
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 7 |   }, [shouldRead, maybeRef]);
    | ^^^^ Could not preserve existing manual memoization
  8 | }
  9 |
```
          
      