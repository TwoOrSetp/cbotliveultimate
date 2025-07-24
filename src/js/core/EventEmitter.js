class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 100;
        this.debugMode = false;
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const listeners = this.events.get(event);
        if (listeners.length >= this.maxListeners) {
            console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
            return this;
        }
        
        listeners.push(callback);
        
        if (this.debugMode) {
            console.log(`Event listener added: ${event} (${listeners.length} total)`);
        }
        
        return this;
    }

    off(event, callback) {
        if (!this.events.has(event)) {
            return this;
        }
        
        const listeners = this.events.get(event);
        const index = listeners.indexOf(callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            if (listeners.length === 0) {
                this.events.delete(event);
            }
            
            if (this.debugMode) {
                console.log(`Event listener removed: ${event}`);
            }
        }
        
        return this;
    }

    emit(event, data) {
        if (!this.events.has(event)) {
            return this;
        }
        
        const listeners = this.events.get(event);
        const timestamp = performance.now();
        
        if (this.debugMode) {
            console.log(`Emitting event: ${event} with data:`, data);
        }
        
        listeners.forEach(callback => {
            try {
                callback(data, { event, timestamp });
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
        
        return this;
    }

    once(event, callback) {
        const onceWrapper = (data, meta) => {
            callback(data, meta);
            this.off(event, onceWrapper);
        };
        
        return this.on(event, onceWrapper);
    }

    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        
        return this;
    }

    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    eventNames() {
        return Array.from(this.events.keys());
    }

    setMaxListeners(n) {
        this.maxListeners = n;
        return this;
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
        return this;
    }

    pipe(targetEmitter, events = null) {
        const eventsToForward = events || this.eventNames();
        
        eventsToForward.forEach(event => {
            this.on(event, (data, meta) => {
                targetEmitter.emit(event, data);
            });
        });
        
        return this;
    }

    async emitAsync(event, data) {
        if (!this.events.has(event)) {
            return [];
        }
        
        const listeners = this.events.get(event);
        const promises = listeners.map(callback => {
            try {
                return Promise.resolve(callback(data, { event, timestamp: performance.now() }));
            } catch (error) {
                return Promise.reject(error);
            }
        });
        
        return Promise.allSettled(promises);
    }

    getStats() {
        const stats = {
            totalEvents: this.events.size,
            totalListeners: 0,
            events: {}
        };
        
        this.events.forEach((listeners, event) => {
            stats.totalListeners += listeners.length;
            stats.events[event] = listeners.length;
        });
        
        return stats;
    }
}

export { EventEmitter };
