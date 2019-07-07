// The entry file of your WebAssembly module.
/*

export function add(a: i32, b: i32): i32 {
    return a + b;
}
*/
// import "allocator/tlsf";
// export { memory };

export function addNode(w: i32, h: i32, buffer: Uint8ClampedArray): i32 {
    let v = 0;
    for (let i = 0, k = buffer.length; i < k; ++i) {
        v+= 1
    }

    return buffer.length;
}

// sending img data back: https://github.com/AssemblyScript/assemblyscript/issues/211

/** Performs one step. */
/*
export function step(): void {
    var hm1 = h - 1,
        wm1 = w - 1;
    for (var y: u32 = 0; y < h; ++y) {
        var ym1 = select<u32>(hm1, y - 1, y == 0),
            yp1 = select<u32>(0, y + 1, y == hm1);
        for (var x: u32 = 0; x < w; ++x) {
            var xm1 = select<u32>(wm1, x - 1, x == 0),
                xp1 = select<u32>(0, x + 1, x == wm1);
            var n = (
                load<u8>(ym1 * w + xm1) + load<u8>(ym1 * w + x) + load<u8>(ym1 * w + xp1) +
                load<u8>(y   * w + xm1)                         + load<u8>(y   * w + xp1) +
                load<u8>(yp1 * w + xm1) + load<u8>(yp1 * w + x) + load<u8>(yp1 * w + xp1)
            );
            if (load<u8>(y * w + x)) {
                if (n < 2 || n > 3)
                    store<u8>(s + y * w + x, 0);
            } else if (n == 3)
                store<u8>(s + y * w + x, 1);
        }
    }
}
*/
