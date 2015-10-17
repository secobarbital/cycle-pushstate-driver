
# Cycle PushState Driver

A [Cycle.js](http://cycle.js.org) [driver](http://cycle.js.org/drivers.html) for the history PushState API.

## API

### ```makePushStateDriver ()```

Returns a navigation driver that calls ```history.pushState``` on the input paths and outputs paths sent to ```pushState``` as well as received with ```popstate``` events, starting with the current path. If pushState is not supported, this function returns a driver that simply emits the current path.

## Install

```sh
npm install cycle-pushstate-driver

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
function main(responses) {
  let localLinkClick$ = DOM.select('a').events('click')
    .filter(e => e.currentTarget.host === location.host)

  let navigate$ = localLinkClick$
    .map(e => e.currentTarget.href)

  let vtree$ = responses.Path
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

Routing use case:

```js
import switchPath from 'switch-path'
import routes from './routes'

function resolve (path) {
  return switchPath(path, routes)
}

function main(responses) {
  let localLinkClick$ = DOM.select('a').events('click')
    .filter(e => e.currentTarget.host === location.host)

  let navigate$ = localLinkClick$
    .map(e => e.currentTarget.href)

  let vtree$ = responses.Path
    .map(resolve)
    .map(({ value }) => value)

  return {
    DOM: vtree$,
    Path: navigate$,
    preventDefault: localLinkClick$
  };
}
```
