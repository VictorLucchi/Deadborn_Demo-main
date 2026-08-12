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
            if (e.key !== "'") this.keys[e.key] = true;
        };
        this._handlers.keyup = (e) => {
            this.keys[e.key] = false;
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

    destroy(canvas) {
        window.removeEventListener('keydown',   this._handlers.keydown);
        window.removeEventListener('keyup',     this._handlers.keyup);
        canvas.removeEventListener('mousemove', this._handlers.mousemove);
    }
}
