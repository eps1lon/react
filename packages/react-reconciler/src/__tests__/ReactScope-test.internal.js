/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactFeatureFlags;
let ReactDOMServer;
let Scheduler;

describe('ReactScope', () => {
  beforeEach(() => {
    jest.resetModules();
    ReactFeatureFlags = require('shared/ReactFeatureFlags');
    ReactFeatureFlags.enableScopeAPI = true;
    React = require('react');
    Scheduler = require('scheduler');
  });

  describe('ReactDOM', () => {
    let ReactDOM;
    let container;

    beforeEach(() => {
      ReactDOM = require('react-dom');
      ReactDOMServer = require('react-dom/server');
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
      container = null;
    });

    // @gate www
    it('DO_NOT_USE_queryAllNodes() works as intended', () => {
      const testScopeQuery = (type, props) => true;
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <TestScope ref={scopeRef}>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
            <a ref={aRef}>A</a>
          </TestScope>
        ) : (
          <TestScope ref={scopeRef}>
            <a ref={aRef}>A</a>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
          </TestScope>
        );
      }

      ReactDOM.render(<Test toggle={true} />, container);
      let nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(testScopeQuery);
      expect(nodes).toEqual([divRef.current, spanRef.current, aRef.current]);
      ReactDOM.render(<Test toggle={false} />, container);
      nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(testScopeQuery);
      expect(nodes).toEqual([aRef.current, divRef.current, spanRef.current]);
      ReactDOM.render(null, container);
      expect(scopeRef.current).toBe(null);
    });

    // @gate www
    it('DO_NOT_USE_queryAllNodes() provides the correct host instance', () => {
      const testScopeQuery = (type, props) => type === 'div';
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <TestScope ref={scopeRef}>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
            <a ref={aRef}>A</a>
          </TestScope>
        ) : (
          <TestScope ref={scopeRef}>
            <a ref={aRef}>A</a>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
          </TestScope>
        );
      }

      ReactDOM.render(<Test toggle={true} />, container);
      let nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(testScopeQuery);
      expect(nodes).toEqual([divRef.current]);
      let filterQuery = (type, props, instance) =>
        instance === spanRef.current || testScopeQuery(type, props);
      nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(filterQuery);
      expect(nodes).toEqual([divRef.current, spanRef.current]);
      filterQuery = (type, props, instance) =>
        [spanRef.current, aRef.current].includes(instance) ||
        testScopeQuery(type, props);
      nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(filterQuery);
      expect(nodes).toEqual([divRef.current, spanRef.current, aRef.current]);
      ReactDOM.render(<Test toggle={false} />, container);
      filterQuery = (type, props, instance) =>
        [spanRef.current, aRef.current].includes(instance) ||
        testScopeQuery(type, props);
      nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(filterQuery);
      expect(nodes).toEqual([aRef.current, divRef.current, spanRef.current]);
      ReactDOM.render(null, container);
      expect(scopeRef.current).toBe(null);
    });

    // @gate www
    it('DO_NOT_USE_queryFirstNode() works as intended', () => {
      const testScopeQuery = (type, props) => true;
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <TestScope ref={scopeRef}>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
            <a ref={aRef}>A</a>
          </TestScope>
        ) : (
          <TestScope ref={scopeRef}>
            <a ref={aRef}>A</a>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
          </TestScope>
        );
      }

      ReactDOM.render(<Test toggle={true} />, container);
      let node = scopeRef.current.DO_NOT_USE_queryFirstNode(testScopeQuery);
      expect(node).toEqual(divRef.current);
      ReactDOM.render(<Test toggle={false} />, container);
      node = scopeRef.current.DO_NOT_USE_queryFirstNode(testScopeQuery);
      expect(node).toEqual(aRef.current);
      ReactDOM.render(null, container);
      expect(scopeRef.current).toBe(null);
    });

    // @gate www
    it('containsNode() works as intended', () => {
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();
      const outerSpan = React.createRef();
      const emRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <div>
            <span ref={outerSpan}>SPAN</span>
            <TestScope ref={scopeRef}>
              <div ref={divRef}>DIV</div>
              <span ref={spanRef}>SPAN</span>
              <a ref={aRef}>A</a>
            </TestScope>
            <em ref={emRef}>EM</em>
          </div>
        ) : (
          <div>
            <TestScope ref={scopeRef}>
              <a ref={aRef}>A</a>
              <div ref={divRef}>DIV</div>
              <span ref={spanRef}>SPAN</span>
              <em ref={emRef}>EM</em>
            </TestScope>
            <span ref={outerSpan}>SPAN</span>
          </div>
        );
      }

      ReactDOM.render(<Test toggle={true} />, container);
      expect(scopeRef.current.containsNode(divRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(spanRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(aRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(outerSpan.current)).toBe(false);
      expect(scopeRef.current.containsNode(emRef.current)).toBe(false);
      ReactDOM.render(<Test toggle={false} />, container);
      expect(scopeRef.current.containsNode(divRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(spanRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(aRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(outerSpan.current)).toBe(false);
      expect(scopeRef.current.containsNode(emRef.current)).toBe(true);
      ReactDOM.render(<Test toggle={true} />, container);
      expect(scopeRef.current.containsNode(emRef.current)).toBe(false);
    });

    // @gate www
    it('scopes support server-side rendering and hydration', () => {
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();

      function Test({toggle}) {
        return (
          <div>
            <TestScope ref={scopeRef}>
              <div ref={divRef}>DIV</div>
              <span ref={spanRef}>SPAN</span>
              <a ref={aRef}>A</a>
            </TestScope>
            <div>Outside content!</div>
          </div>
        );
      }
      const html = ReactDOMServer.renderToString(<Test />);
      expect(html).toBe(
        '<div><div>DIV</div><span>SPAN</span><a>A</a><div>Outside content!</div></div>',
      );
      container.innerHTML = html;
      ReactDOM.hydrate(<Test />, container);
      const testScopeQuery = (type, props) => true;
      const nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(testScopeQuery);
      expect(nodes).toEqual([divRef.current, spanRef.current, aRef.current]);
    });

    // @gate www
    it('getChildContextValues() works as intended', () => {
      const TestContext = React.createContext();
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <TestScope ref={scopeRef}>
            <TestContext.Provider value={1} />
          </TestScope>
        ) : (
          <TestScope ref={scopeRef}>
            <TestContext.Provider value={1} />
            <TestContext.Provider value={2} />
          </TestScope>
        );
      }

      ReactDOM.render(<Test toggle={true} />, container);
      let nodes = scopeRef.current.getChildContextValues(TestContext);
      expect(nodes).toEqual([1]);
      ReactDOM.render(<Test toggle={false} />, container);
      nodes = scopeRef.current.getChildContextValues(TestContext);
      expect(nodes).toEqual([1, 2]);
      ReactDOM.render(null, container);
      expect(scopeRef.current).toBe(null);
    });

    // @gate www
    it('correctly works with suspended boundaries that are hydrated', async () => {
      let suspend = false;
      let resolve;
      const promise = new Promise(resolvePromise => (resolve = resolvePromise));
      const ref = React.createRef();
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const testScopeQuery = (type, props) => true;

      function Child() {
        if (suspend) {
          throw promise;
        } else {
          return 'Hello';
        }
      }

      function App() {
        return (
          <div>
            <TestScope ref={scopeRef}>
              <React.Suspense fallback="Loading...">
                <span ref={ref}>
                  <Child />
                </span>
              </React.Suspense>
            </TestScope>
          </div>
        );
      }

      // First we render the final HTML. With the streaming renderer
      // this may have suspense points on the server but here we want
      // to test the completed HTML. Don't suspend on the server.
      suspend = false;
      const finalHTML = ReactDOMServer.renderToString(<App />);

      const container2 = document.createElement('div');
      container2.innerHTML = finalHTML;

      const span = container2.getElementsByTagName('span')[0];

      // On the client we don't have all data yet but we want to start
      // hydrating anyway.
      suspend = true;
      const root = ReactDOM.createRoot(container2, {hydrate: true});
      root.render(<App />);
      Scheduler.unstable_flushAll();
      jest.runAllTimers();

      // This should not cause a runtime exception, see:
      // https://github.com/facebook/react/pull/18184
      scopeRef.current.DO_NOT_USE_queryAllNodes(testScopeQuery);
      expect(ref.current).toBe(null);

      // Resolving the promise should continue hydration
      suspend = false;
      resolve();
      await promise;
      Scheduler.unstable_flushAll();
      jest.runAllTimers();

      // We should now have hydrated with a ref on the existing span.
      expect(ref.current).toBe(span);
    });

    // @gate experimental
    describe('Material-UI', () => {
      it('can implement [role="listbox"]', () => {
        const ListboxScope = React.unstable_Scope;
        const ListboxContext = React.createContext(null);
        const OptionContext = React.createContext(null);

        function findInitialOption(selectedValue, options) {
          return (
            options.find(option => option.value === selectedValue) || options[0]
          );
        }

        function Listbox({children, onChange, value}) {
          const scopeRef = React.useRef(null);
          const queryOptions = () =>
            scopeRef.current.getChildContextValues(OptionContext);

          const [focused, setFocused] = React.useState(false);
          const [activeDescendant, setActiveDescendant] = React.useState(null);
          function handleFocus(event) {
            const options = queryOptions();

            if (options.length > 0) {
              if (activeDescendant === null) {
                setActiveDescendant(findInitialOption(value, options).id);
              } else if (
                options.find(option => option.id === activeDescendant) ===
                undefined
              ) {
                setActiveDescendant(findInitialOption(value, options).id);
              }
            }
            setFocused(true);
          }

          function handleBlur() {
            setFocused(false);
          }

          function handleKeyDown(event) {
            const options = queryOptions();
            const activeIndex = options.findIndex(
              option => option.id === activeDescendant,
            );

            let nextActiveIndex = null;
            switch (event.key) {
              case 'ArrowDown':
                nextActiveIndex = (activeIndex + 1) % options.length;
                break;
            }
            if (nextActiveIndex !== null) {
              event.preventDefault();
              setActiveDescendant(options[nextActiveIndex].id);
              onChange(options[nextActiveIndex].value);
            }
          }

          return (
            <ListboxScope ref={scopeRef}>
              <ListboxContext.Provider value={{value}}>
                <ul
                  // the list of descendants is only checked on focus
                  // in the meantime the descendant might be removed
                  aria-activedescendant={focused ? activeDescendant : undefined}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  onKeyDown={handleKeyDown}
                  role="listbox"
                  tabIndex={0}>
                  {children}
                </ul>
              </ListboxContext.Provider>
            </ListboxScope>
          );
        }

        function Option({id: idProp, value, ...other}) {
          const reactId = React.useId();
          const id = idProp == null ? reactId : idProp;

          const {value: selectedValue} = React.useContext(ListboxContext);

          const selected = value === selectedValue;

          return (
            <OptionContext.Provider value={{id, value}}>
              <li aria-selected={selected} id={id} role="option" {...other} />
            </OptionContext.Provider>
          );
        }

        function MyListbox() {
          const [value, setValue] = React.useState(3);

          return (
            <Listbox onChange={setValue} value={value}>
              <div role="group">
                <Option value={1}>one</Option>
                <Option value={2}>two</Option>
              </div>
              <Option value={3}>three</Option>
              <hr />
              <Option value={4}>four</Option>
              {ReactDOM.createPortal(
                <Option value={5}>five</Option>,
                document.body,
              )}
            </Listbox>
          );
        }

        ReactDOM.render(<MyListbox />, container);

        const listbox = document.querySelector('[role="listbox"]');
        const options = document.querySelectorAll('[role="option"]');
        listbox.focus();

        expect(options[2].getAttribute('aria-selected')).toEqual('true');
        expect(listbox.getAttribute('aria-activedescendant')).toEqual(
          options[2].id,
        );

        listbox.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'ArrowDown',
          }),
        );

        expect(options[3].getAttribute('aria-selected')).toEqual('true');
        expect(listbox.getAttribute('aria-activedescendant')).toEqual(
          options[3].id,
        );

        listbox.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'ArrowDown',
          }),
        );

        expect(options[4].getAttribute('aria-selected')).toEqual('true');
        expect(listbox.getAttribute('aria-activedescendant')).toEqual(
          options[4].id,
        );

        listbox.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'ArrowDown',
          }),
        );

        expect(options[0].getAttribute('aria-selected')).toEqual('true');
        expect(listbox.getAttribute('aria-activedescendant')).toEqual(
          options[0].id,
        );

        listbox.blur();
        // active descendant might be removed so better not display anything than a stale value
        expect(listbox.hasAttribute('aria-activedescendant')).toEqual(false);
      });
    });
  });

  describe('ReactTestRenderer', () => {
    let ReactTestRenderer;

    beforeEach(() => {
      ReactTestRenderer = require('react-test-renderer');
    });

    // @gate www
    it('DO_NOT_USE_queryAllNodes() works as intended', () => {
      const testScopeQuery = (type, props) => true;
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <TestScope ref={scopeRef}>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
            <a ref={aRef}>A</a>
          </TestScope>
        ) : (
          <TestScope ref={scopeRef}>
            <a ref={aRef}>A</a>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
          </TestScope>
        );
      }

      const renderer = ReactTestRenderer.create(<Test toggle={true} />, {
        createNodeMock: element => {
          return element;
        },
      });
      let nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(testScopeQuery);
      expect(nodes).toEqual([divRef.current, spanRef.current, aRef.current]);
      renderer.update(<Test toggle={false} />);
      nodes = scopeRef.current.DO_NOT_USE_queryAllNodes(testScopeQuery);
      expect(nodes).toEqual([aRef.current, divRef.current, spanRef.current]);
    });

    // @gate www
    it('DO_NOT_USE_queryFirstNode() works as intended', () => {
      const testScopeQuery = (type, props) => true;
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <TestScope ref={scopeRef}>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
            <a ref={aRef}>A</a>
          </TestScope>
        ) : (
          <TestScope ref={scopeRef}>
            <a ref={aRef}>A</a>
            <div ref={divRef}>DIV</div>
            <span ref={spanRef}>SPAN</span>
          </TestScope>
        );
      }

      const renderer = ReactTestRenderer.create(<Test toggle={true} />, {
        createNodeMock: element => {
          return element;
        },
      });
      let node = scopeRef.current.DO_NOT_USE_queryFirstNode(testScopeQuery);
      expect(node).toEqual(divRef.current);
      renderer.update(<Test toggle={false} />);
      node = scopeRef.current.DO_NOT_USE_queryFirstNode(testScopeQuery);
      expect(node).toEqual(aRef.current);
    });

    // @gate www
    it('containsNode() works as intended', () => {
      const TestScope = React.unstable_Scope;
      const scopeRef = React.createRef();
      const divRef = React.createRef();
      const spanRef = React.createRef();
      const aRef = React.createRef();
      const outerSpan = React.createRef();
      const emRef = React.createRef();

      function Test({toggle}) {
        return toggle ? (
          <div>
            <span ref={outerSpan}>SPAN</span>
            <TestScope ref={scopeRef}>
              <div ref={divRef}>DIV</div>
              <span ref={spanRef}>SPAN</span>
              <a ref={aRef}>A</a>
            </TestScope>
            <em ref={emRef}>EM</em>
          </div>
        ) : (
          <div>
            <TestScope ref={scopeRef}>
              <a ref={aRef}>A</a>
              <div ref={divRef}>DIV</div>
              <span ref={spanRef}>SPAN</span>
              <em ref={emRef}>EM</em>
            </TestScope>
            <span ref={outerSpan}>SPAN</span>
          </div>
        );
      }

      const renderer = ReactTestRenderer.create(<Test toggle={true} />, {
        createNodeMock: element => {
          return element;
        },
      });
      expect(scopeRef.current.containsNode(divRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(spanRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(aRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(outerSpan.current)).toBe(false);
      expect(scopeRef.current.containsNode(emRef.current)).toBe(false);
      renderer.update(<Test toggle={false} />);
      expect(scopeRef.current.containsNode(divRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(spanRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(aRef.current)).toBe(true);
      expect(scopeRef.current.containsNode(outerSpan.current)).toBe(false);
      expect(scopeRef.current.containsNode(emRef.current)).toBe(true);
      renderer.update(<Test toggle={true} />);
      expect(scopeRef.current.containsNode(emRef.current)).toBe(false);
    });
  });
});
