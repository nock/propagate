'use strict'

function propagateKeyedEvents(keyedEventNames, source, dest) {
  const keyedListeners = {}
  Object.entries(keyedEventNames).forEach(([srcEventName, dstEventName]) => {
    keyedListeners[srcEventName] = (...args) => {
      dest.emit(dstEventName, ...args)
    }
  })

  Object.entries(keyedListeners).forEach(([srcEventName, listener]) => {
    source.on(srcEventName, listener)
  })

  return {
    end() {
      Object.entries(keyedListeners).forEach(([srcEventName, listener]) => {
        source.removeListener(srcEventName, listener)
      })
    },
  }
}

function propagateAllEvents(source, dest) {
  const oldEmit = source.emit

  // Returns true if the event had listeners, false otherwise.
  // https://nodejs.org/api/events.html#events_emitter_emit_eventname_args
  source.emit = (eventName, ...args) => {
    const oldEmitHadListeners = oldEmit.call(source, eventName, ...args)
    const destEmitHadListeners = dest.emit(eventName, ...args)
    return oldEmitHadListeners || destEmitHadListeners
  }

  return {
    end() {
      source.emit = oldEmit
    },
  }
}

module.exports = function propagate(events, source, dest) {
  if (arguments.length < 3) {
    dest = source
    source = events
    events = undefined
  }

  if (events === undefined) {
    return propagateAllEvents(source, dest)
  }

  let keyedEventNames
  if (Array.isArray(events)) {
    keyedEventNames = {}
    events.forEach(eventName => {
      keyedEventNames[eventName] = eventName
    })
  } else if (typeof events === 'object') {
    keyedEventNames = events
  } else {
    const eventName = events
    keyedEventNames = { [eventName]: eventName }
  }

  return propagateKeyedEvents(keyedEventNames, source, dest)
}
