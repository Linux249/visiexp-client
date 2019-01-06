function toHex(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return '00';
    n = Math.max(0, Math.min(n, 255));
    return '0123456789ABCDEF'.charAt((n - (n % 16)) / 16) + '0123456789ABCDEF'.charAt(n % 16);
}

export function rgbToHex(R, G, B) {
    return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

function cutHex(h) {
    return h.charAt(0) === '#' ? h.substring(1, 7) : h;
}

export function hexToR(h) {
    return parseInt(cutHex(h)
        .substring(0, 2), 16);
}

export function hexToG(h) {
    return parseInt(cutHex(h)
        .substring(2, 4), 16);
}

export function hexToB(h) {
    return parseInt(cutHex(h)
        .substring(4, 6), 16);
}

/*

Die Farben benötigen verschiedene Formate. Das Input gibt die Farbe in Hex(Link zu was Hex ist) form zurück (Specification vom Input Feld).
Dei "Draw()" Funktion benötigt aber die RGB Farben. DAher

 */
