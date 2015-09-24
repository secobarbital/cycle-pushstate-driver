import test from 'tape'
import { Rx } from '@cycle/core'
import { makePathDriver } from '../src'

global.history = {
  pushState: () => {}
}
global.location = {
  pathname: '/'
}
global.addEventListener = () => {}
global.removeEventListener = () => {}

test('PathDriver should not duplicate input', t => {
  let pathDriver = makePathDriver()
  const navigate$ = Rx.Observable.of('/', '/foo', '/bar')
  pathDriver(navigate$)
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
