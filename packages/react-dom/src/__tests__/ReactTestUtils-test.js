/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

import * as ReactTestUtils from 'react-dom/test-utils';

describe('ReactTestUtils', () => {
  it('contains act', async () => {
    expect(typeof ReactTestUtils.act).toBe('function');
  });

  it('throws on every removed function with a special message', async () => {
    expect(ReactTestUtils.isDOMComponent).toThrowError(
      '`isDOMComponent` was removed from `react-dom/test-utils`. ' +
        'For testing React, we recommend React Testing Library instead: https://testing-library.com/docs/react-testing-library/intro.',
    );
  });

  it('Simulate throws with a message recommending the relevant React Testing Library API', async () => {
    expect(ReactTestUtils.Simulate.click).toThrowError(
      '`Simulate` was removed from `react-dom/test-utils`. ' +
        'For testing events, we recommend `fireEvent.click` from `@testing-library/react` instead: https://testing-library.com/docs/dom-testing-library/api-events/.',
    );
  });
});
