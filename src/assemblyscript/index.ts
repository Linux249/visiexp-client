// declare function sayHello(): void;

// sayHello();
// declare namespace console {
//     export function log1(val: i32): u32;
// }
//
// also you can do this
@external('env', 'log1')
declare function log(val: f64): f64;

//namespace console {
//  export declare function log(int: u32): void;
//}


class Pic {
    public size: u32;

    constructor(
        public w: u8,
        public h: u8,
        public ptr: usize // max 2,147,483,647
    ) {
        this.size = 4 * w * h;
    }
}

class State {
    public nodes: Node[] = new Array<Node>();
    public size: u32;
    public imgMemoryPtr: usize;
    public scale: u32 = 20;
    public zoom: u8 = 0;
    public tx: i32;
    public ty: i32;

    constructor(public count: u32, public canvasW: u32, public canvasH: u32, public pixelStart: u32, public hitMapStart: u32) {
        //todo add size
        this.imgMemoryPtr = pixelStart + 4 * (canvasW * canvasH);
        this.tx = Math.ceil(canvasW / 2) as i32;
        this.ty = Math.ceil(canvasH / 2) as i32;
    }

    public get length(): u32 {
        return this.nodes.length;
    }

    // add a new node to the state and return actuly state size
    public addNode(x: f64, y: f64, id: u32): u32 {
        this.count += 1;
        // console.log1(this.count)
        // log(this.count)
        // // log(w)
        // // log(h)
        // log(ptr)
        // log(x)
        // log(y)
        const node: Node = new Node(x, y, id);
        // this.nodes.push(new Node(w, h, ptr));
        this.nodes.push(node);
        // log(node.x)
        // log(node.y)

        return 1;
        //return 0;
    }

    public getCheckSum(x: u32): u32 {
        return this.nodes[x].checkSum();
    }

    public draw(): u32 {
        for (let i: u32 = this.pixelStart, size: u32 = this.imgMemoryPtr; i < size; i++) {
            store<u8>(i, <i32>0);
        }

        let s: u32 = 0;
        for (let x: u32 = 0; x < this.count; x++) {
            // s += this.nodes[x].checkSum()
            // s += this.nodes[x].x
            // s += this.nodes[x].y
            // s += this.nodes[x].w
            // s += this.nodes[x].h
            s += this.nodes[x].draw();
        }
        // return this.checkOutArray()
        return this.imgMemoryPtr;
    }

    public clear(): u32 {
        // for (let i: u32 = this.pixelStart, size: u32 = this.imgMemoryPtr; i < size; ++i) {
        //     store<u8>(i, <i32>0);
        // }
        return this.pixelStart;
    }

    public checkOutArray(): u32 {
        // let c = 0;

        let v: u32 = 0;
        for (let i: u32 = this.pixelStart, size: u32 = this.imgMemoryPtr; i < size; ++i) {
            // store<u8>(i + 2, 1)
            v += load<u8>(i);
        }

        return v;
    }
}

let state: State;

class Node {
    //imgByteSize:  u32
    public pics: Pic[] = new Array<Pic>();

    constructor(
        // public w: u8,
        // public h: u8,
        // public ptr: u32,    // max 2,147,483,647
        public x: f64,
        public y: f64,
        public id: u32
    ) {
        // this.imgByteSize =
    }

    // get imgByteSize(): u32 {
    //     return 4 * this.w * this.h
    // }

    public addPic(w: u8, h: u8, ptr: usize): u32 {
        const pic: Pic = new Pic(w, h, ptr);
        this.pics.push(pic);
        return ptr;
    }

    // public checkSum(): u32 {
    //     let v: u32 = 0;
    //     log(this.imgByteSize)
    //     for (let i: u32 = 0, k: u32 = this.imgByteSize; i < k; ++i) {
    //         v += load<u8>(i + this.ptr);
    //     }
    //     return v;
    // }

    public draw(): u32 {
        // my start of pixel in buffer

        // const size: u32 = state.imgMemoryPtr;
        // let i: u32 = 0;
        // log(state.scale)
        // log(state.tx)
        // log(state.ty)
        // log(this.x)
        // log(this.y)
        const x = Math.floor(this.x * state.scale + state.tx);
        const y = Math.floor(this.y * state.scale + state.ty);
        const w = this.pics[state.zoom].w;
        const h = this.pics[state.zoom].h;
        const ptr = this.pics[state.zoom].ptr;
        if (!this.id) {
            log(state.scale);
            log(state.tx);
            log(state.ty);
            log(x);
            log(y);
        }
        if (x < 0 || y < 0) return -1;
        if (x + w > state.canvasW || y + h > state.canvasH) return -1;

        const startPixel = state.pixelStart + (((y as u32) * state.canvasW + x) as u32) * 4;
        // log(startPixel)
        // loop through each row
        for (let r: u32 = 0; r < h; r += 1) {
            for (let c: u32 = 0; c < w; c += 1) {
                // loop through each column/field

                // in pixel
                // #rows have each w pixel, 1 pixel 4 bytes, pixelStart is start
                // const p: u32 = (r * this.w + c) * 4 + pixelStart

                // out pixel
                // const o: u32 = state.pixelStart + (this.y*state.canvasW + this.x) * 4
                // state.count += 1
                const outPixel: u32 = startPixel + (r * state.canvasW + c) * 4;
                const inPixel: u32 = 4 * (r * w + c) + ptr;
                store<u32>(outPixel, load<u32>(inPixel));
                // const v = load<u8>(inPixel)
                // if(r === c)log(outPixel)
                // if(r === c)log(v)
                // store<u8>(outPixel, v)
                // store<u8>((outPixel + 1), load<u8>(inPixel + 1 ))
                // store<u8>((outPixel + 2), load<u8>(inPixel + 2 ))
                // store<u8>((outPixel + 3), load<u8>(inPixel + 3 ))

                // i++
            }
        }

        return 1;
    }
}

// add a node extern, later export class State and use diretly
export function addNode(x: f64, y: f64, id: u32): u32 {
    log(x);
    log(y);
    const test = Math.round(x * 1000000) / 1000000;
    const test2 = Math.round(y * 1000000) / 1000000;
    log(test);
    log(test2);
    // log(<f64><u32>y)
    // log(y as u32)
    return state.addNode(test, test2, id);
}

export function addPic(id: u32, w: u8, h: u8, ptr: usize): u32 {
    // log(<f64><u32>y)
    // log(y as u32)
    return state.nodes[id].addPic(w, h, ptr);
}

// checksum of node x
export function checkSum(x: u32): u32 {
    return state.checkOutArray();
    // return state.nodes[x].checkSum()
}

// checksum of node x
export function count(): u32 {
    return state.length;
}

export function init(count: u32, canvasW: u32, canvasH: u32, pixelStart: u32, hitMapStart: u32): number {
    // create state
    state = new State(count, canvasW, canvasH, pixelStart, hitMapStart);

    return state.pixelStart;
}

// checksum of node x
export function draw(): u32 {
    return state.draw();
}

// clear array
export function clear(): u32 {
    return state.clear();
}

// pages of memory
export function memorySize(): u32 {
    return memory.size();
}

// get to x, y for checking what happens with negativ und longer ints
export function getNodeXY(n: u32): u32 {
    // return state.tx + state.ty;
    return (state.nodes[n].x + state.nodes[n].y) as u32;
}

export function setScale(s: u32): u32 {
    state.scale = s;
    log(state.scale);
    return state.scale;
}

export function setTxTy(tx: u32, ty: u32): u32 {
    state.tx = tx;
    state.ty = ty;
    log(state.tx);
    log(state.ty);
    return state.tx + state.ty;
}

export function setZoom(z: u8): u8 {
    state.zoom = z < 10 ? z : 9;
    log(state.zoom);
    return state.zoom;
}

export function addTxTy(tx: i32, ty: i32): u32 {
    state.tx += tx;
    state.ty += ty;
    log(state.tx);
    log(state.ty);
    return state.tx + state.ty;
}
