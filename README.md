
# Cycle PushState Driver

A [Cycle.js](http://cycle.js.org) [driver](http://cycle.js.org/drivers.html) for the history PushState API.

## Design Choices

This is a very minimal Cycle.js driver that simply isolates ```history.pushState``` calls and  ```popstate``` events. It makes no assumption about how you want to filter and transform click/touch event streams to come up with the paths to push. Nor will it do ```e.preventDefault()``` for you.

Finally, in the absence of ``pushState`` support it does not try to use ````hashchange``` but instead lets the links work as normal links. This means that your ```preventDefault``` driver needs to know not to capture these click/touch events.

If you prefer a driver that covers all these cases, you may want to consider the [```TylorS/cycle-history```](https://github.com/TylorS/cycle-history) driver which is a batteries-included approach to the same problem.

## API

### ```makePushStateDriver ()```

Returns a navigation driver that calls ```history.pushState``` on the input paths and outputs paths sent to ```pushState``` as well as received with ```popstate``` events, starting with the current path. If ```pushState``` is not supported, this function returns a driver that simply emits the current path.

## Install

```sh
npm install cycle-pushstate-driver
```

## Usage

Basics:

```js
import Cycle from '@cycle/core'
import { makePushStateDriver } from 'cycle-pushstate-driver'

function main (responses) {
  // ...
}

const drivers = {
  Path: makePushStateDriver()
}

Cycle.run(main, drivers)
```

Simple use case:

```js
function main({ DOM, Path }) {
  let localLinkClick$ = DOM.select('a').events('click')
    .filter(e => e.currentTarget.host === location.host)

  let navigate$ = localLinkClick$
    .map(e => e.currentTarget.href)

  let vtree$ = Path
    .map(url => {
      switch(url) {
        case '/':
          renderHome()
          break
        case '/user':
          renderUser()
          break
        default:
          render404()
          break
      }
    })

  return {
    DOM: vtree$,
    Path: navigate$,
    preventDefault: localLinkClick$
  };
}
```

Routing use case with ```switch-path```:

```js
import switchPath from 'switch-path'
import routes from './routes'

function resolve (path) {
  return switchPath(path, routes)
}

function main({ DOM, Path }) {
  const localLinkClick$ = DOM.select('a').events('click')
    .filter(e => e.currentTarget.host === location.host)

  const navigate$ = localLinkClick$
    .map(e => e.currentTarget.href)

  const vtree$ = Path
    .map(resolve)
    .map(({ value }) => value)

  return {
    DOM: vtree$,
    Path: navigate$,
    preventDefault: localLinkClick$
  };
}
```

Routing use case with ```wayfarer```:
```js
import wayfarer from 'wayfarer'

function route (path$) {
  const route$ = new Rx.ReplaySubject(1)
  const r = name => params => route$.onNext({ name, params })

  const router = wayfarer('/notfound')
  router.on('/', r('owers'))
  router.on('/owers/:ower', r('owees'))
  router.on('/notfound', r('notfound'))

  path$
    .subscribe(
      path => router(path),
      route$.onError.bind(route$),
      route$.onCompleted.bind(route$)
    )
  return route$
}

function main({ DOM, Path }) {
  const Route = route(Path)
  
  const localLinkClick$ = DOM.select('a').events('click')
    .filter(e => e.currentTarget.host === location.host)

  const navigate$ = localLinkClick$
    .map(e => e.currentTarget.href)

  const vtree$ = Rx.Observable.combineLatest(
    Route, owersVtree$, oweesVtree$, notfoundVtree$,
    (route, owersVtree, oweesVtree, notfoundVtree) => {
      const vtrees = {
        'owers': owersVtree,
        'owees': oweesVtree,
        'notfound': notfoundVtree
      }
      return vtrees[route.name]
    }
  )

  return {
    DOM: vtree$,
    Path: navigate$,
    preventDefault: localLinkClick$
  };
}
```
