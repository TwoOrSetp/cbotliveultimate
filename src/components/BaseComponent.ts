import { UIComponent, ComponentState, EventBus, Logger } from '@/types';

export abstract class BaseComponent implements UIComponent {
  public readonly id: string;
  public element: HTMLElement;
  public state: ComponentState;
  public config: Record<string, any>;
  
  protected eventBus: EventBus;
  protected logger: Logger;
  protected observers: Map<string, IntersectionObserver | ResizeObserver | MutationObserver>;
  protected animations: Map<string, Animation>;
  protected timers: Map<string, number>;

  constructor(
    id: string,
    element: HTMLElement,
    config: Record<string, any> = {},
    eventBus: EventBus,
    logger: Logger
  ) {
    this.id = id;
    this.element = element;
    this.config = { ...this.getDefaultConfig(), ...config };
    this.eventBus = eventBus;
    this.logger = logger;
    
    this.state = {
      isVisible: false,
      isLoading: false,
      isAnimating: false,
      hasError: false
    };

    this.observers = new Map();
    this.animations = new Map();
    this.timers = new Map();

    this.setupBaseEventListeners();
    this.logger.debug(`Component ${this.id} created`, { config: this.config });
  }

  protected abstract getDefaultConfig(): Record<string, any>;
  
  public abstract initialize(): Promise<void>;
  public abstract render(): void;

  public async update(data: any): Promise<void> {
    this.logger.debug(`Updating component ${this.id}`, data);
    
    try {
      this.setState({ isLoading: true });
      await this.performUpdate(data);
      this.setState({ isLoading: false });
      this.eventBus.emit(`${this.id}:updated`, data);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  protected abstract performUpdate(data: any): Promise<void>;

  public destroy(): void {
    this.logger.debug(`Destroying component ${this.id}`);
    
    // Clear all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Cancel all animations
    this.animations.forEach(animation => animation.cancel());
    this.animations.clear();
    
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // Remove event listeners
    this.removeEventListeners();
    
    // Remove from DOM if needed
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.eventBus.emit(`${this.id}:destroyed`);
  }

  protected setState(newState: Partial<ComponentState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    this.onStateChange(oldState, this.state);
    this.eventBus.emit(`${this.id}:stateChanged`, { oldState, newState: this.state });
  }

  protected onStateChange(oldState: ComponentState, newState: ComponentState): void {
    // Update CSS classes based on state
    this.element.classList.toggle('is-visible', newState.isVisible);
    this.element.classList.toggle('is-loading', newState.isLoading);
    this.element.classList.toggle('is-animating', newState.isAnimating);
    this.element.classList.toggle('has-error', newState.hasError);
  }

  protected handleError(error: Error): void {
    this.logger.error(`Error in component ${this.id}`, error);
    this.setState({ 
      hasError: true, 
      errorMessage: error.message,
      isLoading: false,
      isAnimating: false
    });
    this.eventBus.emit(`${this.id}:error`, error);
  }

  protected createIntersectionObserver(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });
    
    const observerId = `intersection_${Date.now()}`;
    this.observers.set(observerId, observer);
    
    return observer;
  }

  protected createAnimation(
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
    name?: string
  ): Animation {
    const animation = this.element.animate(keyframes, {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards',
      ...options
    });

    const animationId = name || `animation_${Date.now()}`;
    this.animations.set(animationId, animation);

    animation.addEventListener('finish', () => {
      this.animations.delete(animationId);
      this.setState({ isAnimating: false });
    });

    this.setState({ isAnimating: true });
    return animation;
  }

  protected createTimer(callback: () => void, delay: number, name?: string): number {
    const timer = window.setTimeout(() => {
      callback();
      if (name) {
        this.timers.delete(name);
      }
    }, delay);

    const timerId = name || `timer_${Date.now()}`;
    this.timers.set(timerId, timer);

    return timer;
  }

  protected setupBaseEventListeners(): void {
    // Visibility change detection
    const visibilityObserver = this.createIntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.setState({ isVisible: entry.isIntersecting });
        if (entry.isIntersecting) {
          this.onVisible();
        } else {
          this.onHidden();
        }
      });
    });

    visibilityObserver.observe(this.element);
  }

  protected onVisible(): void {
    this.eventBus.emit(`${this.id}:visible`);
  }

  protected onHidden(): void {
    this.eventBus.emit(`${this.id}:hidden`);
  }

  protected removeEventListeners(): void {
    // Override in subclasses to remove specific event listeners
  }

  protected addClass(...classes: string[]): void {
    this.element.classList.add(...classes);
  }

  protected removeClass(...classes: string[]): void {
    this.element.classList.remove(...classes);
  }

  protected toggleClass(className: string, force?: boolean): void {
    this.element.classList.toggle(className, force);
  }

  protected hasClass(className: string): boolean {
    return this.element.classList.contains(className);
  }

  protected setStyle(property: string, value: string): void {
    this.element.style.setProperty(property, value);
  }

  protected getStyle(property: string): string {
    return getComputedStyle(this.element).getPropertyValue(property);
  }

  protected createElement<T extends HTMLElement>(
    tag: string,
    className?: string,
    attributes?: Record<string, string>
  ): T {
    const element = document.createElement(tag) as T;
    
    if (className) {
      element.className = className;
    }
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    return element;
  }

  protected query<T extends HTMLElement>(selector: string): T | null {
    return this.element.querySelector(selector) as T | null;
  }

  protected queryAll<T extends HTMLElement>(selector: string): NodeListOf<T> {
    return this.element.querySelectorAll(selector) as NodeListOf<T>;
  }
}
