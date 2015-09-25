
# Cycle Navigation Driver

A [Cycle.js](http://cycle.js.org) [driver](http://cycle.js.org/drivers.html) for navigation.

## API

### ```makePushStateDriver ()```

Returns a navigation driver that calls ```history.pushState``` on the input paths and outputs paths sent to ```pushState``` as well as received with ```popstate``` events, starting with the current path.

### ```makeHashChangeDriver ()```

Returns a navigation driver that sets ```location.hash``` to the input hashes and outputs hashes received with ```hashchange``` events, starting with the current hash.

### ```makeNavigationDriver ()```

Returns the pushState driver if ```history.pushState``` is available, otherwise returns the hashchange Driver.

## Install

Only available via git for now. I will publish this module on npm once I have added tests.

## Usage

Basics:

```js
import Cycle from '@cycle/core'
import { makeNavigationDriver } from 'cycle-navigation-driver'

function main (responses) {
  // ...
}

const drivers = {
  Navigation: makeNavigationDriver()
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

  let vtree$ = responses.Navigation
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
    Navigation: navigate$,
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

  let vtree$ = responses.Navigation
    .map(resolve)
    .map(({ value }) => value)

  return {
    DOM: vtree$,
    Navigation: navigate$,
    preventDefault: localLinkClick$
  };
}
```

## Roadmap

### v0.x
 - Add tests
 - Handle errors
 - Support hash changes
 - Use cycle eslint config

### v1.x
 - Move to cycle.js org
 - Publish on npm
