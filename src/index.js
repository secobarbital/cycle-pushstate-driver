import { Rx } from '@cycle/core'

export function makePushStateDriver () {
  return function pushStateDriver (navigate$) {
    const pushState$ = navigate$
      .distinctUntilChanged()
    const popState$ = Rx.Observable.fromEvent(global, 'popstate')
      .map(e => location.pathname)

    pushState$
      .subscribe(pathname => history.pushState(null, null, pathname))

    return Rx.Observable.merge(pushState$, popState$)
      .startWith(location.pathname)
      .distinctUntilChanged()
  }
}

export function makeHashChangeDriver () {
  return function hashChangeDriver (navigate$) {
    const hashChange$ = Rx.Observable.fromEvent(global, 'hashchange')
      .map(e => e.newUrl)

    navigate$
      .distinctUntilChanged()
      .subscribe(hash => {
        location.hash = hash
      })

    return hashChange$
      .startWith(location.hash)
      .distinctUntilChanged()
  }
}

export function makeNavigationDriver () {
  let hasPushState = 'history' in global && 'pushState' in history
  let hasHashChange = 'onhashchange' in global
  if (hasPushState) return makePushStateDriver()
  if (hasHashChange) return makeHashChangeDriver()
  throw new Error('Navigation Driver requires pushState or onhashchange')
}
