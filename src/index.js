import { Rx } from '@cycle/core'

function noPushStateDriver (navigate$) {
  navigate$.subscribe()
  return Rx.Observable.never()
    .startWith(global.location.pathname)
}

function pushStateDriver (navigate$) {
  const popState$ = Rx.Observable.fromEvent(global, 'popstate')
    .map(e => global.location.pathname)

  navigate$
    .subscribe(path => global.history.pushState(null, null, path))

  return Rx.Observable.merge(navigate$, popState$)
    .startWith(global.location.pathname)
    .distinctUntilChanged()
}

function noHashChangeDriver (navigate$) {
  navigate$.subscribe()
  return Rx.Observable.never()
    .startWith(global.location.hash)
}

function hashChangeDriver (navigate$) {
  const hashChange$ = Rx.Observable.fromEvent(global, 'hashchange')
    .map(e => e.newUrl)

  navigate$
    .subscribe(hash => {
      global.location.hash = hash
    })

  return hashChange$
    .startWith(global.location.hash)
    .distinctUntilChanged()
}

export function makePushStateDriver () {
  const hasPushState = 'history' in global && 'pushState' in global.history
  return hasPushState ? pushStateDriver : noPushStateDriver
}

export function makeHashChangeDriver () {
  const hasHashChange = 'onhashchange' in global
  return hasHashChange ? hashChangeDriver : noHashChangeDriver
}
