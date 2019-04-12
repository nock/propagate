function propagate(events, source, dest) {
  if (arguments.length < 3) {
    dest = source
    source = events
    events = undefined
  }

  // events should be an array or object
  var eventsIsObject = typeof events === 'object'
  if (events && !eventsIsObject) events = [events]

  if (eventsIsObject) {
    return explicitPropagate(events, source, dest)
  }

  var oldEmit = source.emit

  // Returns true if the event had listeners, false otherwise.
  // https://nodejs.org/api/events.html#events_emitter_emit_eventname_args
  source.emit = (eventName, ...args) => {
    let oldHandled = oldEmit.call(source, eventName, ...args)

    let destHandled = false
    if (events === undefined || events.includes(eventName)) {
      destHandled = dest.emit.call(dest, eventName, ...args)
    }

    return oldHandled || destHandled
  }

  function end() {
    source.emit = oldEmit
  }

  return {
    end: end,
  }
}

module.exports = propagate

function explicitPropagate(events, source, dest) {
  var eventsIn
  var eventsOut
  if (Array.isArray(events)) {
    eventsIn = events
    eventsOut = events
  } else {
    eventsIn = Object.keys(events)
    eventsOut = eventsIn.map(function(key) {
      return events[key]
    })
  }

  var listeners = eventsOut.map(function(event) {
    return function() {
      var args = Array.prototype.slice.call(arguments)
      args.unshift(event)
      dest.emit.apply(dest, args)
    }
  })

  listeners.forEach(register)

  return {
    end: end,
  }

  function register(listener, i) {
    source.on(eventsIn[i], listener)
  }

  function unregister(listener, i) {
    source.removeListener(eventsIn[i], listener)
  }

  function end() {
    listeners.forEach(unregister)
  }
}
