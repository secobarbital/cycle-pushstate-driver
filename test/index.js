import test from 'tape'
import sinon from 'sinon'
import { Rx } from '@cycle/core'
import { makePushStateDriver, makeHashChangeDriver } from '../src'

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
  const originals = saveOriginals()
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
  const originals = saveOriginals()
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

test('makePushStateDriver should return noopDriver if pushState is not available', t => {
  const driver = makePushStateDriver()
  t.equal(typeof driver, 'function')
  t.equal(driver.name, 'noopDriver')
  t.end()
})

test('makePushStateDriver should return pushStateDriver if pushState is available', t => {
  const originals = setupPushState()
  const driver = makePushStateDriver()
  t.equal(typeof driver, 'function')
  t.equal(driver.name, 'pushStateDriver')
  teardown(originals)
  t.end()
})

test('pushStateDriver should call pushState', t => {
  const originals = setupPushState()
  const driver = makePushStateDriver()
  const navigate$ = Rx.Observable.just('/home')
  driver(navigate$)
    .subscribe()
  t.ok(
    global.history.pushState.calledWith(null, null, '/home'),
    'pushState should be called once'
  )
  teardown(originals)
  t.end()
})

test('pushStateDriver should respond to popstate', t => {
  const originals = setupPushState()
  const driver = makePushStateDriver()
  const navigate$ = Rx.Observable.empty()
  const output = []
  driver(navigate$)
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
  const popstateListener = global.eventListeners.popstate[0]
  popstateListener({})
  global.location.pathname = '/home'
  popstateListener({})
  teardown(originals)
  t.end()
})

test('makeHashChangeDriver should return a function', t => {
  const originals = setupHashChange()
  const driver = makeHashChangeDriver()
  t.equal(typeof driver, 'function')
  teardown(originals)
  t.end()
})

test('makeHashChangeDriver should return noopDriver if onhashchange is not available', t => {
  const driver = makeHashChangeDriver()
  t.equal(typeof driver, 'function')
  t.equal(driver.name, 'noopDriver')
  t.end()
})

test('makeHashChangeDriver should return hashChangeDriver if onhashchange is available', t => {
  const originals = setupHashChange()
  const driver = makeHashChangeDriver()
  t.equal(typeof driver, 'function')
  t.equal(driver.name, 'hashChangeDriver')
  teardown(originals)
  t.end()
})

test('hashChangeDriver should respond to hashchange', t => {
  const originals = setupHashChange()
  const driver = makeHashChangeDriver()
  const navigate$ = Rx.Observable.empty()
  const hashchangeEvent = { newUrl: '/home', oldUrl: '/current' }
  const output = []
  driver(navigate$)
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
  const hashchangeListener = global.eventListeners.hashchange[0]
  hashchangeListener(hashchangeEvent)
  global.location.hash = '/home'
  hashchangeListener(hashchangeEvent)
  teardown(originals)
  t.end()
})
