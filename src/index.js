import { Rx } from '@cycle/core'

export function makeURLDriver () {
  return function URLDriver (navigate$) {
    const pushState$ = navigate$
      .distinctUntilChanged()
      .do(url => history.pushState(null, null, url))
    const popState$ = Rx.Observable.fromEvent(global, 'popstate')
      .map(e => location.pathname)
    return Rx.Observable.merge(pushState$, popState$)
      .startWith(location.pathname)
      .distinctUntilChanged()
  }
}
