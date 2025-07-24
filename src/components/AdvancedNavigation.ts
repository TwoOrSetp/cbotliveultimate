import { BaseComponent } from './BaseComponent';
import { NavigationItem, EventBus, Logger } from '@/types';

export class AdvancedNavigation extends BaseComponent {
  private navigationItems: NavigationItem[];
  private mobileMenuOpen: boolean = false;
  private scrollThreshold: number = 100;
  private lastScrollY: number = 0;
  private isScrollingUp: boolean = true;

  constructor(
    element: HTMLElement,
    navigationItems: NavigationItem[],
    eventBus: EventBus,
    logger: Logger
  ) {
    super('advanced-navigation', element, {}, eventBus, logger);
    this.navigationItems = navigationItems;
  }

  protected getDefaultConfig(): Record<string, any> {
    return {
      enableScrollHide: true,
      enableGlassmorphism: true,
      enableParallax: true,
      mobileBreakpoint: 768,
      animationDuration: 300,
      scrollDebounce: 16
    };
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Advanced Navigation');
    
    try {
      this.setupScrollBehavior();
      this.setupMobileMenu();
      this.setupKeyboardNavigation();
      this.setupAccessibility();
      this.render();
      
      this.setState({ isVisible: true });
      this.logger.info('Advanced Navigation initialized successfully');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public render(): void {
    this.element.innerHTML = this.generateNavigationHTML();
    this.attachEventListeners();
    this.updateActiveStates();
    this.applyGlassmorphism();
  }

  protected async performUpdate(data: { items?: NavigationItem[] }): Promise<void> {
    if (data.items) {
      this.navigationItems = data.items;
      this.render();
    }
  }

  private generateNavigationHTML(): string {
    return `
      <nav class="advanced-nav" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
          <div class="nav-brand">
            <div class="brand-icon">
              <svg class="brand-logo" viewBox="0 0 32 32" aria-hidden="true">
                <defs>
                  <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4a9eff"/>
                    <stop offset="100%" style="stop-color:#ffffff"/>
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="url(#brandGradient)" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="#1e3a8a" font-family="Arial" font-size="10" font-weight="bold">GD</text>
              </svg>
            </div>
            <h1 class="brand-text" data-text="GeoDash">
              <span class="brand-text-inner"></span>
            </h1>
          </div>

          <div class="nav-menu" role="menubar">
            ${this.generateMenuItems()}
          </div>

          <div class="nav-actions">
            <button class="theme-toggle" aria-label="Toggle theme" data-tooltip="Switch theme">
              <svg class="theme-icon" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
              </svg>
            </button>
            
            <button class="mobile-menu-toggle" aria-label="Toggle mobile menu" aria-expanded="false">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
          </div>
        </div>

        <div class="mobile-menu" role="menu" aria-hidden="true">
          <div class="mobile-menu-content">
            ${this.generateMobileMenuItems()}
          </div>
        </div>

        <div class="nav-progress-bar"></div>
      </nav>
    `;
  }

  private generateMenuItems(): string {
    return this.navigationItems.map(item => `
      <div class="nav-item ${item.isActive ? 'active' : ''}" role="none">
        <a href="${item.href}" 
           class="nav-link" 
           role="menuitem"
           data-nav-item="${item.id}"
           ${item.isDisabled ? 'aria-disabled="true"' : ''}
           data-tooltip="${item.label}">
          ${item.icon ? `<i class="nav-icon ${item.icon}" aria-hidden="true"></i>` : ''}
          <span class="nav-text">${item.label}</span>
          ${item.badge ? `<span class="nav-badge" aria-label="${item.badge} notifications">${item.badge}</span>` : ''}
          <div class="nav-ripple"></div>
          <div class="nav-glow"></div>
        </a>
        ${item.children ? this.generateSubmenu(item.children) : ''}
      </div>
    `).join('');
  }

  private generateSubmenu(items: NavigationItem[]): string {
    return `
      <div class="nav-submenu" role="menu">
        ${items.map(item => `
          <a href="${item.href}" 
             class="nav-submenu-link" 
             role="menuitem"
             data-nav-item="${item.id}">
            ${item.icon ? `<i class="nav-icon ${item.icon}"></i>` : ''}
            ${item.label}
          </a>
        `).join('')}
      </div>
    `;
  }

  private generateMobileMenuItems(): string {
    return this.navigationItems.map(item => `
      <div class="mobile-nav-item">
        <a href="${item.href}" class="mobile-nav-link" data-nav-item="${item.id}">
          ${item.icon ? `<i class="nav-icon ${item.icon}"></i>` : ''}
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </a>
      </div>
    `).join('');
  }

  private attachEventListeners(): void {
    // Mobile menu toggle
    const mobileToggle = this.query<HTMLButtonElement>('.mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Theme toggle
    const themeToggle = this.query<HTMLButtonElement>('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Navigation links
    this.queryAll<HTMLAnchorElement>('.nav-link, .mobile-nav-link').forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e, link));
      link.addEventListener('mouseenter', () => this.handleNavHover(link));
      link.addEventListener('mouseleave', () => this.handleNavLeave(link));
    });

    // Ripple effects
    this.queryAll<HTMLElement>('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => this.createRippleEffect(e, link));
    });
  }

  private setupScrollBehavior(): void {
    if (!this.config.enableScrollHide) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private updateScrollState(): void {
    const currentScrollY = window.scrollY;
    this.isScrollingUp = currentScrollY < this.lastScrollY;
    
    // Hide/show navigation based on scroll direction
    if (currentScrollY > this.scrollThreshold) {
      this.toggleClass('nav-hidden', !this.isScrollingUp);
    } else {
      this.removeClass('nav-hidden');
    }

    // Update progress bar
    this.updateProgressBar();
    
    // Apply glassmorphism based on scroll
    this.updateGlassmorphism(currentScrollY);
    
    this.lastScrollY = currentScrollY;
  }

  private updateProgressBar(): void {
    const progressBar = this.query<HTMLElement>('.nav-progress-bar');
    if (!progressBar) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (window.scrollY / scrollHeight) * 100;
    
    progressBar.style.transform = `scaleX(${scrollProgress / 100})`;
  }

  private updateGlassmorphism(scrollY: number): void {
    if (!this.config.enableGlassmorphism) return;

    const opacity = Math.min(scrollY / 200, 0.95);
    const blur = Math.min(scrollY / 10, 20);
    
    this.setStyle('--nav-bg-opacity', opacity.toString());
    this.setStyle('--nav-blur', `${blur}px`);
  }

  private applyGlassmorphism(): void {
    this.addClass('glassmorphism');
  }

  private toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    const mobileMenu = this.query<HTMLElement>('.mobile-menu');
    const toggle = this.query<HTMLButtonElement>('.mobile-menu-toggle');
    
    if (mobileMenu && toggle) {
      this.toggleClass('mobile-menu-open');
      mobileMenu.setAttribute('aria-hidden', (!this.mobileMenuOpen).toString());
      toggle.setAttribute('aria-expanded', this.mobileMenuOpen.toString());
      
      if (this.mobileMenuOpen) {
        this.createAnimation([
          { opacity: 0, transform: 'translateY(-20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: this.config.animationDuration });
      }
    }
  }

  private toggleTheme(): void {
    this.eventBus.emit('theme:toggle');
  }

  private handleNavClick(event: Event, link: HTMLAnchorElement): void {
    const navItem = link.dataset.navItem;
    if (navItem) {
      this.updateActiveStates(navItem);
      this.eventBus.emit('navigation:click', { item: navItem, href: link.href });
    }
  }

  private handleNavHover(link: HTMLAnchorElement): void {
    const glow = link.querySelector('.nav-glow') as HTMLElement;
    if (glow) {
      glow.style.opacity = '1';
    }
  }

  private handleNavLeave(link: HTMLAnchorElement): void {
    const glow = link.querySelector('.nav-glow') as HTMLElement;
    if (glow) {
      glow.style.opacity = '0';
    }
  }

  private createRippleEffect(event: MouseEvent, element: HTMLElement): void {
    const ripple = element.querySelector('.nav-ripple') as HTMLElement;
    if (!ripple) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-active');

    setTimeout(() => {
      ripple.classList.remove('ripple-active');
    }, 600);
  }

  private updateActiveStates(activeItemId?: string): void {
    this.queryAll<HTMLElement>('.nav-item').forEach(item => {
      const link = item.querySelector('.nav-link') as HTMLAnchorElement;
      const isActive = activeItemId ? 
        link?.dataset.navItem === activeItemId : 
        window.location.pathname === link?.getAttribute('href');
      
      item.classList.toggle('active', isActive);
    });
  }

  private setupKeyboardNavigation(): void {
    this.element.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.mobileMenuOpen) {
        this.toggleMobileMenu();
      }
    });
  }

  private setupAccessibility(): void {
    // Add ARIA labels and roles
    this.element.setAttribute('role', 'banner');
    
    // Focus management
    const focusableElements = this.queryAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach((element, index) => {
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
          // Custom tab navigation logic if needed
        }
      });
    });
  }
}
