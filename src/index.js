import { Rx } from '@cycle/core'

export function makePushStateDriver () {
  return function pushStateDriver (navigate$) {
    const popState$ = Rx.Observable.fromEvent(global, 'popstate')
      .map(e => global.location.pathname)

    navigate$
      .subscribe(pathname => global.history.pushState(null, null, pathname))

    return Rx.Observable.merge(navigate$, popState$)
      .startWith(location.pathname)
      .distinctUntilChanged()
  }
}

export function makeHashChangeDriver () {
  return function hashChangeDriver (navigate$) {
    const hashChange$ = Rx.Observable.fromEvent(global, 'hashchange')
      .map(e => e.newUrl)

    navigate$
      .subscribe(hash => {
        location.hash = hash
      })

    return hashChange$
      .startWith(global.location.hash)
      .distinctUntilChanged()
  }
}

export function makeNavigationDriver () {
  let hasPushState = 'history' in global && 'pushState' in global.history
  let hasHashChange = 'onhashchange' in global
  if (hasPushState) return makePushStateDriver()
  if (hasHashChange) return makeHashChangeDriver()
  throw new Error('Navigation Driver requires pushState or onhashchange')
}
