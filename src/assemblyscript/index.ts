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

function rgbaToU32Int(r: u32, g: u32, b: u32, a: u32): u32 {
   return r | (g << 8) | (b << 16) | (a << 24)
}

// const blue: u32 = rgbaToU32Int(56, 130, 255, 255)
const red: u32 = rgbaToU32Int(255, 0, 0, 255)
const green: u32 = rgbaToU32Int(0, 255, 0, 255)
const blue: u32 = rgbaToU32Int(0, 0, 255, 255)
const purple: u32 = rgbaToU32Int(103, 114, 229, 255)
const black: u32 = rgbaToU32Int(50, 50, 50, 200)


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
    public colors: u32[] = new Array<u32>();
    public nonActivecolors: u32[] = new Array<u32>();
    public size: u32;
    public explorerEnd: usize;
    public hitMapEnd: usize;
    public scale: u32 = 20;
    public zoom: u8 = 0;
    public tx: i32;
    public ty: i32;
    public scissor: bool = false;
    public scissorStartX: u32 = 0;
    public scissorStartY: u32 = 0;
    public scissorEndX: u32 = 0;
    public scissorEndY: u32 = 0;
    public activeGroupId: u32 = 0;

    constructor(public count: u32, public canvasW: u32, public canvasH: u32, public explorerStart: u32, public hitMapStart: u32) {
        //todo add size
        this.explorerEnd = explorerStart + 4 * (canvasW * canvasH);
        this.hitMapEnd = hitMapStart + 4 * (canvasW * canvasH);
        this.tx = Math.ceil(canvasW / 2) as i32;
        this.ty = Math.ceil(canvasH / 2) as i32;
    }

    public get length(): u32 {
        return this.nodes.length;
    }

    // add a new node to the state and return actuly state size
    public addNode(x: f64, y: f64, id: u32, r: u8, g: u8, b: u8): u32 {
        this.count += 1;
        // console.log1(this.count)
        const node: Node = new Node(x, y, id, r, g, b);
        // this.nodes.push(new Node(w, h, ptr));
        this.nodes.push(node);

        return 1;
        //return 0;
    }

    public getCheckSum(x: u32): u32 {
        return this.nodes[x].checkSum();
    }

    public draw(): u32 {
        // clear explorerPixel
        this.clear()

        let s: u32 = 0;
        for (let x: u32 = 0; x < this.count; x++) {
            s += this.nodes[x].draw();
        }

        // draw scissor at last
        if (this.scissor) this.drawScissor()

        return this.explorerEnd;
    }

    public clear(): u32 {
        // clear explorer pixel
        for (let i: u32 = this.explorerStart; i < this.explorerEnd; i++) {
            store<u8>(i, <i32>0);
        }
        // clear hitmap pixel
        for (let i: u32 = this.hitMapStart; i < this.hitMapEnd; i++) {
            store<u8>(i, <i32>0);
        }
        return this.explorerStart;
    }

    public checkOutArray(): u32 {
        let v: u32 = 0;
        for (let i: u32 = this.explorerStart, size: u32 = this.explorerEnd; i < size; ++i) {
            // store<u8>(i + 2, 1)
            v += load<u8>(i);
        }

        return v;
    }

    drawRect(x: u32, y: u32, w: u32, h: u32, color: u32): u32 {
        const startPixel = this.explorerStart + ((((y - 2) * this.canvasW ) + x - 2) * 4);
        if(startPixel < state.explorerStart) return 0;
        if(startPixel + w + 4 > state.explorerEnd) return 0;

        let p: u32 = 0
        // draw top/bottom line
        for(let i: u32 = 0; i < (w + 4); i+= 1) {
            // double top line
            p = startPixel + (i * 4);
            store<u32>(p, color);
            p += this.canvasW * 4;
            store<u32>(p, color);

            // double bottom line: add first 2 for the removed above and 1 for one under
            p += this.canvasW * 4* (h + 1);
            store<u32>(p, color);
            p += this.canvasW * 4;
            store<u32>(p, color);
        }
        // draw left/ right line
        for(let i: u32 = 2; i < h + 4; i+= 1) {
            // double left line
            p = startPixel + (i * this.canvasW * 4);
            store<u32>(p, color);
            p += 4;
            store<u32>(p, color);

            // double right line
            p += w * 4 + 4;
            store<u32>(p, color);
            p += 4;
            store<u32>(p, color);
        }

        return 1;
    }

    drawScissor(): u32 {
        // find the left top corner of square
        const x: u32 = this.scissorStartX < this.scissorEndX
            ? this.scissorStartX : this.scissorEndX;
        const y: u32 = this.scissorStartY < this.scissorEndY
            ? this.scissorStartY : this.scissorEndY;

        const w: u32 = this.scissorEndX > this.scissorStartX
            ? this.scissorEndX - this.scissorStartX : this.scissorStartX - this.scissorEndX;
        const h: u32 =  this.scissorEndY > this.scissorStartY
            ? this.scissorEndY - this.scissorStartY : this.scissorStartY - this.scissorEndY;

        return this.drawRect(x, y, w as u32, h as u32, purple)
    }
}

let state: State;

class Node {
    //imgByteSize:  u32
    public pics: Pic[] = new Array<Pic>();
    public marked: bool = false;
    public groupId: u32 = 0;
    public isRep: bool = false;

    constructor(
        // public w: u8,
        // public h: u8,
        // public ptr: u32,    // max 2,147,483,647
        public x: f64,
        public y: f64,
        public id: u32,
        public r: u8,
        public g: u8,
        public b: u8,
    ) {
        // this.imgByteSize =
    }

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
        /** img size means the position in array of Pics*/
        let imgSize = state.zoom;
        if(this.isRep) imgSize += 5;
        if(imgSize < 0) imgSize = 0;
        if(imgSize > 9) imgSize = 9;

        /** knowing the the size is knowing the size
         * if image goes over right, bottom board, don't paint it*/
        const w = this.pics[imgSize].w;
        const h = this.pics[imgSize].h;

        /** transformed and scaled x,y for the true position in canvas
         * if outside, return */
        const x = Math.floor(this.x * state.scale + state.tx - w/2);
        const y = Math.floor(this.y * state.scale + state.ty - h/2);

        if (x < 0 || y < 0) return -1;
        if (x + w > state.canvasW || y + h > state.canvasH) return -1;

        /** pointer to where the image pixel is in memory*/
        const ptr = this.pics[imgSize].ptr;

        // node is just marked
        if(this.marked && this.groupId === 0) state.drawRect(x as u32, y as u32, w, h, black)
        // draw as active group
        if(this.groupId > 0 && state.activeGroupId == this.groupId) state.drawRect(x as u32, y as u32, w, h, state.colors[this.groupId])
        // draw as non-active group
        else if(this.groupId > 0) state.drawRect(x as u32, y as u32, w, h, state.nonActivecolors[this.groupId])

        const startPixel = state.explorerStart + (((y as u32) * state.canvasW + x) as u32) * 4;
        const hitMapPixel = state.hitMapStart + (((y as u32) * state.canvasW + x) as u32) * 4;

        // loop through each row
        for (let r: u32 = 0; r < h; r += 1) {
            for (let c: u32 = 0; c < w; c += 1) {
                // loop through each column/field

                const outPixel: u32 = startPixel + (r * state.canvasW + c) * 4;
                const inPixel: u32 = 4 * (r * w + c) + ptr;
                store<u32>(outPixel, load<u32>(inPixel));

                // draw on hitmap
                const outHitMapPixel: u32 = hitMapPixel + (r * state.canvasW + c) * 4;
                store<u8>(outHitMapPixel, this.r);
                store<u8>(outHitMapPixel + 1, this.g);
                store<u8>(outHitMapPixel + 2, this.b);
                store<u8>(outHitMapPixel + 3, 255);
            }
        }

        return 1;
    }
}

// add a node extern, later export class State and use diretly
export function addNode(x: f64, y: f64, id: u32, r: u8, g: u8, b: u8): u32 {
    // why was tis Math way necessary?
    const test = Math.round(x * 1000000) / 1000000;
    const test2 = Math.round(y * 1000000) / 1000000;
    // log(test);
    // log(test2);
    // log(<f64><u32>y)
    // log(y as u32)
    return state.addNode(test, test2, id, r, g, b);
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

export function init(count: u32, canvasW: u32, canvasH: u32, explorerStart: u32, hitMapStart: u32): number {
    // create state
    state = new State(count, canvasW, canvasH, explorerStart, hitMapStart);

    return state.explorerStart;
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
    // log(state.scale);
    return state.scale;
}

export function setTxTy(tx: u32, ty: u32): u32 {
    state.tx = tx;
    state.ty = ty;
    // log(state.tx);
    // log(state.ty);
    return state.tx + state.ty;
}

export function setZoom(z: u8): u8 {
    state.zoom = z < 10 ? z : 9;
    // log(state.zoom);
    return state.zoom;
}

export function addTxTy(tx: i32, ty: i32): u32 {
    state.tx += tx;
    state.ty += ty;
    // log(state.tx);
    // log(state.ty);
    return state.tx + state.ty;
}

/** used in setter of Node's x */
export function nodeSetX(n: u32, x: f64): f64 {
    return state.nodes[n].x = x
}

/** used in setter of Node's y */
export function nodeSetY(n: u32, y: f64): f64 {
    return state.nodes[n].y = y
}

/** used in setter of Node's group flag - is also active if node has a groupId !== 0'*/
export function nodeSetMarked(n: u32, flag: bool): bool {
    return state.nodes[n].marked = flag
}

/** used in node.groupId setter */
export function nodeSetGroupId(n: u32, id: u32): u32 {
    return state.nodes[n].groupId = id
}

/** used in node.isClustered setter */
export function nodeSetRep(n: u32, flag: bool): u32 {
    return state.nodes[n].isRep = flag
}

/** used in setter of ExplorerState's group flag - is also active if node has a groupId !== 0'*/
export function stateSetScissior(flag: bool): bool {
    return state.scissor = flag
}

/** used in mouseDown handler */
export function stateSetScissiorStartXY(x: u32, y: u32): bool {
    state.scissorStartX = x;
    state.scissorStartY = y;
    return true
}

/** used in mouseMove handler if scissor*/
export function stateSetScissiorEndXY(x: u32, y: u32): bool {
    state.scissorEndX = x;
    state.scissorEndY = y;
    return true
}

/** used in Vue's activeGroup setter*/
export function stateSetActiveGroup(id: u32): u32 {
    return state.activeGroupId = id
}

/** used in Vue's activeGroup setter*/
export function stateSetGroupColor(id: u32, r: u32, g: u32, b: u32): u32 {
    state.colors[id] = rgbaToU32Int(r, g, b, 255);
    state.nonActivecolors[id] = rgbaToU32Int(r, g, b, 50);
    return state.colors[id];
}


