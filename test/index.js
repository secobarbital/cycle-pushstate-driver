import test from 'tape'
import { Rx } from '@cycle/core'
import { makeURLDriver } from '../src'

global.history = {
  pushState: () => {}
}
global.location = {
  pathname: '/'
}
global.addEventListener = () => {}
global.removeEventListener = () => {}

test('URLDriver should not duplicate input', t => {
  let URLDriver = makeURLDriver()
  const navigate$ = Rx.Observable.of('/', '/foo', '/bar')
  URLDriver(navigate$)
    .take(3)
    .toArray()
    .subscribe(
      urls => {
        t.equal(urls.length, 3)
        t.end()
      },
      t.error
    )
})
