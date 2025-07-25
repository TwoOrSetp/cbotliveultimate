export interface LoadingState {
  progress: number
  status: string
  isComplete: boolean
  error?: string
}

export interface LoadingStep {
  progress: number
  status: string
  delay: number
}

export class LoadingManager {
  private state: LoadingState = {
    progress: 0,
    status: 'Initializing...',
    isComplete: false
  }

  private callbacks: Set<(state: LoadingState) => void> = new Set()

  constructor() {
    this.init()
  }

  private init(): void {
    console.log('LoadingManager initialized')
  }

  updateProgress(progress: number, status?: string): void {
    this.state.progress = Math.max(0, Math.min(100, progress))
    if (status) {
      this.state.status = status
    }
    
    if (this.state.progress >= 100) {
      this.state.isComplete = true
    }

    this.notifyCallbacks()
  }

  setError(error: string): void {
    this.state.error = error
    this.notifyCallbacks()
  }

  getState(): LoadingState {
    return { ...this.state }
  }

  onStateChange(callback: (state: LoadingState) => void): void {
    this.callbacks.add(callback)
  }

  offStateChange(callback: (state: LoadingState) => void): void {
    this.callbacks.delete(callback)
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.getState())
      } catch (error) {
        console.error('Error in loading state callback:', error)
      }
    })
  }

  reset(): void {
    this.state = {
      progress: 0,
      status: 'Initializing...',
      isComplete: false
    }
    this.notifyCallbacks()
  }

  async simulateLoading(steps: LoadingStep[]): Promise<void> {
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay))
      this.updateProgress(step.progress, step.status)
    }
  }

  async loadResource(url: string, onProgress?: (progress: number) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response)
        } else {
          reject(new Error(`Failed to load resource: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'))
      })

      xhr.open('GET', url)
      xhr.send()
    })
  }

  async loadMultipleResources(
    resources: Array<{ url: string; weight?: number }>,
    onProgress?: (progress: number) => void
  ): Promise<any[]> {
    const totalWeight = resources.reduce((sum, resource) => sum + (resource.weight || 1), 0)
    let loadedWeight = 0
    const results: any[] = []

    for (const resource of resources) {
      const weight = resource.weight || 1
      
      try {
        const result = await this.loadResource(resource.url, (resourceProgress) => {
          const currentProgress = (loadedWeight + (resourceProgress / 100) * weight) / totalWeight * 100
          if (onProgress) {
            onProgress(currentProgress)
          }
        })
        
        results.push(result)
        loadedWeight += weight
        
        if (onProgress) {
          onProgress((loadedWeight / totalWeight) * 100)
        }
      } catch (error) {
        console.error(`Failed to load resource ${resource.url}:`, error)
        results.push(null)
        loadedWeight += weight
      }
    }

    return results
  }

  createProgressBar(container: HTMLElement): HTMLElement {
    const progressBar = document.createElement('div')
    progressBar.className = 'loading-progress-bar'
    progressBar.innerHTML = `
      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>
      <div class="progress-text">0%</div>
    `

    const progressFill = progressBar.querySelector('.progress-fill') as HTMLElement
    const progressText = progressBar.querySelector('.progress-text') as HTMLElement

    this.onStateChange((state) => {
      if (progressFill) {
        progressFill.style.width = `${state.progress}%`
      }
      if (progressText) {
        progressText.textContent = `${Math.round(state.progress)}%`
      }
    })

    container.appendChild(progressBar)
    return progressBar
  }

  async preloadImages(imageUrls: string[]): Promise<HTMLImageElement[]> {
    const images: HTMLImageElement[] = []
    let loadedCount = 0

    const loadPromises = imageUrls.map((url, index) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        
        img.onload = () => {
          loadedCount++
          const progress = (loadedCount / imageUrls.length) * 100
          this.updateProgress(progress, `Loading images... ${loadedCount}/${imageUrls.length}`)
          resolve(img)
        }
        
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`)
          loadedCount++
          const progress = (loadedCount / imageUrls.length) * 100
          this.updateProgress(progress, `Loading images... ${loadedCount}/${imageUrls.length}`)
          reject(new Error(`Failed to load image: ${url}`))
        }
        
        img.src = url
      })
    })

    try {
      const loadedImages = await Promise.allSettled(loadPromises)
      loadedImages.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          images[index] = result.value
        } else {
          console.error(`Image ${index} failed to load:`, result.reason)
        }
      })
    } catch (error) {
      console.error('Error preloading images:', error)
    }

    return images
  }

  async waitForFonts(): Promise<void> {
    if (!('fonts' in document)) {
      return Promise.resolve()
    }

    try {
      await document.fonts.ready
      this.updateProgress(100, 'Fonts loaded')
    } catch (error) {
      console.error('Error loading fonts:', error)
    }
  }

  async waitForDOMContentLoaded(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve())
      } else {
        resolve()
      }
    })
  }

  async waitForWindowLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve()
      } else {
        window.addEventListener('load', () => resolve())
      }
    })
  }

  destroy(): void {
    this.callbacks.clear()
  }
}
