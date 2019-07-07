
export class Vec_3 {

    /**
     * Constructors work exactly like TypeScript.
     */
    constructor(
        public x: f64 = 0.0,
        public y: f64 = 0.0,
        public z: f64 = 0.0,
    ) {}

    /**
     * Operator overloading is supported in AssemblyScript using the `@operator`
     * decorator. We can even ask this computation to happen inline with the
     * `@inline` function decorator to cause this computation to happen in an
     * "inline" fashion. It's limited to operations that can be performed on the
     * *same* object type. Calling a "+" operator on a `Matrix` with a `Vector` is
     * not valid in AssemblyScript.
     */
    @inline @operator("+")
    protected add_vector(value: Vec_3): Vec_3 {
        return new Vec_3(this.x + value.x, this.y + value.y, this.z + value.z);
    }

    /**
     * To make a computed property, follow the ECMAScript syntax for computed
     * properties.
     **/
    public get length(): f64 {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z + this.z);
    }
}
/*
class Pic {
  constructor(
      public w: u8 = 0,
      public h: u8 = 0,
  ) {
  super()
}
}

export class Node {
  constructor(
      public x: f64 = 0.0,
      public y: f64 = 0.0,
      public pics: Array.create<Pic>(10),
  ) {
  super()
}

}*/

// TODO create a pic from outside
//  1. class should get an ArrayBuffer of unsigned ints (u8) with unknow length


// TODO read pixelArrayBuffer from outside and draw
//  1. init with canvasW/canvasH

export function add(a: i32, b: i32): i32 {
    return a + b;
}

/*export function addNode(x: i32, y: i32) {

}*/
