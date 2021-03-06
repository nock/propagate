# propagate

[![npm](https://img.shields.io/npm/v/propagate.svg?style=flat-square)][npmjs]
[![Build Status](https://img.shields.io/travis/nock/propagate/master.svg?style=flat-square)][build]
[![Coverage](https://img.shields.io/coveralls/github/nock/propagate.svg?style=flat-square)][coverage]

[npmjs]: https://www.npmjs.com/package/propagate
[build]: https://travis-ci.org/nock/propagate
[coverage]: https://coveralls.io/github/nock/propagate

Propagate events from one event emitter into another.

## Install

```bash
$ npm install propagate
```

## Propagate

```javascript
const ee1 = new EventEmitter()
const ee2 = new EventEmitter()
propagate(ee1, ee2)

ee2.on('event', function(a, b) {
  console.log('got propagated event', a, b)
})

ee1.emit('event', 'a', 'b')
```

## Unpropagate

You can unpropagate by ending the propagation like this:

```javascript
const ee1 = new EventEmitter()
const ee2 = new EventEmitter()
const p = propagate(ee1, ee2)

// ...

p.end()
```

## Only propagate certain events:

```javascript
const ee1 = new EventEmitter()
const ee2 = new EventEmitter()
const p = propagate(['event1', 'event2'], ee1, ee2)
```

## Propagate certain events as other events:

```javascript
const ee1 = new EventEmitter()
const ee2 = new EventEmitter()
const p = propagate(
  {
    event1: 'other-event1',
    event2: 'other-event2',
  },
  ee1,
  ee2
)
```

# License

MIT
