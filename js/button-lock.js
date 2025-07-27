class ButtonLock {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupButtonLocking();
        });
    }

    setupButtonLocking() {
        const buttons = document.querySelectorAll('.btn, .download-btn, .btn-primary, .btn-secondary, a[href]');
        
        buttons.forEach(button => {
            if (button.tagName === 'A' && button.href && !button.href.includes('#')) {
                button.addEventListener('click', (e) => this.handleButtonClick(e, button));
            } else if (button.tagName === 'BUTTON' || button.classList.contains('btn')) {
                button.addEventListener('click', (e) => this.handleButtonClick(e, button));
            }
        });
    }

    handleButtonClick(e, button) {
        if (button.disabled || button.classList.contains('disabled')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        button.disabled = true;
        button.classList.add('disabled');

        setTimeout(() => {
            button.disabled = false;
            button.classList.remove('disabled');
        }, 3000);
    }

    lockButton(button, duration = 3000) {
        if (!button) return;
        
        button.disabled = true;
        button.classList.add('disabled');

        setTimeout(() => {
            button.disabled = false;
            button.classList.remove('disabled');
        }, duration);
    }

    unlockButton(button) {
        if (!button) return;
        
        button.disabled = false;
        button.classList.remove('disabled');
    }
}

window.buttonLock = new ButtonLock(); 