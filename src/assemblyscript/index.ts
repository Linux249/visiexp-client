// declare function sayHello(): void;

// sayHello();
// declare namespace console {
//     export function log1(val: i32): u32;
// }
//
// also you can do this
@external("env", "log1")
declare function log(val: f64): f64;

//namespace console {
//  export declare function log(int: u32): void;
//}


// GEIL - Beliebig viele Knoten pushen°!
// TODO
// 1. Init mit out array verbinden,


/*
  MEMORY:
  [offset] free memory, 400
  [size] out pixel buffer = canvasW * vanvsH * 4
  [imgBytes] each node hat a ptr to his pixels
*/

class State {
    public nodes: Node[] = new Array<Node>();
    public size: u32;
    public imgMemoryPtr: u32;
    public scale: u32 = 20;
    public tx: u32;
    public ty: u32;

    constructor(
        public count: u32,
        public canvasW: u32,
        public canvasH: u32,
        public offset: u32,
    ) {
        //todo add size
        this.imgMemoryPtr = offset + (4 *  (canvasW * canvasH));
        this.tx = Math.ceil(canvasW / 2) as u32;
        this.ty = Math.ceil(canvasH / 2) as u32;
    }

    public get length(): u32 {
        return this.nodes.length;
    }

    // add a new node to the state and return actuly state size
    public addNode(w: u8, h: u8, ptr: u32, x: f64, y: f64): u32 {

        this.count += 1;
        // console.log1(this.count)
        log(this.count)
        // log(w)
        // log(h)
        log(ptr)
        log(x)
        log(y)
        const node: Node = new Node(w, h, ptr, x, y);
        // this.nodes.push(new Node(w, h, ptr));
        this.nodes.push(node)
        log(node.x)
        log(node.y)

        return 1;
        //return 0;
    }

    public getCheckSum(x: u32): u32 {
        return this.nodes[x].checkSum()
    }


    public draw(): u32 {
        for (let i: u32 = this.offset, size: u32 = this.imgMemoryPtr; i < size; i++) {
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
        // for (let i: u32 = this.offset, size: u32 = this.imgMemoryPtr; i < size; ++i) {
        //     store<u8>(i, <i32>0);
        // }
        return this.offset;
    }

    public checkOutArray(): u32 {
        // let c = 0;

        let v: u32 = 0;
        for (let i: u32 = this.offset, size: u32 = this.imgMemoryPtr; i < size; ++i) {
            // store<u8>(i + 2, 1)
            v += load<u8>(i);
        }

        return v;

    }

}

let state: State;

class Node {
    //imgByteSize:  u32
    constructor(
        public w: u8,
        public h: u8,
        public ptr: u32,    // max 2,147,483,647
        public x: f64,
        public y: f64,
    ) {
        // this.imgByteSize =
    }

    get imgByteSize(): u32 {
        return 4 * this.w * this.h
    }



    public checkSum(): u32 {
        let v: u32 = 0;
        for (let i: u32 = 0, k = this.imgByteSize; i < k; ++i) {
            v += load<u8>(i + this.ptr);
        };
        return v;
    }

    public draw(): u32 {
        // my start of pixel in buffer
        // const offset: u32 = state.offset + this.ptr

        // const size: u32 = state.imgMemoryPtr;
        let i: u32 = 0;
        const x = (this.x*state.scale) + state.tx
        const y = (this.y*state.scale) + state.tx
        if(x < 0 || y < 0) return -1
        if((x + this.w) > state.canvasW || (y + this.h) > state.canvasH) return -1

        const startPixel = state.offset + (y as u32 * state.canvasW + x as u32) * 4
        // loop through each row
        for (let r: u8 = 0; r < this.h; r++) {
            // loop through each column/field
            for (let c: u8 = 0; c < this.w; c++) {

                // in pixel
                // #rows have each w pixel, 1 pixel 4 bytes, offset is start
                // const p: u32 = (r * this.w + c) * 4 + offset

                // out pixel
                // const o: u32 = state.offset + (this.y*state.canvasW + this.x) * 4
                // state.count += 1
                const outPixel: u32 = startPixel + (r * state.canvasW + c)*4
                // store<u32>((i * 4) + outPixel, load<u32>((i * 4) + this.ptr))
                store<u8>(outPixel, load<u8>((i) + this.ptr))
                store<u8>(outPixel +1, load<u8>((i + 1) + this.ptr))
                store<u8>(outPixel+2, load<u8>((i + 2) + this.ptr))
                store<u8>(outPixel+3, load<u8>((i + 3) + this.ptr))

                i++
            }
        }

        return 1;
    }



}

// add a node extern, later export class State and use diretly
export function addNode(w: u8, h: u8, ptr: u32, x: f64, y: f64): u32 {
    log(x)
    log(y)
    const test = Math.round(x * 1000000)/1000000
    const test2 = Math.round(y * 1000000)/1000000
    log(test)
    log(test2)
    // log(<f64><u32>y)
    // log(y as u32)
    return state.addNode(w, h, ptr, test, test2)
}

// checksum of node x
export function checkSum(x: u32): u32 {
    return state.checkOutArray()
    // return state.nodes[x].checkSum()
}

// checksum of node x
export function count(): u32 {
    return state.length;
}

export function init(count: u32, canvasW: u32, canvasH: u32, offset: u32): number {

    // create state
    state = new State(count, canvasW, canvasH, offset);

    return state.offset;
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
    state.scale = s
    return state.scale
}
export function setTxTy(tx: u32, ty: u32): u32 {
    state.tx = tx
    state.ty = ty
    return state.tx + state.ty
}
