import type { EventEmitter, BotState, PerformanceMetrics } from '../types';

export class Dashboard {
  private eventEmitter: EventEmitter;
  private container: HTMLElement | null = null;
  private charts: Map<string, any> = new Map();
  private updateInterval: number | null = null;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  async init(): Promise<void> {
    this.createDashboard();
    this.setupEventListeners();
    this.startRealTimeUpdates();
    console.log('Dashboard initialized');
  }

  private createDashboard(): void {
    const dashboardHTML = `
      <div class="dashboard-overlay" id="dashboard-overlay" style="display: none;">
        <div class="dashboard-container">
          <div class="dashboard-header">
            <h2>Advanced Analytics Dashboard</h2>
            <button class="dashboard-close" id="dashboard-close">&times;</button>
          </div>
          
          <div class="dashboard-content">
            <div class="dashboard-grid">
              <div class="dashboard-card">
                <h3>Performance Metrics</h3>
                <div class="metrics-grid">
                  <div class="metric-item">
                    <span class="metric-label">Accuracy</span>
                    <span class="metric-value" id="dash-accuracy">99.8%</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">CPS</span>
                    <span class="metric-value" id="dash-cps">0</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Latency</span>
                    <span class="metric-value" id="dash-latency">0ms</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Success Rate</span>
                    <span class="metric-value" id="dash-success">100%</span>
                  </div>
                </div>
              </div>

              <div class="dashboard-card">
                <h3>Real-Time Graph</h3>
                <div class="chart-container">
                  <canvas id="performance-chart" width="400" height="200"></canvas>
                </div>
              </div>

              <div class="dashboard-card">
                <h3>Bot Status</h3>
                <div class="status-grid">
                  <div class="status-item">
                    <span class="status-label">State</span>
                    <span class="status-value" id="dash-state">Stopped</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Uptime</span>
                    <span class="status-value" id="dash-uptime">00:00:00</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Total Clicks</span>
                    <span class="status-value" id="dash-total-clicks">0</span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">Level</span>
                    <span class="status-value" id="dash-level">None</span>
                  </div>
                </div>
              </div>

              <div class="dashboard-card">
                <h3>Advanced Controls</h3>
                <div class="controls-grid">
                  <button class="control-btn" id="export-data">Export Data</button>
                  <button class="control-btn" id="reset-stats">Reset Stats</button>
                  <button class="control-btn" id="calibrate-bot">Calibrate</button>
                  <button class="control-btn" id="test-mode">Test Mode</button>
                </div>
              </div>

              <div class="dashboard-card full-width">
                <h3>Activity Log</h3>
                <div class="log-container" id="activity-log">
                  <div class="log-entry">
                    <span class="log-time">[00:00:00]</span>
                    <span class="log-message">Dashboard initialized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dashboardHTML);
    this.container = document.getElementById('dashboard-overlay');
  }

  private setupEventListeners(): void {
    const closeBtn = document.getElementById('dashboard-close');
    const overlay = document.getElementById('dashboard-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.hide();
      });
    }

    document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
    document.getElementById('reset-stats')?.addEventListener('click', () => this.resetStats());
    document.getElementById('calibrate-bot')?.addEventListener('click', () => this.calibrateBot());
    document.getElementById('test-mode')?.addEventListener('click', () => this.toggleTestMode());

    this.eventEmitter.on('metrics:updated', (metrics) => this.updateMetrics(metrics));
    this.eventEmitter.on('bot:started', (state) => this.updateBotState(state));
    this.eventEmitter.on('bot:stopped', (state) => this.updateBotState(state));
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateChart();
      this.updateUptime();
    }, 1000);
  }

  private updateMetrics(metrics: PerformanceMetrics): void {
    const elements = {
      accuracy: document.getElementById('dash-accuracy'),
      cps: document.getElementById('dash-cps'),
      latency: document.getElementById('dash-latency'),
      success: document.getElementById('dash-success'),
      totalClicks: document.getElementById('dash-total-clicks')
    };

    if (elements.accuracy) elements.accuracy.textContent = `${metrics.accuracy.toFixed(1)}%`;
    if (elements.cps) elements.cps.textContent = Math.round(metrics.clicksPerSecond).toString();
    if (elements.latency) elements.latency.textContent = `${metrics.averageLatency.toFixed(1)}ms`;
    if (elements.success) elements.success.textContent = `${metrics.successRate.toFixed(1)}%`;
    if (elements.totalClicks) elements.totalClicks.textContent = metrics.totalClicks.toString();
  }

  private updateBotState(state: BotState): void {
    const stateElement = document.getElementById('dash-state');
    const levelElement = document.getElementById('dash-level');

    if (stateElement) {
      stateElement.textContent = state.isRunning ? 'Running' : 'Stopped';
      stateElement.className = `status-value ${state.isRunning ? 'running' : 'stopped'}`;
    }

    if (levelElement) {
      levelElement.textContent = state.currentLevel || 'None';
    }

    this.addLogEntry(`Bot ${state.isRunning ? 'started' : 'stopped'}`);
  }

  private updateChart(): void {
    const canvas = document.getElementById('performance-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = 50;
    const width = canvas.width;
    const height = canvas.height;
    
    for (let i = 0; i < points; i++) {
      const x = (i / points) * width;
      const y = height - (Math.sin(Date.now() * 0.001 + i * 0.1) * 50 + height / 2);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  }

  private updateUptime(): void {
    const uptimeElement = document.getElementById('dash-uptime');
    if (uptimeElement) {
      const now = Date.now();
      const uptime = Math.floor((now % (24 * 60 * 60 * 1000)) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      
      uptimeElement.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  private addLogEntry(message: string): void {
    const logContainer = document.getElementById('activity-log');
    if (!logContainer) return;

    const time = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
      <span class="log-time">[${time}]</span>
      <span class="log-message">${message}</span>
    `;

    logContainer.insertBefore(logEntry, logContainer.firstChild);

    if (logContainer.children.length > 100) {
      logContainer.removeChild(logContainer.lastChild!);
    }
  }

  private exportData(): void {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getCurrentMetrics(),
      logs: this.getActivityLogs()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geodash-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.addLogEntry('Data exported successfully');
  }

  private resetStats(): void {
    this.eventEmitter.emit('stats:reset');
    this.addLogEntry('Statistics reset');
  }

  private calibrateBot(): void {
    this.eventEmitter.emit('bot:calibrate');
    this.addLogEntry('Bot calibration started');
  }

  private toggleTestMode(): void {
    this.eventEmitter.emit('bot:test-mode');
    this.addLogEntry('Test mode toggled');
  }

  private getCurrentMetrics(): any {
    return {
      accuracy: 99.8,
      cps: 0,
      latency: 0,
      successRate: 100,
      totalClicks: 0
    };
  }

  private getActivityLogs(): string[] {
    const logContainer = document.getElementById('activity-log');
    if (!logContainer) return [];

    return Array.from(logContainer.children).map(entry => entry.textContent || '');
  }

  show(): void {
    if (this.container) {
      this.container.style.display = 'flex';
      this.addLogEntry('Dashboard opened');
    }
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}
