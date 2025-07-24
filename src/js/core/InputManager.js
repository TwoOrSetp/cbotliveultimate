import { EventEmitter } from './EventEmitter.js';

class InputManager extends EventEmitter {
    constructor() {
        super();
        this.keys = new Map();
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Set(),
            wheel: 0
        };
        
        this.touch = {
            active: false,
            touches: new Map(),
            gestures: {
                swipe: null,
                pinch: null,
                tap: null
            }
        };
        
        this.gamepad = {
            connected: false,
            controllers: new Map(),
            deadzone: 0.1
        };
        
        this.automation = {
            enabled: false,
            sequence: [],
            currentIndex: 0,
            startTime: 0,
            recording: false,
            recordedInputs: []
        };
        
        this.config = {
            preventDefaults: true,
            enableGamepad: true,
            enableTouch: true,
            sensitivity: 1.0,
            autoRepeat: false
        };
        
        this.init();
    }

    init() {
        this.setupKeyboardListeners();
        this.setupMouseListeners();
        this.setupTouchListeners();
        this.setupGamepadListeners();
        this.startInputLoop();
        
        console.log('🎮 InputManager initialized');
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('keypress', (e) => this.handleKeyPress(e));
    }

    setupMouseListeners() {
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        document.addEventListener('contextmenu', (e) => {
            if (this.config.preventDefaults) e.preventDefault();
        });
    }

    setupTouchListeners() {
        if (!this.config.enableTouch) return;
        
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        document.addEventListener('touchcancel', (e) => this.handleTouchCancel(e));
    }

    setupGamepadListeners() {
        if (!this.config.enableGamepad) return;
        
        window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));
    }

    handleKeyDown(e) {
        if (this.config.preventDefaults && this.shouldPreventDefault(e.code)) {
            e.preventDefault();
        }
        
        const keyData = {
            code: e.code,
            key: e.key,
            timestamp: performance.now(),
            repeat: e.repeat,
            modifiers: {
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey
            }
        };
        
        this.keys.set(e.code, keyData);
        this.recordInput('keydown', keyData);
        this.emit('key:down', keyData);
        
        this.handleSpecialKeys(keyData);
    }

    handleKeyUp(e) {
        const keyData = {
            code: e.code,
            key: e.key,
            timestamp: performance.now(),
            modifiers: {
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey
            }
        };
        
        this.keys.delete(e.code);
        this.recordInput('keyup', keyData);
        this.emit('key:up', keyData);
    }

    handleKeyPress(e) {
        const keyData = {
            code: e.code,
            key: e.key,
            char: e.char,
            timestamp: performance.now()
        };
        
        this.emit('key:press', keyData);
    }

    handleMouseDown(e) {
        const mouseData = {
            button: e.button,
            x: e.clientX,
            y: e.clientY,
            timestamp: performance.now(),
            modifiers: {
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey
            }
        };
        
        this.mouse.buttons.add(e.button);
        this.recordInput('mousedown', mouseData);
        this.emit('mouse:down', mouseData);
    }

    handleMouseUp(e) {
        const mouseData = {
            button: e.button,
            x: e.clientX,
            y: e.clientY,
            timestamp: performance.now(),
            modifiers: {
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey
            }
        };
        
        this.mouse.buttons.delete(e.button);
        this.recordInput('mouseup', mouseData);
        this.emit('mouse:up', mouseData);
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        const mouseData = {
            x: e.clientX,
            y: e.clientY,
            movementX: e.movementX,
            movementY: e.movementY,
            timestamp: performance.now()
        };
        
        this.emit('mouse:move', mouseData);
    }

    handleMouseWheel(e) {
        this.mouse.wheel = e.deltaY;
        
        const wheelData = {
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaZ: e.deltaZ,
            timestamp: performance.now()
        };
        
        this.emit('mouse:wheel', wheelData);
    }

    handleTouchStart(e) {
        if (this.config.preventDefaults) e.preventDefault();
        
        this.touch.active = true;
        
        Array.from(e.changedTouches).forEach(touch => {
            const touchData = {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                force: touch.force || 1,
                timestamp: performance.now()
            };
            
            this.touch.touches.set(touch.identifier, touchData);
            this.emit('touch:start', touchData);
        });
    }

    handleTouchMove(e) {
        if (this.config.preventDefaults) e.preventDefault();
        
        Array.from(e.changedTouches).forEach(touch => {
            const touchData = {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                force: touch.force || 1,
                timestamp: performance.now()
            };
            
            this.touch.touches.set(touch.identifier, touchData);
            this.emit('touch:move', touchData);
        });
    }

    handleTouchEnd(e) {
        Array.from(e.changedTouches).forEach(touch => {
            const touchData = this.touch.touches.get(touch.identifier);
            if (touchData) {
                touchData.endTime = performance.now();
                this.touch.touches.delete(touch.identifier);
                this.emit('touch:end', touchData);
            }
        });
        
        if (this.touch.touches.size === 0) {
            this.touch.active = false;
        }
    }

    handleTouchCancel(e) {
        Array.from(e.changedTouches).forEach(touch => {
            this.touch.touches.delete(touch.identifier);
        });
        
        if (this.touch.touches.size === 0) {
            this.touch.active = false;
        }
        
        this.emit('touch:cancel', e);
    }

    handleGamepadConnected(e) {
        this.gamepad.connected = true;
        this.gamepad.controllers.set(e.gamepad.index, e.gamepad);
        this.emit('gamepad:connected', e.gamepad);
    }

    handleGamepadDisconnected(e) {
        this.gamepad.controllers.delete(e.gamepad.index);
        
        if (this.gamepad.controllers.size === 0) {
            this.gamepad.connected = false;
        }
        
        this.emit('gamepad:disconnected', e.gamepad);
    }

    startInputLoop() {
        const updateGamepads = () => {
            if (this.gamepad.connected) {
                const gamepads = navigator.getGamepads();
                
                for (let i = 0; i < gamepads.length; i++) {
                    const gamepad = gamepads[i];
                    if (gamepad) {
                        this.processGamepadInput(gamepad);
                    }
                }
            }
            
            if (this.automation.enabled) {
                this.processAutomation();
            }
            
            requestAnimationFrame(updateGamepads);
        };
        
        updateGamepads();
    }

    processGamepadInput(gamepad) {
        const gamepadData = {
            id: gamepad.id,
            index: gamepad.index,
            buttons: gamepad.buttons.map((button, index) => ({
                index,
                pressed: button.pressed,
                value: button.value
            })),
            axes: gamepad.axes.map((value, index) => ({
                index,
                value: Math.abs(value) > this.gamepad.deadzone ? value : 0
            })),
            timestamp: performance.now()
        };
        
        this.emit('gamepad:input', gamepadData);
    }

    shouldPreventDefault(code) {
        const preventKeys = [
            'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Tab', 'F1', 'F2', 'F3', 'F4', 'F5', 'F11', 'F12'
        ];
        
        return preventKeys.includes(code);
    }

    handleSpecialKeys(keyData) {
        switch (keyData.code) {
            case 'Space':
                this.emit('game:jump');
                break;
            case 'KeyR':
                if (keyData.modifiers.ctrl) {
                    this.emit('game:restart');
                }
                break;
            case 'KeyP':
                this.emit('game:pause');
                break;
            case 'Escape':
                this.emit('game:menu');
                break;
        }
    }

    recordInput(type, data) {
        if (!this.automation.recording) return;
        
        this.automation.recordedInputs.push({
            type,
            data,
            timestamp: performance.now() - this.automation.startTime
        });
    }

    startRecording() {
        this.automation.recording = true;
        this.automation.recordedInputs = [];
        this.automation.startTime = performance.now();
        this.emit('recording:started');
    }

    stopRecording() {
        this.automation.recording = false;
        this.emit('recording:stopped', this.automation.recordedInputs);
        return this.automation.recordedInputs;
    }

    playSequence(sequence) {
        this.automation.sequence = sequence;
        this.automation.currentIndex = 0;
        this.automation.enabled = true;
        this.automation.startTime = performance.now();
        this.emit('automation:started');
    }

    stopAutomation() {
        this.automation.enabled = false;
        this.automation.sequence = [];
        this.automation.currentIndex = 0;
        this.emit('automation:stopped');
    }

    processAutomation() {
        if (!this.automation.enabled || this.automation.sequence.length === 0) return;
        
        const currentTime = performance.now() - this.automation.startTime;
        const currentInput = this.automation.sequence[this.automation.currentIndex];
        
        if (currentInput && currentTime >= currentInput.timestamp) {
            this.emit(currentInput.type, currentInput.data);
            this.automation.currentIndex++;
            
            if (this.automation.currentIndex >= this.automation.sequence.length) {
                this.stopAutomation();
            }
        }
    }

    isKeyPressed(code) {
        return this.keys.has(code);
    }

    isMouseButtonPressed(button) {
        return this.mouse.buttons.has(button);
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    getTouchCount() {
        return this.touch.touches.size;
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.emit('config:updated', this.config);
    }
}

export { InputManager };
