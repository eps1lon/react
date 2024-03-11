/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';

let didWarnAboutActUsage = false;

function act(scope) {
  if (__DEV__) {
    if (!didWarnAboutActUsage) {
      didWarnAboutActUsage = true;
      console.error(
        "`act` from 'react-dom/test-utils' is deprecated. " +
          "Use `act` from 'react' instead e.g. `import {act} from 'react'`.",
      );
    }
  }

  return React.act(scope);
}

function makeRemovedFunction(name) {
  return function () {
    throw new Error(
      '`' +
        name +
        '` was removed from `react-dom/test-utils`. ' +
        'For testing React, we recommend React Testing Library instead: https://testing-library.com/docs/react-testing-library/intro.',
    );
  };
}

const renderIntoDocument = makeRemovedFunction('renderIntoDocument');
const isElement = makeRemovedFunction('isElement');
const isElementOfType = makeRemovedFunction('isElementOfType');
const isDOMComponent = makeRemovedFunction('isDOMComponent');
const isDOMComponentElement = makeRemovedFunction('isDOMComponentElement');
const isCompositeComponent = makeRemovedFunction('isCompositeComponent');
const isCompositeComponentWithType = makeRemovedFunction(
  'isCompositeComponentWithType',
);
const findAllInRenderedTree = makeRemovedFunction('findAllInRenderedTree');
const scryRenderedDOMComponentsWithClass = makeRemovedFunction(
  'scryRenderedDOMComponentsWithClass',
);
const findRenderedDOMComponentWithClass = makeRemovedFunction(
  'findRenderedDOMComponentWithClass',
);
const scryRenderedDOMComponentsWithTag = makeRemovedFunction(
  'scryRenderedDOMComponentsWithTag',
);
const findRenderedDOMComponentWithTag = makeRemovedFunction(
  'findRenderedDOMComponentWithTag',
);
const scryRenderedComponentsWithType = makeRemovedFunction(
  'scryRenderedComponentsWithType',
);
const findRenderedComponentWithType = makeRemovedFunction(
  'findRenderedComponentWithType',
);
const mockComponent = makeRemovedFunction('mockComponent');
const nativeTouchData = makeRemovedFunction('nativeTouchData');

// Snapshot of events supported by Simulate before we removed it.
// Do not add new events here since the new ones were never supported in the first place.
const simulatedEventTypes = [
  'blur',
  'cancel',
  'click',
  'close',
  'contextMenu',
  'copy',
  'cut',
  'auxClick',
  'doubleClick',
  'dragEnd',
  'dragStart',
  'drop',
  'focus',
  'input',
  'invalid',
  'keyDown',
  'keyPress',
  'keyUp',
  'mouseDown',
  'mouseUp',
  'paste',
  'pause',
  'play',
  'pointerCancel',
  'pointerDown',
  'pointerUp',
  'rateChange',
  'reset',
  'resize',
  'seeked',
  'submit',
  'touchCancel',
  'touchEnd',
  'touchStart',
  'volumeChange',
  'drag',
  'dragEnter',
  'dragExit',
  'dragLeave',
  'dragOver',
  'mouseMove',
  'mouseOut',
  'mouseOver',
  'pointerMove',
  'pointerOut',
  'pointerOver',
  'scroll',
  'toggle',
  'touchMove',
  'wheel',
  'abort',
  'animationEnd',
  'animationIteration',
  'animationStart',
  'canPlay',
  'canPlayThrough',
  'durationChange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'gotPointerCapture',
  'load',
  'loadedData',
  'loadedMetadata',
  'loadStart',
  'lostPointerCapture',
  'playing',
  'progress',
  'seeking',
  'stalled',
  'suspend',
  'timeUpdate',
  'transitionEnd',
  'waiting',
  'mouseEnter',
  'mouseLeave',
  'pointerEnter',
  'pointerLeave',
  'change',
  'select',
  'beforeInput',
  'compositionEnd',
  'compositionStart',
  'compositionUpdate',
];

const Simulate = {};

simulatedEventTypes.forEach(eventType => {
  Simulate[eventType] = function () {
    throw new Error(
      '`Simulate` was removed from `react-dom/test-utils`. ' +
        'For testing events, we recommend `fireEvent.' +
        eventType +
        '` from `@testing-library/react` instead: https://testing-library.com/docs/dom-testing-library/api-events/.',
    );
  };
});

export {
  act,
  // Removed APIs
  renderIntoDocument,
  isElement,
  isElementOfType,
  isDOMComponent,
  isDOMComponentElement,
  isCompositeComponent,
  isCompositeComponentWithType,
  findAllInRenderedTree,
  scryRenderedDOMComponentsWithClass,
  findRenderedDOMComponentWithClass,
  scryRenderedDOMComponentsWithTag,
  findRenderedDOMComponentWithTag,
  scryRenderedComponentsWithType,
  findRenderedComponentWithType,
  mockComponent,
  nativeTouchData,
  Simulate,
};
