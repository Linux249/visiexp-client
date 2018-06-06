

if (typeof module !== 'undefined') module.exports = Simpleheat;

function Simpleheat(canvas) {
    // warum wird die Funktion auf instanceof sich selbst getestet, wann ist sie dass denn nicht?
    if (!(this instanceof Simpleheat)) return new Simpleheat(canvas);

    // macht so nur sinn, wenn this.canvas auf die referenc von canvas gesetzt wird und diese nochmal geändert wird,
    // wenn canvas ein string ist
    // Frage: Welche zuweisung passiert eigentlich zuerst
    // refrences zum canvas für späteren zugriff speichern
    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    // referenz zum 2d context
    this._ctx = canvas.getContext('2d');
    // canvas weite
    this._width = canvas.width;
    // canvas höhe
    this._height = canvas.height;

    // FRAGE: Was/wofütr ist max?
    // default von max = 1
    this._max = 1;
    // default von data
    this._data = [];
}

Simpleheat.prototype = {

    defaultRadius: 25,

    defaultGradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red',
    },

    // setter for new data
    data(data) {
        this._data = data;
        return this;
    },

    // set new max
    max(max) {
        this._max = max;
        return this;
    },

    // add a new point to data
    add(point) {
        this._data.push(point);
        return this;
    },

    // clear data
    clear() {
        this._data = [];
        return this;
    },

    // setter for radius and blur
    // radius und blur werden zu r2 addiert und ich _r gespeichert
    radius(radius, blur) {
        blur = blur === undefined ? 15 : blur;

        // create a grayscale blurred circle image that we'll use for drawing points
        let circle = this._circle = this._createCanvas(),
            ctx = circle.getContext('2d'),
            r2 = this._r = radius + blur;

        // größe des canvas ist 2x(radius + blur)
        circle.width = circle.height = r2 * 2;

        // der schattenabstand ist zweimal radius + blur und damit gleich der größe des canvas (?)
        ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
        ctx.shadowBlur = blur;
        ctx.shadowColor = 'black';

        ctx.beginPath();
        // void ctx.arc(x, y, radius, startAngle, endAngle [, anticlockwise]);
        // der Mittelpunkt des Kreises ist
        ctx.arc(-r2, -r2, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        return this;
    },

    resize() {
        this._width = this._canvas.width;
        this._height = this._canvas.height;
    },

    gradient(grad) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        // die zwei vektoren definieren zum einem dem Bereich von volle Farbe bis weiß und dazu die richtung
        let canvas = this._createCanvas(),
            ctx = canvas.getContext('2d');
        gradient = ctx.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        for (const i in grad) {
            gradient.addColorStop(+i, grad[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        this._grad = ctx.getImageData(0, 0, 1, 256).data;

        return this;
    },

    draw(minOpacity) {
        if (!this._circle) this.radius(this.defaultRadius);
        if (!this._grad) this.gradient(this.defaultGradient);

        const ctx = this._ctx;

        ctx.clearRect(0, 0, this._width, this._height);

        // draw a grayscale heatmap by putting a blurred circle at each data point
        for (var i = 0, len = this._data.length, p; i < len; i++) {
            p = this._data[i];
            // p[2] ist der value und max scheint zum mitteln der WErte zu sein.
            ctx.globalAlpha = Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity);
            // es wird der Kreis abzüglich von _r = r + b gezeichnet?
            ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
        }

        // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
        const colored = ctx.getImageData(0, 0, this._width, this._height);
        this._colorize(colored.data, this._grad);
        ctx.putImageData(colored, 0, 0);

        return this;
    },

    _colorize(pixels, gradient) {
        for (var i = 0, len = pixels.length, j; i < len; i += 4) {
            // mit i = 0, i += 4 wird jeder 4. erste pixel betrachtet (rot wert?)
            // dann wird der pixelwert 3 bits weiter, also A (RGBA) betrachtet und mit 4 multipliziert (why?)
            j = pixels[i + 3] * 4; // get gradient color from opacity value

            // j wird benutzt um im gradient die werte zu finden und diese auf das eigentliche Bild zu schreiben
            if (j) {
                pixels[i] = gradient[j];
                pixels[i + 1] = gradient[j + 1];
                pixels[i + 2] = gradient[j + 2];
            }
        }
    },

    _createCanvas() {
        // in nodejs gibt es kein document - weiter unten ist der fallback
        if (typeof document !== 'undefined') {
            return document.createElement('canvas');
        }
        // create a new canvas instance in node.js
        // the canvas class needs to have a default constructor without any parameter
        return new this._canvas.constructor();
    },
};
