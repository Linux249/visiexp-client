<template>
    <div>
        <canvas  ref="canvas" id="canvas" width="1600" height="800"></canvas>
    </div>
</template>

<script>
import logo from '../assets/logo.png';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const scale = 30;


class Node {
    constructor(data) {
        // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
        // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
        // But we aren't checking anything else! We could put "Lalala" for the value of x
        this.x = data.x;
        this.y = data.y;
        this.w = 80;
        this.h = 80;
        // this.scale = 1;
        this.img = new Image();
        this.img.src = `data:image/jpeg;base64,${data.buffer}`;
    }


    draw(ctx, scale) {
        console.log('start draw Image');
        // ctx.drawImage(this.img, this.x, this.y, this.w / scale, this.h / scale);
        ctx.drawImage(this.img, this.x, this.y, this.w / scale, this.h / scale);
    }

    contains(mx, my, scale, translateX, translateY) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Width) and its Y and (Y + Height)
        const x = (mx - translateX) / scale;
        const y = (my - translateY) / scale;
        const w = this.w / scale;
        const h = this.h / scale;


        /* const contains = (this.x <= x) && (this.x + w >= x) &&
            (this.y <= y) && (this.y + h >= y); */
        return (x >= this.x) && (x >= this.x + w) && (y >= this.y) && (y >= this.y + h);
    }
}


class CanvasState {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext('2d');

        // **** Keep track of state! ****

        this.valid = false; // when set to false, the canvas will redraw everything
        this.nodes = []; // the collection of things to be drawn
        this.dragging = false; // Keep track of when we are dragging
        // the current selected object. In the future we could turn this into an array for multiple selection
        this.selection = null;
        this.dragoffx = 0; // See mousedown and mousemove events for explanation
        this.dragoffy = 0;
        this.myState = this;

        this.scale = 30;
        this.interval = 100;

        this.offsetLeft = canvas.getBoundingClientRect().left;
        this.offsetTop = canvas.getBoundingClientRect().top;

        this.translateX = this.width / 2;
        this.translateY = this.height / 2;

        this.startX = null;
        this.startY = null;
        // this.ctx.translate(this.translateX / 2, this.translateY / 2);
        // this.ctx.scale(this.scale, this.scale);

        this.selection = null
        // add event listener

        this.canvas.onmousewheel = this.zoom;
        this.canvas.onmousedown = this.handleMouseDown;
        this.canvas.onmousemove = this.handleMouseMove;
        this.canvas.onmouseup = this.handleMouseUp;

        setInterval(() => this.draw(), this.interval);
    }

    addNode = (node) => {
        console.log('Node addded');
        this.nodes.push(node);
        this.valid = false; // for redrawing
    }

    clear() {
        // move point 0,0 to middle of canvas
        this.ctx.resetTransform();
        // this.ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.scale(this.scale, this.scale);
    }

    draw = () => {
        // if our state is invalid, redraw and validate!
        if (!this.valid) {
            console.log('reDraw started');
            const ctx = this.ctx;
            const nodes = this.nodes;
            this.clear();

            // ** Add stuff you want drawn in the background all the time here **

            // enlarge coordinates
            // draw all nodes
            nodes.map((node) => {
                // We can skip the drawing of elements that have moved off the screen:
                // TODO handle elements offside the screen
                /* if (shape.x > this.width || shape.y > this.height ||
                    shape.x + shape.w < 0 || shape.y + shape.h < 0) continue; */
                node.draw(ctx, this.scale);
            });


            // ** Add stuff you want drawn on top all the time here **


            this.valid = true;
        }
    }

    zoom = (wheelEvent) => {
        wheelEvent.preventDefault();
        // this.scale += 1;
        console.log(wheelEvent);
        // console.log(`Client: ${wheelEvent.clientX} : ${wheelEvent.clientY}`);  client = page
        // console.log(`Page ${wheelEvent.pageX} : ${wheelEvent.pageY}`); // page = total window, with header and all
        console.log(`Offset: ${wheelEvent.offsetX} : ${wheelEvent.offsetY}`); // inside the canvas, untouched by transform/scale
        // console.log(`Screen ${wheelEvent.screenX} : ${wheelEvent.screenY}`); // no idea what this is


        // Zoom in = increase = wheel up = negativ delta Y
        if (wheelEvent.wheelDelta > 0) {
            console.log('zoom in');
            this.ctx.scale(2, 2);
            this.scale += 1;
        }

        // Zoom out = decrease = wheel down = positiv delta Y
        if (wheelEvent.wheelDelta < 0) {
            console.log('zoom out');
            this.ctx.scale(0.5, 0.5);
            this.scale = this.scale - 1;
        }

        console.log(this.scale);
        // this.ctx.scale(this.scale, this.scale);
        this.valid = false;
        return false;
    }

    handleMouseDown = (e) => {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // TODO test if mouse hits Image and set their drag flag

        console.log('mousedown');
        console.log(e.offsetX);
        console.log(e.offsetY);

        this.nodes.map((node) => {
            if(node.contains(e.offsetX, e.offsetY, this.scale, this.translateX, this.translateY)) this.selection = node
        });

        if(this.selection) console.log(this.selection)
        // save start position
        this.startX = e.offsetX;
        this.startY = e.offsetY;

        // if nothing is clicked
        this.dragging = true;
    }

    handleMouseMove = (e) => {
        // console.log('mousemove');
        // console.log(event)

        // save mouse position

        if (this.dragging) {
            const moveX = e.offsetX - this.startX; // +80 means move 80px to right
            const moveY = e.offsetY - this.startY; // -50 means move 50 to top
            console.log({ moveX, moveY });
            this.startX = e.offsetX;
            this.startY = e.offsetY;

            this.translateX += moveX;
            this.translateY += moveY;

            // start drawing
            this.valid = false;
        }
    }

    handleMouseUp = (event) => {
        console.log('mouseup');
        this.dragging = false;
    }
}


export default {
    name: 'TsneMap',
    data() {
        return {
            exampleContent: 'This is TEXT',
            items: [],
        };
    },
    methods: {
        updateCanvas: () => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(scale, scale);

            /*
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
               ctx.beginPath();
                ctx.moveTo(30, 96);
                ctx.lineTo(70, 66);
                ctx.lineTo(103, 76);
                ctx.lineTo(170, 15);
                ctx.stroke();
            };
            img.src = logo; */
        },
    },
    watch: {
        exampleContent(val, oldVal) {
            this.updateCanvas();
        },
    },
    mounted() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const s = new CanvasState(canvas);
        socket.on('connect', socket => console.log(socket));
        socket.on('image', (data) => {
            console.log(data);
            if (data.image) {
                s.addNode(new Node(data));
            }
        });
        // this.updateCanvas();
    },


};
</script>

<style scoped>
    #canvas {
        margin: 50px;
        background-color: antiquewhite;
    }
</style>
