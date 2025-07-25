export interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  loadTime: number
  renderTime: number
  domNodes: number
  timestamp: number
}

export interface PerformanceConfig {
  enabled: boolean
  sampleInterval: number
  maxSamples: number
  trackMemory: boolean
  trackFPS: boolean
  trackRender: boolean
}

export class PerformanceMonitor {
  private config: PerformanceConfig
  private metrics: PerformanceMetrics[] = []
  private isMonitoring: boolean = false
  private animationId: number | null = null
  private lastFrameTime: number = 0
  private frameCount: number = 0
  private fpsHistory: number[] = []

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleInterval: 1000,
      maxSamples: 100,
      trackMemory: true,
      trackFPS: true,
      trackRender: true,
      ...config
    }
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) return

    console.log('🔍 Performance Monitor initialized')
    this.startMonitoring()
  }

  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastFrameTime = performance.now()
    
    if (this.config.trackFPS) {
      this.startFPSMonitoring()
    }

    setInterval(() => {
      this.collectMetrics()
    }, this.config.sampleInterval)
  }

  stopMonitoring(): void {
    this.isMonitoring = false
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private startFPSMonitoring(): void {
    const measureFPS = (currentTime: number) => {
      if (!this.isMonitoring) return

      this.frameCount++
      const deltaTime = currentTime - this.lastFrameTime

      if (deltaTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / deltaTime)
        this.fpsHistory.push(fps)
        
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift()
        }

        this.frameCount = 0
        this.lastFrameTime = currentTime
      }

      this.animationId = requestAnimationFrame(measureFPS)
    }

    this.animationId = requestAnimationFrame(measureFPS)
  }

  private collectMetrics(): void {
    if (!this.isMonitoring) return

    const metrics: PerformanceMetrics = {
      fps: this.getCurrentFPS(),
      memoryUsage: this.getMemoryUsage(),
      loadTime: this.getLoadTime(),
      renderTime: this.getRenderTime(),
      domNodes: this.getDOMNodeCount(),
      timestamp: Date.now()
    }

    this.metrics.push(metrics)

    if (this.metrics.length > this.config.maxSamples) {
      this.metrics.shift()
    }

    this.analyzePerformance(metrics)
  }

  private getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 0
    return this.fpsHistory[this.fpsHistory.length - 1]
  }

  private getMemoryUsage(): number {
    if (!this.config.trackMemory || !('memory' in performance)) return 0

    const memory = (performance as any).memory
    return memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0
  }

  private getLoadTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation ? navigation.loadEventEnd - navigation.navigationStart : 0
  }

  private getRenderTime(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0
  }

  private getDOMNodeCount(): number {
    return document.querySelectorAll('*').length
  }

  private analyzePerformance(metrics: PerformanceMetrics): void {
    if (metrics.fps < 30) {
      console.warn('⚠️ Low FPS detected:', metrics.fps)
    }

    if (metrics.memoryUsage > 100) {
      console.warn('⚠️ High memory usage:', metrics.memoryUsage, 'MB')
    }

    if (metrics.domNodes > 1000) {
      console.warn('⚠️ High DOM node count:', metrics.domNodes)
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {}

    const totals = this.metrics.reduce((acc, metric) => ({
      fps: acc.fps + metric.fps,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      loadTime: acc.loadTime + metric.loadTime,
      renderTime: acc.renderTime + metric.renderTime,
      domNodes: acc.domNodes + metric.domNodes
    }), { fps: 0, memoryUsage: 0, loadTime: 0, renderTime: 0, domNodes: 0 })

    const count = this.metrics.length

    return {
      fps: Math.round(totals.fps / count),
      memoryUsage: Math.round(totals.memoryUsage / count),
      loadTime: Math.round(totals.loadTime / count),
      renderTime: Math.round(totals.renderTime / count),
      domNodes: Math.round(totals.domNodes / count)
    }
  }

  measureFunction<T>(fn: () => T, name?: string): T {
    const startTime = performance.now()
    const result = fn()
    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(`⏱️ ${name || 'Function'} execution time:`, duration.toFixed(2), 'ms')
    return result
  }

  async measureAsyncFunction<T>(fn: () => Promise<T>, name?: string): Promise<T> {
    const startTime = performance.now()
    const result = await fn()
    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(`⏱️ ${name || 'Async function'} execution time:`, duration.toFixed(2), 'ms')
    return result
  }

  markStart(name: string): void {
    performance.mark(`${name}-start`)
  }

  markEnd(name: string): void {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    if (measure) {
      console.log(`⏱️ ${name}:`, measure.duration.toFixed(2), 'ms')
    }
  }

  getResourceTimings(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  }

  getNavigationTiming(): PerformanceNavigationTiming | null {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    return entries.length > 0 ? entries[0] : null
  }

  getLargestContentfulPaint(): number {
    const entries = performance.getEntriesByType('largest-contentful-paint')
    return entries.length > 0 ? entries[entries.length - 1].startTime : 0
  }

  getFirstInputDelay(): number {
    const entries = performance.getEntriesByType('first-input')
    return entries.length > 0 ? entries[0].processingStart - entries[0].startTime : 0
  }

  getCumulativeLayoutShift(): number {
    const entries = performance.getEntriesByType('layout-shift')
    return entries.reduce((sum, entry) => {
      if (!(entry as any).hadRecentInput) {
        return sum + (entry as any).value
      }
      return sum
    }, 0)
  }

  generateReport(): string {
    const latest = this.getLatestMetrics()
    const average = this.getAverageMetrics()
    const navigation = this.getNavigationTiming()

    let report = '📊 Performance Report\n'
    report += '===================\n\n'

    if (latest) {
      report += 'Current Metrics:\n'
      report += `- FPS: ${latest.fps}\n`
      report += `- Memory: ${latest.memoryUsage} MB\n`
      report += `- DOM Nodes: ${latest.domNodes}\n\n`
    }

    if (Object.keys(average).length > 0) {
      report += 'Average Metrics:\n'
      report += `- FPS: ${average.fps}\n`
      report += `- Memory: ${average.memoryUsage} MB\n`
      report += `- DOM Nodes: ${average.domNodes}\n\n`
    }

    if (navigation) {
      report += 'Navigation Timing:\n'
      report += `- DNS Lookup: ${navigation.domainLookupEnd - navigation.domainLookupStart}ms\n`
      report += `- TCP Connect: ${navigation.connectEnd - navigation.connectStart}ms\n`
      report += `- Request: ${navigation.responseStart - navigation.requestStart}ms\n`
      report += `- Response: ${navigation.responseEnd - navigation.responseStart}ms\n`
      report += `- DOM Loading: ${navigation.domContentLoadedEventEnd - navigation.domLoading}ms\n`
      report += `- Total Load: ${navigation.loadEventEnd - navigation.navigationStart}ms\n`
    }

    return report
  }

  clearMetrics(): void {
    this.metrics = []
    this.fpsHistory = []
  }

  destroy(): void {
    this.stopMonitoring()
    this.clearMetrics()
  }
}
