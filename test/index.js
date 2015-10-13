import test from 'tape'
import sinon from 'sinon'
import { Rx } from '@cycle/core'
import {
  makeNavigationDriver,
  makePushStateDriver,
  makeHashChangeDriver
} from '../src'

function setupListeners () {
  global.eventListeners = []
  global.addEventListener = (key, listener) => {
    global.eventListeners[key] = global.eventListeners[key] || []
    global.eventListeners[key].push(listener)
  }
  global.removeEventListener = sinon.spy()
}

function saveOriginals () {
  return {
    history: global.history,
    location: global.location,
    addEventListener: global.addEventListener,
    removeEventListener: global.removeEventListener,
    eventListeners: global.eventListeners,
    onhashchange: global.onhashchange
  }
}

function setupPushState () {
  let originals = saveOriginals()
  global.history = {
    pushState: sinon.spy()
  }
  global.location = {
    pathname: '/current'
  }
  setupListeners()
  return originals
}

function setupHashChange () {
  let originals = saveOriginals()
  global.onhashchange = sinon.spy()
  global.location = {
    hash: '/current'
  }
  setupListeners()
  return originals
}

function teardown (originals) {
  [
    'history',
    'location',
    'addEventListener',
    'removeEventListener',
    'eventListeners',
    'onhashchange'
  ].forEach(key => {
    if (originals[key]) {
      global[key] = originals[key]
    } else {
      delete global[key]
    }
  })
}

test('makeNavigationDriver should return a function', t => {
  let originals = setupPushState()
  let navigationDriver = makeNavigationDriver()
  t.equal(typeof navigationDriver, 'function')
  teardown(originals)
  t.end()
})

test('makeNavigationDriver should return pushStateDriver when available', t => {
  let originals = setupPushState()
  let navigationDriver = makeNavigationDriver()
  let navigate$ = Rx.Observable.just('/home')
  navigationDriver(navigate$)
    .subscribe()
  t.ok(
    history.pushState.calledWith(null, null, '/home'),
    'pushState should be called once'
  )
  teardown(originals)
  t.end()
})

test('makePushStateDriver should return a function', t => {
  let navigationDriver = makePushStateDriver()
  t.equal(typeof navigationDriver, 'function')
  t.end()
})

test('pushStateDriver should respond to popstate', t => {
  let originals = setupPushState()
  let navigationDriver = makePushStateDriver()
  let navigate$ = Rx.Observable.empty()
  let output = []
  navigationDriver(navigate$)
    .take(2)
    .subscribe(
      url => output.push(url),
      t.error,
      () => {
        t.deepEqual(
          output, ['/current', '/home'],
          'should emit on popstate only when it is different from previous')
      }
    )
  t.equal(global.eventListeners.popstate.length, 1, 'should be listening to popstate')
  let popstateListener = global.eventListeners.popstate[0]
  popstateListener({})
  global.location.pathname = '/home'
  popstateListener({})
  teardown(originals)
  t.end()
})

test('makeNavigationDriver should return hashChangeDriver when pushState is not available and onhashchange is', t => {
  let originals = setupHashChange()
  let navigationDriver = makeNavigationDriver()
  let navigate$ = Rx.Observable.just('/home')
  navigationDriver(navigate$)
    .subscribe()
  setTimeout(() => {
    t.equal(location.hash, '/home', 'hash should be set')
    teardown(originals)
    t.end()
  }, 100)
})

test('makeHashChangeDriver should return a function', t => {
  let originals = setupHashChange()
  let navigationDriver = makeHashChangeDriver()
  t.equal(typeof navigationDriver, 'function')
  teardown(originals)
  t.end()
})

test('hashChangeDriver should respond to hashchange', t => {
  let originals = setupHashChange()
  let navigationDriver = makeHashChangeDriver()
  let navigate$ = Rx.Observable.empty()
  let hashchangeEvent = { newUrl: '/home', oldUrl: '/current' }
  let output = []
  navigationDriver(navigate$)
    .take(2)
    .subscribe(
      url => output.push(url),
      t.error,
      () => {
        t.deepEqual(
          output, ['/current', '/home'],
          'should emit on hashchange only when it is different from previous')
      }
    )
  t.equal(global.eventListeners.hashchange.length, 1, 'should be listening to hashchange')
  let hashchangeListener = global.eventListeners.hashchange[0]
  hashchangeListener(hashchangeEvent)
  global.location.hash = '/home'
  hashchangeListener(hashchangeEvent)
  teardown(originals)
  t.end()
})
