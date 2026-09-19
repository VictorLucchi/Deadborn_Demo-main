export class InputManager {
    constructor() {
        this._pendingClear = false;
        this.keys = {};
        this.mousePos = null;
        this._handlers = {};
        this._cameraGetter = null;
    }

    init(canvas, cameraRef) {
        // aceita { current } (React ref) ou { _cameraGetter } definido pelo Game
        this._getCamera = typeof cameraRef === 'function'
            ? cameraRef
            : () => cameraRef.current;

        const IGNORED_KEYS = new Set(["'", 'Enter', 'Escape', 'Tab']);
        this._handlers.keydown = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (!IGNORED_KEYS.has(e.key)) this.keys[key] = true;
        };
        this._handlers.keyup = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            delete this.keys[key];
        };
        this._handlers.blur = () => {
            this.keys = {};
        };
        this._handlers.mousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const cam  = this._cameraGetter ? this._cameraGetter() : this._getCamera();
            this.mousePos = {
                x: Math.floor(e.clientX - rect.left + (cam ? cam.x : 0)),
                y: Math.floor(e.clientY - rect.top  + (cam ? cam.y : 0)),
            };
        };

        window.addEventListener('keydown',   this._handlers.keydown);
        window.addEventListener('keyup',     this._handlers.keyup);
        window.addEventListener('blur',      this._handlers.blur);
        canvas.addEventListener('mousemove', this._handlers.mousemove);
    }

    clearKeys() {
        this._pendingClear = true;
    }

    flush() {
        if (this._pendingClear) {
            this.keys = {};
            this._pendingClear = false;
        }
    }

    destroy(canvas) {
        window.removeEventListener('keydown',   this._handlers.keydown);
        window.removeEventListener('keyup',     this._handlers.keyup);
        window.removeEventListener('blur',      this._handlers.blur);
        canvas.removeEventListener('mousemove', this._handlers.mousemove);
    }
}
