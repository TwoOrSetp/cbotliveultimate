export interface ClickbotConfig {
  clickDelay: number;
  randomization: number;
  autoStart: boolean;
  stealthMode: boolean;
  maxCPS: number;
  precision: number;
}

export interface ClickEvent {
  timestamp: number;
  x: number;
  y: number;
  button: 'left' | 'right' | 'middle';
  pressure?: number;
}

export interface PerformanceMetrics {
  accuracy: number;
  averageLatency: number;
  clicksPerSecond: number;
  totalClicks: number;
  successRate: number;
}

export interface BotState {
  isRunning: boolean;
  isPaused: boolean;
  currentLevel: string;
  startTime: number;
  elapsedTime: number;
  metrics: PerformanceMetrics;
}

export interface GeometryDashLevel {
  id: string;
  name: string;
  difficulty: number;
  length: number;
  obstacles: Obstacle[];
  timing: TimingData[];
}

export interface Obstacle {
  type: 'spike' | 'block' | 'saw' | 'portal' | 'orb';
  position: Position;
  timing: number;
  size: Size;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TimingData {
  timestamp: number;
  action: 'click' | 'hold' | 'release';
  duration?: number;
}

export interface LoadingState {
  progress: number;
  status: string;
  isComplete: boolean;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
}

export interface TypingAnimationConfig extends AnimationConfig {
  text: string;
  speed: number;
  cursor: boolean;
}

export interface ParticleConfig {
  count: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  success: string;
  warning: string;
  error: string;
}

export type EventCallback<T = any> = (data: T) => void;

export interface EventEmitter {
  on<T>(event: string, callback: EventCallback<T>): void;
  off<T>(event: string, callback: EventCallback<T>): void;
  emit<T>(event: string, data?: T): void;
}

export interface ClickbotAPI {
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  configure(config: Partial<ClickbotConfig>): void;
  getMetrics(): PerformanceMetrics;
  getState(): BotState;
}

export interface WebGLRenderer {
  canvas: HTMLCanvasElement;
  context: WebGLRenderingContext;
  render(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

export interface AudioManager {
  playSound(id: string, volume?: number): void;
  stopSound(id: string): void;
  setMasterVolume(volume: number): void;
  loadSound(id: string, url: string): Promise<void>;
}

export interface InputManager {
  isKeyPressed(key: string): boolean;
  isMousePressed(button: number): boolean;
  getMousePosition(): Position;
  onKeyDown(callback: (key: string) => void): void;
  onKeyUp(callback: (key: string) => void): void;
  onMouseDown(callback: (button: number, position: Position) => void): void;
  onMouseUp(callback: (button: number, position: Position) => void): void;
}

export interface StorageManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export interface NetworkManager {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
  put<T>(url: string, data: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface AdvancedClickbotFeatures {
  patternRecognition: boolean;
  adaptiveTiming: boolean;
  machineLearning: boolean;
  predictiveClicking: boolean;
  humanBehaviorSimulation: boolean;
}

export interface MLModel {
  train(data: ClickEvent[]): Promise<void>;
  predict(input: any): Promise<number>;
  evaluate(testData: ClickEvent[]): Promise<number>;
  save(): Promise<void>;
  load(): Promise<void>;
}

export interface PatternAnalyzer {
  analyzeLevel(level: GeometryDashLevel): Promise<TimingData[]>;
  optimizeClicks(clicks: ClickEvent[]): ClickEvent[];
  detectPatterns(data: number[]): Pattern[];
}

export interface Pattern {
  type: string;
  confidence: number;
  data: number[];
  timing: number[];
}

export interface AdvancedAlgorithms {
  neuralNetwork: MLModel;
  patternAnalyzer: PatternAnalyzer;
  timingOptimizer: TimingOptimizer;
  behaviorSimulator: BehaviorSimulator;
}

export interface TimingOptimizer {
  optimizeDelay(baseDelay: number, context: any): number;
  calculatePrecision(targetTime: number): number;
  adjustForLatency(timing: number, latency: number): number;
}

export interface BehaviorSimulator {
  generateHumanLikeDelay(): number;
  simulateMouseMovement(from: Position, to: Position): Position[];
  addRandomness(value: number, variance: number): number;
}

export interface ClickbotEngine {
  config: ClickbotConfig;
  state: BotState;
  algorithms: AdvancedAlgorithms;
  api: ClickbotAPI;
  eventEmitter: EventEmitter;
}
