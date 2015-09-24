import { Rx } from '@cycle/core'

export function makeURLDriver () {
  return function URLDriver (navigate$) {
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
