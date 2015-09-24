import { Rx } from '@cycle/core'

export function makePushStateDriver () {
  return function PushStateDriver (navigate$) {
    const pushState$ = navigate$
      .distinctUntilChanged()
    const popState$ = Rx.Observable.fromEvent(global, 'popstate')
      .map(e => location.pathname)

    pushState$
      .subscribe(url => history.pushState(null, null, url))

    return Rx.Observable.merge(pushState$, popState$)
      .startWith(location.pathname)
      .distinctUntilChanged()
  }
}

export function makePathDriver () {
  return makePushStateDriver()
}
