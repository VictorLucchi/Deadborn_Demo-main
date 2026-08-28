export class InputManager {
    constructor() {
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

        this._handlers.keydown = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (key !== "'") this.keys[key] = true;
        };
        this._handlers.keyup = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            this.keys[key] = false;
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
        canvas.addEventListener('mousemove', this._handlers.mousemove);
    }

    clearKeys() {
        this.keys = {};
    }

    destroy(canvas) {
        window.removeEventListener('keydown',   this._handlers.keydown);
        window.removeEventListener('keyup',     this._handlers.keyup);
        canvas.removeEventListener('mousemove', this._handlers.mousemove);
    }
}
