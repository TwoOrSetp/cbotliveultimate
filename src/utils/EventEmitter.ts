export type EventCallback<T = any> = (data?: T) => void

export interface IEventEmitter {
  on<T = any>(event: string, callback: EventCallback<T>): void
  off<T = any>(event: string, callback: EventCallback<T>): void
  emit<T = any>(event: string, data?: T): void
  once<T = any>(event: string, callback: EventCallback<T>): void
  removeAllListeners(event?: string): void
  listenerCount(event: string): number
  eventNames(): string[]
}

export class EventEmitter implements IEventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map()

  on<T = any>(event: string, callback: EventCallback<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)
  }

  off<T = any>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.events.delete(event)
      }
    }
  }

  emit<T = any>(event: string, data?: T): void {
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

  once<T = any>(event: string, callback: EventCallback<T>): void {
    const onceCallback = (data?: T) => {
      callback(data)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }

  listenerCount(event: string): number {
    const callbacks = this.events.get(event)
    return callbacks ? callbacks.size : 0
  }

  eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0
  }

  getMaxListeners(): number {
    return 10
  }

  setMaxListeners(n: number): this {
    console.warn('setMaxListeners not implemented')
    return this
  }

  prependListener<T = any>(event: string, callback: EventCallback<T>): void {
    this.on(event, callback)
  }

  prependOnceListener<T = any>(event: string, callback: EventCallback<T>): void {
    this.once(event, callback)
  }

  rawListeners(event: string): EventCallback[] {
    const callbacks = this.events.get(event)
    return callbacks ? Array.from(callbacks) : []
  }

  addListener<T = any>(event: string, callback: EventCallback<T>): void {
    this.on(event, callback)
  }

  removeListener<T = any>(event: string, callback: EventCallback<T>): void {
    this.off(event, callback)
  }

  removeAllListenersForEvent(event: string): void {
    this.events.delete(event)
  }

  pipe<T extends EventEmitter>(destination: T): T {
    this.eventNames().forEach(event => {
      this.on(event, (data) => {
        destination.emit(event, data)
      })
    })
    return destination
  }

  destroy(): void {
    this.removeAllListeners()
  }
}
