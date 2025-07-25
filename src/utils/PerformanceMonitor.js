export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      memory: 0,
      loadTime: 0,
      renderTime: 0
    }
    this.isMonitoring = false
    this.frameCount = 0
    this.lastTime = performance.now()
    this.observers = []
  }

  async initialize() {
    this.startTime = performance.now()
    this.setupObservers()
  }

  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.monitorFPS()
    this.monitorMemory()
    this.monitorPerformance()
  }

  stopMonitoring() {
    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  pauseMonitoring() {
    this.isMonitoring = false
  }

  resumeMonitoring() {
    this.isMonitoring = true
    this.monitorFPS()
  }

  monitorFPS() {
    if (!this.isMonitoring) return

    const now = performance.now()
    this.frameCount++

    if (now - this.lastTime >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.frameCount = 0
      this.lastTime = now
    }

    requestAnimationFrame(() => this.monitorFPS())
  }

  monitorMemory() {
    if (!this.isMonitoring) return

    if (performance.memory) {
      this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1048576) // MB
    }

    setTimeout(() => this.monitorMemory(), 1000)
  }

  monitorPerformance() {
    if (!this.isMonitoring) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          this.metrics.loadTime = entry.loadEventEnd - entry.loadEventStart
        } else if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.renderTime = entry.startTime
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['navigation', 'paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Performance observer not supported:', error)
    }
  }

  setupObservers() {
    // Long task observer
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration + 'ms')
          }
        })
      })
      
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (error) {
      console.warn('Long task observer not supported')
    }

    // Layout shift observer
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.value > 0.1) {
            console.warn('Layout shift detected:', entry.value)
          }
        })
      })
      
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(layoutShiftObserver)
    } catch (error) {
      console.warn('Layout shift observer not supported')
    }
  }

  setupMetrics() {
    this.createMetricsDisplay()
  }

  createMetricsDisplay() {
    if (document.getElementById('performance-metrics')) return

    const metricsDiv = document.createElement('div')
    metricsDiv.id = 'performance-metrics'
    metricsDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      display: none;
    `
    
    document.body.appendChild(metricsDiv)
    this.updateMetricsDisplay()
  }

  updateMetricsDisplay() {
    const metricsDiv = document.getElementById('performance-metrics')
    if (!metricsDiv) return

    metricsDiv.innerHTML = `
      FPS: ${this.metrics.fps}<br>
      Memory: ${this.metrics.memory} MB<br>
      Load Time: ${this.metrics.loadTime.toFixed(2)} ms<br>
      Render Time: ${this.metrics.renderTime.toFixed(2)} ms
    `

    if (this.isMonitoring) {
      setTimeout(() => this.updateMetricsDisplay(), 1000)
    }
  }

  showMetrics() {
    const metricsDiv = document.getElementById('performance-metrics')
    if (metricsDiv) {
      metricsDiv.style.display = 'block'
    }
  }

  hideMetrics() {
    const metricsDiv = document.getElementById('performance-metrics')
    if (metricsDiv) {
      metricsDiv.style.display = 'none'
    }
  }

  getMetrics() {
    return { ...this.metrics }
  }

  measureFunction(fn, name) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  }

  async measureAsyncFunction(fn, name) {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  }

  markStart(name) {
    performance.mark(`${name}-start`)
  }

  markEnd(name) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name)[0]
    console.log(`${name} took ${measure.duration} milliseconds`)
  }

  getNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0]
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart
    }
  }

  getResourceTiming() {
    return performance.getEntriesByType('resource').map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize
    }))
  }

  clearMetrics() {
    performance.clearMarks()
    performance.clearMeasures()
  }

  isSupported() {
    return 'performance' in window && 'PerformanceObserver' in window
  }

  generateReport() {
    return {
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      navigation: this.getNavigationTiming(),
      resources: this.getResourceTiming(),
      userAgent: navigator.userAgent
    }
  }

  cleanup() {
    this.stopMonitoring()
    const metricsDiv = document.getElementById('performance-metrics')
    if (metricsDiv) {
      metricsDiv.remove()
    }
  }
}
