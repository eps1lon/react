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
  it('only contains act', async () => {
    expect(typeof ReactTestUtils.act).toBe('function');
    expect(ReactTestUtils.isDOMComponent).toBe(undefined);
  });
});
