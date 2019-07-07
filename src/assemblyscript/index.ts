// declare function sayHello(): void;
//
// sayHello();

//namespace console {
//  export declare function log(int: f64): void;
//}


// GEIL - Beliebig viele Knoten pushen°!
// TODO
// 1. Init mit out array verbinden,

class State {
    protected nodes: Node[] = new Array<Node>();

    // protected pixel: Array<u8>;
    constructor(
        public count: u32, // default is 4
        public canvasW: u32, // actual size if canvas
        public canvasH: u32,
        public offset: u32, // default is here
    ) {
        //pixel: Array<u8> = new Array<u8>(4* this.canvasW * this.canvasH).fill(0, 0, 4)
    }

    public get length(): u32 {
        return this.nodes.length;
    }

    // add a new node to the state and return actuly state size
    public addNode(w: u8, h: u8, ptr: u32): u32 {

        this.count += 1;
        // console.log(this.count)
        const node: Node = new Node(w, h, ptr);
        // this.nodes.push(new Node(w, h, ptr));
        this.nodes.push(node)

        return node.imgByteSize;
        //return 0;
    }

    public getCheckSum(x: u32): u32 {
        return this.nodes[x].checkSum()
    }


    public draw(): u32 {
        let v: u32 = 0;
        const size: u32 = 4 * this.canvasH * this.canvasW + this.offset;
        for (let i: u32 = this.offset; i < size; ++i) {
            store<u8>(i, 1)
            v += load<u8>(i);

        };
        return v;
    }

}

let state: State;

class Node {
    //imgByteSize:  u32
    constructor(
        public w: u8,
        public h: u8,
        public ptr: u32,    // max 2,147,483,64
        public x: f64 = 0,
        public y: f64 = 0,
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

}

// add a node extern, later export class State and use diretly
export function addNode(w: u8, h: u8, ptr: u32): u32 {
    return state.addNode(w, h, ptr)
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


