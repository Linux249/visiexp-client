// declare function sayHello(): void;

// sayHello();

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

    constructor(
        public count: u32, // default is 4
        public canvasW: u32, // actual size if canvas
        public canvasH: u32,
        public offset: u32, // default is here
    ) {
        //todo add size
        this.imgMemoryPtr = (4*  this.canvasW * this.canvasH) + this.offset;
    }

    public get length(): u32 {
        return this.nodes.length;
    }

    // add a new node to the state and return actuly state size
    public addNode(w: u8, h: u8, ptr: u32, x: u32, y: u32): u32 {

        this.count += 1;
        // console.log(this.count)
        const node: Node = new Node(w, h, ptr, x, y);
        // this.nodes.push(new Node(w, h, ptr));
        this.nodes.push(node)

        return node.imgByteSize;
        //return 0;
    }

    public getCheckSum(x: u32): u32 {
        return this.nodes[x].checkSum()
    }


    public draw(): u32 {

        let s: u32 = 0;
        let c: u32 = this.count
        for (let x: u32 = 0; x < c; x++) {
            // s += this.nodes[x].checkSum()
            // s += this.nodes[x].x
            // s += this.nodes[x].y
            // s += this.nodes[x].w
            // s += this.nodes[x].h
            s += this.nodes[x].draw()
        }
        // return this.checkOutArray()
        return this.offset

    }

    public checkOutArray(): u32 {
        // let c = 0;

        let v: u32 = 0;
        for (let i: u32 = this.offset, size: u32 = this.imgMemoryPtr; i < size; ++i) {
            // store<u8>(i + 2, 1)
            //v += 1//load<u8>(i);
        }

        return this.offset;

    }

}

let state: State;

class Node {
    //imgByteSize:  u32
    constructor(
        public w: u8,
        public h: u8,
        public ptr: u32,    // max 2,147,483,64
        public x: u32,
        public y: u32,
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

        const size: u32 = state.imgMemoryPtr;
        let i: u32 = 0;

        const startPixel = state.offset + (this.y * state.canvasW + this.x) * 4
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

        return size;
    }



}

// add a node extern, later export class State and use diretly
export function addNode(w: u8, h: u8, ptr: u32, x: u32, y: u32): u32 {
    return state.addNode(w, h, ptr, x, y)
}

// checksum of node x
export function checkSum(x: u32): u32 {
    return state.nodes[x].checkSum()
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

// pages of memory
export function memorySize(): u32 {
    return memory.size();
}


