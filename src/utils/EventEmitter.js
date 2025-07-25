export class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(callback)
  }

  off(event, callback) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.events.delete(event)
      }
    }
  }

  emit(event, data) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error)
        }
      })
    }
  }

  once(event, callback) {
    const onceCallback = (data) => {
      callback(data)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }

  listenerCount(event) {
    const callbacks = this.events.get(event)
    return callbacks ? callbacks.size : 0
  }

  eventNames() {
    return Array.from(this.events.keys())
  }

  hasListeners(event) {
    return this.listenerCount(event) > 0
  }

  getMaxListeners() {
    return 10
  }

  setMaxListeners(n) {
    console.warn('setMaxListeners not implemented')
    return this
  }

  prependListener(event, callback) {
    this.on(event, callback)
  }

  prependOnceListener(event, callback) {
    this.once(event, callback)
  }

  rawListeners(event) {
    const callbacks = this.events.get(event)
    return callbacks ? Array.from(callbacks) : []
  }

  addListener(event, callback) {
    this.on(event, callback)
  }

  removeListener(event, callback) {
    this.off(event, callback)
  }

  removeAllListenersForEvent(event) {
    this.events.delete(event)
  }

  pipe(destination) {
    this.eventNames().forEach(event => {
      this.on(event, (data) => {
        destination.emit(event, data)
      })
    })
    return destination
  }

  destroy() {
    this.removeAllListeners()
  }

  getListenerCount() {
    let total = 0
    this.events.forEach(callbacks => {
      total += callbacks.size
    })
    return total
  }
}
