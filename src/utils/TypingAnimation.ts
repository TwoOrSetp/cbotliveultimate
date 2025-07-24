import type { TypingAnimationConfig } from '../types';

export class TypingAnimation {
  private activeAnimations: Map<HTMLElement, { cancel: () => void }> = new Map();

  animate(element: HTMLElement, text: string, config: Partial<TypingAnimationConfig> = {}): Promise<void> {
    const defaultConfig: TypingAnimationConfig = {
      text,
      speed: 50,
      cursor: true,
      duration: text.length * 50,
      easing: 'ease-out',
      delay: 0
    };

    const finalConfig = { ...defaultConfig, ...config };

    if (this.activeAnimations.has(element)) {
      this.activeAnimations.get(element)!.cancel();
    }

    return new Promise((resolve) => {
      let currentIndex = 0;
      let isAnimating = true;

      const cancel = () => {
        isAnimating = false;
        this.activeAnimations.delete(element);
      };

      this.activeAnimations.set(element, { cancel });

      const typeNextCharacter = () => {
        if (!isAnimating) {
          resolve();
          return;
        }

        if (currentIndex <= text.length) {
          const currentText = text.substring(0, currentIndex);
          const cursor = finalConfig.cursor && currentIndex < text.length ? '|' : '';
          element.textContent = currentText + cursor;
          currentIndex++;

          if (currentIndex <= text.length) {
            setTimeout(typeNextCharacter, finalConfig.speed);
          } else {
            if (finalConfig.cursor) {
              this.startCursorBlink(element);
            }
            this.activeAnimations.delete(element);
            resolve();
          }
        }
      };

      setTimeout(() => {
        if (isAnimating) {
          typeNextCharacter();
        }
      }, finalConfig.delay);
    });
  }

  private startCursorBlink(element: HTMLElement): void {
    const originalText = element.textContent?.replace('|', '') || '';
    let showCursor = true;

    const blink = () => {
      if (this.activeAnimations.has(element)) {
        element.textContent = originalText + (showCursor ? '|' : '');
        showCursor = !showCursor;
        setTimeout(blink, 500);
      }
    };

    blink();
  }

  stop(element: HTMLElement): void {
    const animation = this.activeAnimations.get(element);
    if (animation) {
      animation.cancel();
    }
  }

  stopAll(): void {
    this.activeAnimations.forEach(animation => animation.cancel());
    this.activeAnimations.clear();
  }

  async typeMultiple(elements: Array<{ element: HTMLElement; text: string; config?: Partial<TypingAnimationConfig> }>): Promise<void> {
    const promises = elements.map(({ element, text, config }) => 
      this.animate(element, text, config)
    );
    
    await Promise.all(promises);
  }

  async typeSequential(elements: Array<{ element: HTMLElement; text: string; config?: Partial<TypingAnimationConfig> }>): Promise<void> {
    for (const { element, text, config } of elements) {
      await this.animate(element, text, config);
    }
  }

  isAnimating(element: HTMLElement): boolean {
    return this.activeAnimations.has(element);
  }

  getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }
}
