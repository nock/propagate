var test = require('tap').test
var EventEmitter = require('events').EventEmitter
var propagate = require('..')

test('propagates events', t => {
  t.plan(16)
  var ee1 = new EventEmitter()
  var ee2 = new EventEmitter()
  propagate(ee1, ee2)

  ee2.on('event-1', (a, b, c) => {
    t.equal(a, 'a')
    t.equal(b, 'b')
    t.equal(c, undefined)
  })

  ee2.on('event-2', (a, b, c) => {
    t.equal(a, 'c')
    t.equal(b, 'd')
    t.equal(c, undefined)
  })

  t.true(ee1.emit('event-1', 'a', 'b'))
  t.true(ee1.emit('event-1', 'a', 'b'))
  t.true(ee1.emit('event-2', 'c', 'd'))
  t.true(ee1.emit('event-2', 'c', 'd'))
})

test('propagates can end', t => {
  t.plan(3)

  var ee1 = new EventEmitter()
  var ee2 = new EventEmitter()
  var prop = propagate(ee1, ee2)

  ee2.on('event', () => {
    t.ok('true', 'propagated')
  })

  t.true(ee1.emit('event'))
  prop.end()
  t.false(ee1.emit('event'))
})

test('after propagation old one still emits', t => {
  t.plan(4)

  var ee1 = new EventEmitter()
  var ee2 = new EventEmitter()
  var prop = propagate(ee1, ee2)

  ee1.on('event', () => {
    t.ok('true', 'propagated')
  })

  t.true(ee1.emit('event'))
  prop.end()
  t.true(ee1.emit('event'))
})

test('emit on source before destination', t => {
  t.plan(2)

  var source = new EventEmitter()
  var dest = new EventEmitter()

  // Set up test case for "propagate all"
  // `count` should have been incremented by handler on source when handler on dest is invoked
  var count = 0
  propagate(source, dest)
  source.on('event', () => {
    count++
  })
  dest.on('event', () => {
    t.equal(count, 1, 'emit on source first')
  })

  // Emit the events for assertion
  t.true(source.emit('event'))
})

test('is able to propagate only certain events', t => {
  t.plan(6)
  var ee1 = new EventEmitter()
  var ee2 = new EventEmitter()
  // propagate only event-1 and event-2, leaving out
  var p = propagate(['event-1', 'event-2'], ee1, ee2)

  ee2.on('event-1', () => {
    t.ok(true, 'event 1 received')
  })

  ee2.on('event-2', (a, b, c) => {
    t.ok(true, 'event 2 received')
  })

  ee2.on('event-3', (a, b, c) => {
    t.ok(false, 'event 3 should not have been received')
  })

  t.true(ee1.emit('event-1'))
  t.true(ee1.emit('event-2'))
  t.false(ee1.emit('event-3'))

  p.end()

  t.false(ee1.emit('event-1'))
})

test('is able to propagate and map certain events', t => {
  t.plan(6)
  var ee1 = new EventEmitter()
  var ee2 = new EventEmitter()
  // propagate only event-1 and event-2, leaving out
  var p = propagate(
    {
      'event-1': 'other-event-1',
      'event-2': 'other-event-2',
    },
    ee1,
    ee2
  )

  ee2.on('other-event-1', () => {
    t.ok(true, 'event 1 received')
  })

  ee2.on('other-event-2', (a, b, c) => {
    t.ok(true, 'event 2 received')
  })

  ee2.on('event-3', (a, b, c) => {
    t.ok(false, 'event 3 should not have been received')
  })

  t.true(ee1.emit('event-1'))
  t.true(ee1.emit('event-2'))
  t.false(ee1.emit('event-3'))

  p.end()

  t.false(ee1.emit('event-1'))
})
