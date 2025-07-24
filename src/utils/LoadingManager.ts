import type { LoadingState } from '../types';

export class LoadingManager {
  private state: LoadingState = {
    progress: 0,
    status: 'Initializing...',
    isComplete: false
  };

  private callbacks: Set<(state: LoadingState) => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    console.log('LoadingManager initialized');
  }

  updateProgress(progress: number, status?: string): void {
    this.state.progress = Math.max(0, Math.min(100, progress));
    if (status) {
      this.state.status = status;
    }
    
    if (this.state.progress >= 100) {
      this.state.isComplete = true;
    }

    this.notifyCallbacks();
  }

  getState(): LoadingState {
    return { ...this.state };
  }

  onStateChange(callback: (state: LoadingState) => void): void {
    this.callbacks.add(callback);
  }

  offStateChange(callback: (state: LoadingState) => void): void {
    this.callbacks.delete(callback);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.getState());
      } catch (error) {
        console.error('Error in loading state callback:', error);
      }
    });
  }

  reset(): void {
    this.state = {
      progress: 0,
      status: 'Initializing...',
      isComplete: false
    };
    this.notifyCallbacks();
  }

  async simulateLoading(steps: Array<{ progress: number; status: string; delay: number }>): Promise<void> {
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      this.updateProgress(step.progress, step.status);
    }
  }
}
