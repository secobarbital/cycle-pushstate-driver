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

export function makePushStateDriver () {
  const hasPushState = 'history' in global && 'pushState' in global.history
  return hasPushState ? pushStateDriver : noPushStateDriver
}
