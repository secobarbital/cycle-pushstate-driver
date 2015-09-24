
# Cycle URL Driver

A [Cycle.js](http://cycle.js.org) [driver](http://cycle.js.org/drivers.html) for changing the URL, and reacting to URL changes.

## Install

Only available via git for now. I will publish this module on npm once I have added tests.

## Usage

Basics:

```js
import Cycle from '@cycle/core'
import { makeURLDriver } from 'cycle-url-driver'

function main (responses) {
  // ...
}

const drivers = {
  URL: makeURLDriver()
}

Cycle.run(main, drivers)
```

Simple and normal use case:

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

  let vtree$ = responses.URL
    .map(resolve)
    .map(({ value }) => value)

  return {
    DOM: vtree$,
    URL: navigate$,
    preventDefault: localLinkClick$
  };
}
```

## Roadmap

### v0.x
 - Add tests
 - Support hash changes
 - Use cycle eslint config

### v1.x
 - Move to cycle.js org
 - Publish on npm
