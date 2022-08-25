# react-router-history-pro

This module has the same functionallity of `BrowserRouter` from [react-router-dom](https://github.com/remix-run/react-router/blob/main/docs/getting-started/tutorial.md).

It extends its functionallity using `history-pro` module instead of `history`.
It can block routes and has a precise controll of navigation events.

**I recommend to see [history-pro](https://www.npmjs.com/package/history-pro) first**

This docs are incomplete. I will complete it. Please give me a ⭐ on GitHub if you can.


```tsx
import HistoryPro from "history-pro"
import { HistoryProRouter } from "react-router-history-pro"

const historyPro = new HistoryPro()

function App() {
  return (
    <div className="App">
      <HistoryProRouter history={historyPro}>
        <Routes>
          <Route path="/" element={<HOME />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products">
            <Route index element={<Catalog />} />
            <Route path=":id" element={<Product />} />
            <Route path="/other-nested-page" element={<Page />} />
          </Route>
        </Routes>
      </HistoryProRouter>
    </div>
  )

}
```

```tsx

/**
 * Returns the HistoryPro instance used by the router
 * it can be used to: push(), pop(), replace(), block(), listen(), and more!
 */
function useHistory(): HistoryPro

/**
 * Returns last navigation event as NavEvent instance
 */
function useHistoryEvent(): NavEvent

/**
 * Returns history location
 */
function useHistoryLocation(): NavLocation

/**
 * Used to block navigation.
 * It can block ⬅➡ keys and, using options, push and pop actions.
 * It returns a block() function. Then you use block(blocker_callback)
 */
function useBlock(): (blocker: (e: NavEvent, stopBlocking: () => void) => void, options?: BlockOptions) => () => void

/**
 * Used to block navigation.
 * It can block ⬅➡ keys and, using options, push and pop actions.
 * It recives directly the blocker function.
 * By default, it will automatically unblock if pushed a new location. Also if component removed.
 * Ej: making appear a modal, you can useBlocker and if modal dissapear it will automatically stop blocking.
 */
function useBlocker(blocker: (e: NavEvent, stopBlocking: () => void) => void, options?: BlockOptions): void

/**
 * Listen all history events.
 * It can be used to cancel event with event.setCancelled(true)
 */
function useHistoryListener(listener: (e: NavEvent) => void): void

/**
 * It can be used only one time on a route. (Is the same history every time for each location)
 * Stores the state on history
 */
function useHistoryState(initial?: any): any[]

/**
 * Returns router basename
 */

```
