/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails reactcore
 * @jest-environment node
 */

'use strict';

let JSDOM;
let React;
let ReactDOMClient;
let act;
let document;
let Fragment;

describe('FragmentRefs', () => {
  beforeEach(() => {
    jest.resetModules();
    JSDOM = require('jsdom');
    React = require('react');
    Fragment = React.Fragment;
    ReactDOMClient = require('react-dom/client');
    act = require('internal-test-utils').act;

    const jsdom = new JSDOM.JSDOM('');
    document = jsdom.window.document;
    global.window = jsdom.window;
    global.document = global.window.document;
    global.navigator = global.window.navigator;
    global.Event = global.window.Event;
  });

  describe('focus methods', () => {
    describe('blur()', () => {
      // @gate enableFragmentRefs
      it('throws when the nearest host parent is a Document container', async () => {
        const fragmentRef = React.createRef();
        const root = ReactDOMClient.createRoot(document);

        await act(() => {
          root.render(
            <Fragment ref={fragmentRef}>
              <html>
                <body>
                  <a id="child-a" href="/">
                    A
                  </a>
                </body>
              </html>
            </Fragment>,
          );
        });

        await act(() => {
          // focus() would stop at <body>, which is a child of the fragment
          // and usually already the activeElement.
          document.getElementById('child-a').focus();
        });
        expect(document.activeElement.id).toEqual('child-a');

        await act(() => {
          fragmentRef.current.blur();
        });
        expect(document.activeElement).toEqual(document.body);
      });
    });
  });

  describe('events', () => {
    describe('dispatchEvent()', () => {
      // @gate enableFragmentRefs
      it('fires events when the fragment is a child of a HostSingleton in a document root', async () => {
        const fragmentRef = React.createRef();
        const bodyRef = React.createRef();
        const root = ReactDOMClient.createRoot(document);

        await act(() => {
          root.render(
            <html>
              <body ref={bodyRef}>
                <Fragment ref={fragmentRef} />
              </body>
            </html>,
          );
        });

        const fragmentListener = jest.fn();
        fragmentRef.current.addEventListener('custom', fragmentListener);
        const bodyListener = jest.fn();
        bodyRef.current.addEventListener('custom', bodyListener);

        // The <body> is the fragment's host parent, so the
        // temporary event target is appended there.
        fragmentRef.current.dispatchEvent(new Event('custom', {bubbles: true}));

        expect(fragmentListener).toHaveBeenCalledTimes(1);
        expect(bodyListener).toHaveBeenCalledTimes(1);
      });
    });

    describe('addEventListener()', () => {
      // @gate enableFragmentRefs
      it('attaches listeners to the host children inside singletons', async () => {
        const fragmentRef = React.createRef();
        const childRef = React.createRef();
        const root = ReactDOMClient.createRoot(document);

        await act(() => {
          root.render(
            <Fragment ref={fragmentRef}>
              <html>
                <body>
                  <div ref={childRef} id="child" />
                </body>
              </html>
            </Fragment>,
          );
        });

        const currentTargets = [];
        fragmentRef.current.addEventListener('click', event => {
          currentTargets.push(event.currentTarget);
        });

        childRef.current.dispatchEvent(new Event('click', {bubbles: true}));

        // The <html> singleton is the fragment's child, so the listener is
        // attached there and receives the bubbling event.
        expect(currentTargets).toEqual([document.documentElement]);
      });
    });
  });

  describe('getClientRects()', () => {
    // @gate enableFragmentRefs
    it('measures the host children inside singletons', async () => {
      const fragmentRef = React.createRef();
      const childRef = React.createRef();
      const root = ReactDOMClient.createRoot(document);

      await act(() => {
        root.render(
          <Fragment ref={fragmentRef}>
            <html>
              <body>
                <div ref={childRef} id="child" />
              </body>
            </html>
          </Fragment>,
        );
      });

      childRef.current.getClientRects = jest.fn(() => ['child-rect']);
      document.documentElement.getClientRects = jest.fn(() => ['html-rect']);

      // The <html> singleton is the fragment's child, so it is measured
      // instead of the elements inside it
      expect(fragmentRef.current.getClientRects()).toEqual(['html-rect']);
    });
  });
});
