export interface ModAsset {
  id: string;
  name: string;
  path: string;
  type: 'jpg' | 'png' | 'webp' | 'svg';
  priority: number;
  source: 'discovered' | 'generated-fallback' | 'preloaded';
  metadata?: {
    size?: number;
    dimensions?: { width: number; height: number };
    lastModified?: Date;
    category?: 'visual' | 'gameplay' | 'audio' | 'utility';
  };
}

export interface IconAsset {
  id: string;
  name: string;
  path: string;
  type: 'svg' | 'png';
  category: 'navigation' | 'feature' | 'social' | 'utility';
}

export interface LoadingProgress {
  current: number;
  total: number;
  percentage: number;
  stage: 'initializing' | 'assets' | 'scripts' | 'fonts' | 'finalizing';
  message: string;
  errors: string[];
}

export interface TypewriterConfig {
  speed: number;
  delay: number;
  cursor: boolean;
  cursorChar: string;
  loop: boolean;
  deleteSpeed: number;
  pauseTime: number;
  variableSpeed: boolean;
  soundEnabled: boolean;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
  iterations: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface ComponentState {
  isVisible: boolean;
  isLoading: boolean;
  isAnimating: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  fps: number;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  connectionSpeed: 'fast' | 'slow' | 'offline';
}

export interface UIComponent {
  id: string;
  element: HTMLElement;
  state: ComponentState;
  config: Record<string, any>;
  initialize(): Promise<void>;
  render(): void;
  destroy(): void;
  update(data: any): void;
}

export interface EventBus {
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
}

export interface ModuleManager {
  register(name: string, module: any): void;
  get<T>(name: string): T;
  initialize(): Promise<void>;
  destroy(): void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  featured: boolean;
  comingSoon?: boolean;
}

export interface BackgroundEffect {
  id: string;
  type: 'star' | 'meteor' | 'particle' | 'wave';
  element: HTMLElement;
  config: Record<string, any>;
  isActive: boolean;
}

export interface GlassCard {
  blur: number;
  opacity: number;
  border: string;
  shadow: string;
  gradient?: string;
}

export interface AdvancedButton {
  variant: 'primary' | 'secondary' | 'ghost' | 'outline';
  size: 'small' | 'medium' | 'large';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'loading';
  icon?: string;
  badge?: string | number;
  ripple: boolean;
}

export interface ParticleSystem {
  count: number;
  speed: number;
  size: { min: number; max: number };
  color: string[];
  opacity: { min: number; max: number };
  lifetime: number;
  gravity: number;
  wind: number;
}

export interface AudioConfig {
  enabled: boolean;
  volume: number;
  effects: {
    hover: string;
    click: string;
    typewriter: string;
    notification: string;
  };
}

export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}
