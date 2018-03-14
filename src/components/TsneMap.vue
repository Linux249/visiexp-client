<template>
    <div>
        <div class="sub-header">
            <div class="info-box">
                <div>Scale: {{scale}}</div>
                <div>Selection: {{selectedNode}}</div>
                <div>Neighbours #: {{selectedNodeNeighboursCount}}</div>
                <div>x: {{selectedNodeX}}</div>
                <div>y: {{selectedNodeY}}</div>
            </div>
            <div v-on:click="sendData" class="btn">Update Data</div>
        </div>
        <canvas  ref="canvas" id="canvas" width="1600" height="800"></canvas>
    </div>
</template>

<script>
import io from 'socket.io-client';
// import logo from '../assets/logo.png';


class Node {
    constructor(data, triggerDraw) {
        // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
        // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
        // But we aren't checking anything else! We could put "Lalala" for the value of x
        this.name = data.name;
        this.neighbours = data.neighbours;
        this.index = data.index;
        this.x = data.x;
        this.y = data.y;
        this.w = 40;
        this.h = 40;

        this.triggerDraw = triggerDraw;

        this.imageScale = 5; // showing images bigger
        // this.scale = 1;
        this.icon = new Image();
        this.icon.src = `data:image/jpeg;base64,${data.buffer}`;

        this.active = false; // handle clicked node
        this.isActiveNeighbour = false; // is this a neighbour of a active node?
        this.hasImage = false; // is there detailed image?

        this.image = new Image();
        // this.image.src = `data:image/jpeg;base64,${data.buffer}`;

        //
        this.timerId = 0;

        this.v = null; // value will be set by the active nodes neighbour-values, default is 5
    }

    get width() {
        if (this.isActive) return this.w + (this.w * this.imageScale);
        if (this.isActiveNeighbour) return this.w + (this.w * this.imageScale * (this.value / 10));
        return this.w;
    }

    get height() {
        if (this.isActive) return this.h + (this.h * this.imageScale);
        if (this.isActiveNeighbour) return this.h + (this.h * this.imageScale * (this.value / 10));
        return this.h;
    }

    get value() {
        return this.v;
    }

    set value(v) {
        if (v < 1) this.v = 1;
        else if (v > 10) this.v = 10;
        else this.v = v;
    }

    get isActive() {
        return this.active;
    }

    set isActive(v) {
        this.active = v;

        /*if(this.timerId) clearInterval(this.timerId);
        this.active = v;
        if (v === true) {
            this.active = v;
            this.timerId = setInterval(() => {
                console.log(this.imageScale)
                this.imageScale += 0.1;
                ;
                if (this.imageScale >= 5) {
                    clearInterval(this.timerId);
                    this.imageScale = 5
                }
                this.triggerDraw()
            }, 100);
        } else if(v === false) {
            this.timerId = setInterval(() => {
                this.imageScale -= 0.1;
                this.triggerDraw();

                if (this.imageScale <= 1) {
                    this.active = v;
                    clearInterval(this.timerId);
                    this.imageScale = 1
                }
                this.triggerDraw();
            }, 100);
        }*/
    }


    // ctx is the canvas context
    // scale change through zooming and is used for positioning the images
    draw(ctx, scale) {
        // console.log('start draw Image');
        // check which picture to use

        // eif(thi) socket.emit('requestImage', node.name);
        const imgData = (this.isActive || this.isActiveNeighbour) && this.hasImage ? this.image : this.icon;

        if (this.isActive) {
            // console.log(`Active node while draw: ${this.name}}`);
            // console.log(this);
            ctx.globalAlpha = 1;
            ctx.drawImage(imgData, this.x, this.y, this.width / scale, this.height / scale);
            // ctx.rect(this.x,this.y, this.width/scale,this.height/scale);
            // ctx.stroke();
        } else if (this.isActiveNeighbour) {
            // console.log(`Neighbour node while draw: ${this.name}}`);
            // console.log(this);
            ctx.globalAlpha = 1;
            ctx.drawImage(imgData, this.x, this.y, this.width / scale, this.height / scale);
        } else {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(imgData, this.x, this.y, this.width / scale, this.height / scale);
        }
    }

    contains(x, y, scale) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the Node X and (X + Width) and its Y and (Y + Height)
        const w = this.width / scale;
        const h = this.height / scale;

        // const contains = (x >= this.x) && (x <= this.x + w) && (y >= this.y) && (y <= this.y + h);
        return (x >= this.x) && (x <= this.x + w) && (y >= this.y) && (y <= this.y + h);
        // console.log(contains);
        // console.log(this);
        // console.log({ mx, my, x, y, w, h });


        // return contains;
    }

}


class CanvasState {
    constructor(canvas, socket) {
        this.socket = socket;

        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext('2d');

        // **** Keep track of state! ****

        this.valid = false; // when set to false, the canvas will redraw everything
        this.nodes = {}; // hash for all nodes
        this.dragging = false; // Keep track of when we are dragging + save the node for dragging

        // the current selected object. TODO  In the future we could turn this into an array for multiple selection
        this.selection = null;

        this.freeze = false; // freeze for handling selection

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


        // add event listener
        this.canvas.onmousedown = this.handleMouseDown;
        this.canvas.onmousemove = this.handleMouseMove;
        this.canvas.onmouseup = this.handleMouseUp;
        // this.canvas.onlclick = this.handleClick;
        this.canvas.ondblclick = this.handleDoubleClick;
        this.canvas.onwheel = this.zoom;

        setInterval(() => this.draw(), this.interval);
    }

    triggerDraw() {
        console.log("triggerDraw")
        this.valid = false;
    }


    addNode = (node) => {
        console.log('Node addded');
        this.nodes[node.index] = node;
        this.valid = false; // for redrawing
    }

    getNodes() {
        return this.nodes;
    }

    resetStore() {
        this.nodes = {};
        this.valid = false;
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
            // const nodes = this.nodes;
            this.clear();

            // ** Add stuff you want drawn in the background all the time here **
            if (this.freeze) {
                this.canvas.style.background = '#e2e2e2';
            } else this.canvas.style.background = '#fff';
            // enlarge coordinates
            // draw all nodes
            Object.values(this.nodes).map((node) => {
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
        console.log("zoom event")
        wheelEvent.preventDefault();
        wheelEvent.stopPropagation();


        if (!this.selection) {
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
            this.valid = false;
        } else {
            const nodeUnderMouse = this.findNodeByMousePosition(wheelEvent.offsetX, wheelEvent.offsetY);
            if (nodeUnderMouse && nodeUnderMouse.isActiveNeighbour) {
                console.log('nodeUnderMouse');
                console.log(nodeUnderMouse.name);

                if (wheelEvent.wheelDelta > 0) {
                    console.log('zoom in - image smaller');
                    nodeUnderMouse.value -= 1;
                }

                // Zoom out = decrease = wheel down = positiv delta Y
                if (wheelEvent.wheelDelta < 0) {
                    console.log('zoom out - image bigger');
                    nodeUnderMouse.value += 1;
                }

                this.valid = false;
            } else {
                // no node under mouse oder the node is not a active neighbour
                // Todo add different handling of this
                console.log('no node under mouse oder the node is not a active neighbour');
            }
        }

        // console.log(this.scale);
        // this.ctx.scale(this.scale, this.scale);
        return false;
    }

    findNodeByMousePosition(x, y) {
        // find 'first' node under click
        // slice makes copy of array
        // translate X/Y to node x/y
        const nodeX = (x - this.translateX) / this.scale;
        const nodeY = (y - this.translateY) / this.scale;
        return Object.values(this.nodes).slice(0).reverse().find(
            node => node.contains(nodeX, nodeY, this.scale),
        );
    }

    selectNode(node) {
        // delete old node
        if (this.selection && this.selection !== node) this.removeSelection();
        this.selection = node;
        console.log('selected Node');
        console.log(this.selection);

        // const activeNode = this.selection;
        // mark node as active
        node.isActive = true;

        // load detail image
        /* if (!node.hasImage) {
            console.log('request image');
            socket.emit('requestImage', node.name);
        } */

        // mark neighbours
        node.neighbours.forEach((n) => {
            // console.log(n.target);
            if (this.nodes[n.target]) {
                // mark as neighbour of a active note
                this.nodes[n.target].isActiveNeighbour = true;
                // set value from links to nodes
                this.nodes[n.target].value = n.value;
                // load neighbours detailed image
                // if (!this.nodes[n.target].hasImage) socket.emit('requestImage', { name: this.nodes[n.target].name, index: this.nodes[n.target].index });

                // console.error(`FOUND Neighbours ID: ${n.target} Name: ${this.nodes[n.target].name} Value: ${n.value} isActive ${this.nodes[n.target].isActiveNeighbour}`);
            } else {
                // console.error(`Neighbours ID: ${n.target} is not a not found in nodes`);
            }
        });

        this.valid = false;
    }

    removeSelection() {
        this.selection.isActive = false;
        // mark the neighbours as not active
        if (this.selection) {
            this.selection.neighbours.forEach((n) => {
            // todo their should not be a case where n.target is outside the array
                if (this.nodes[n.target]) {
                    this.nodes[n.target].isActiveNeighbour = false;
                    // update (new) values in links
                    n.value = this.nodes[n.target].value;
                }
            });
        }
        // remove selection
        this.selection = null;
        this.valid = false; // redraw
    }

    handleMouseDown = (e) => {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        // console.log(e)
        const shiftKeyPressed = e.shiftKey;

        const nodeUnderMouse = this.findNodeByMousePosition(e.offsetX, e.offsetY);

        // TODO test if mouse hits Image and set their drag flag

        console.log('mousedown');
        // console.log(e.offsetX);
        // console.log(e.offsetY);

        // save start position
        this.startX = e.offsetX;
        this.startY = e.offsetY;


        // if there is no mouse under mouse then move everything
        if (nodeUnderMouse) {
            if (this.freeze && shiftKeyPressed) {
                // if node is active neighbour: remove as a neighbour
                if (nodeUnderMouse.isActiveNeighbour) {
                    nodeUnderMouse.isActiveNeighbour = false;
                    this.selection.neighbours = this.selection.neighbours.filter(item => item.target !== nodeUnderMouse.index);
                    this.valid = false;
                }
                // if node is is not active neighbour and not the active node itself : add as neigfbour
                else if (this.selection !== nodeUnderMouse) {
                    nodeUnderMouse.isActiveNeighbour = true;
                    // nodeUnderMouse.v = 5
                    this.selection.neighbours.push({ target: nodeUnderMouse.index, value: 5 });
                    this.valid = false;
                }
            }

            if (this.freeze && nodeUnderMouse.isActive) {
                // save the node for dragging
                this.dragging = nodeUnderMouse;
            }
        } else {
            // if nothing is clicked
            this.dragging = true;
        }
    }

    handleMouseMove = (e) => {
        // there is a freeze and not freeze mode - different interaction based ob if a node is active or node
        const nodeUnderMouse = this.findNodeByMousePosition(e.offsetX, e.offsetY);

        if (nodeUnderMouse && !nodeUnderMouse.hasImage) this.socket.emit('requestImage', { name: nodeUnderMouse.name, index: nodeUnderMouse.index });

        // freeze mode is toggled with dbclick
        if (this.freeze) {
            // mouse is over a neighbour
            if (this.dragging instanceof Node) {
                // drag the node and al of his neighbour
                // TODO later the 'moving weighted with values# should be toggled with a button

                // get mouse movement based on the last triggered event
                const moveX = e.offsetX - this.startX; // +80 means move 80px to right
                const moveY = e.offsetY - this.startY; // -50 means move 50 to top
                // console.log({ moveX, moveY });

                // save new mouse position for next event
                this.startX = e.offsetX;
                this.startY = e.offsetY;

                // scale the X/Y
                const nodeX = moveX / this.scale;
                const nodeY = moveY / this.scale;
                // console.log({ nodeX, nodeY });

                // change the Node position
                this.dragging.x += nodeX;
                this.dragging.y += nodeY;

                // change position of neighbours
                this.dragging.neighbours.forEach((n) => {
                    // todo their should not be a case where n.target is outside the array
                    if (this.nodes[n.target]) {
                        this.nodes[n.target].x += nodeX * this.nodes[n.target].value / 10;
                        this.nodes[n.target].y += nodeY * this.nodes[n.target].value / 10;
                    }
                });
                this.valid = false;
            }
        } else {
            // no freeze mode
            if (this.dragging) {
                const moveX = e.offsetX - this.startX; // +80 means move 80px to right
                const moveY = e.offsetY - this.startY; // -50 means move 50 to top
                // console.log({ moveX, moveY });
                this.startX = e.offsetX;
                this.startY = e.offsetY;

                this.translateX += moveX;
                this.translateY += moveY;

                // start drawing
                this.valid = false;
            } else {
                // mouse moves over empty area after being over a node
                if (!nodeUnderMouse && this.selection) this.removeSelection();
                // mouse over picture and no picture before
                else if (!this.selection && nodeUnderMouse) this.selectNode(nodeUnderMouse);
                // mouse over picture but not the is allread selected = new picture selected
                else if (nodeUnderMouse && nodeUnderMouse !== this.selection) {
                    this.removeSelection();
                    this.selectNode(nodeUnderMouse);
                }
            }
        }


        // mouse over empty area
    }

    handleMouseUp = (event) => {
        console.log('mouseup');
        this.dragging = false;
    }


    handleDoubleClick = (e) => {
        console.log('Double click');

        // the selction handle the mousemove
        if (this.freeze) this.freeze = !this.freeze;
        else if (this.selection) this.freeze = true;
        this.valid = false;
    }
}


export default {
    name: 'TsneMap',
    data: () => ({
        exampleContent: 'This is TEXT',
        items: [],
        store: null,
        socket: null,
    }),
    methods: {
        updateCanvas: () => {
            // const canvas = document.getElementById('canvas');
            // const ctx = canvas.getContext('2d');
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.translate(canvas.width / 2, canvas.height / 2);
            // ctx.scale(scale, scale);
        },
        sendData() {
            console.log('send data clicked');
            const nodes = this.store.getNodes();
            // this.store.clear()
            this.store.resetStore();
            this.socket.emit('updateNodes', JSON.stringify(nodes));
        },
    },
    watch: {
        exampleContent(val, oldVal) {
            this.updateCanvas();
        },
    },
    computed: {
        scale() {
            return this.store && this.store.scale;
        },
        selectedNode() {
            return this.store && this.store.selection && this.store.selection.name;
        },
        selectedNodeX() {
            return this.store && this.store.selection && this.store.selection.x;
        },
        selectedNodeY() {
            return this.store && this.store.selection && this.store.selection.y;
        },
        selectedNodeNeighboursCount() {
            return this.store && this.store.selection && this.store.selection.neighbours && this.store.selection.neighbours.length;
        },
    },
    mounted() {
        const socket = io('http://localhost:3000');
        const canvas = document.getElementById('canvas');
        // const ctx = canvas.getContext('2d');
        const s = new CanvasState(canvas, socket);
        this.store = s;
        this.socket = socket;

        socket.on('connect', (soc) => {
            if (!soc) {
                console.log('no conection');
            } else {
                console.log('conected');
                console.log(soc);
            }
        });

        socket.on('node', (data) => {
            console.log('receive node');
            console.log(data);
            if (data) {
                s.addNode(new Node(data, s.triggerDraw));
            }
        });
        socket.on('receiveImage', (data) => {
            console.log('receive image data');
            console.log(data);
            const node = s.nodes[data.index];
            console.log(node);
            node.image.src = `data:image/jpeg;base64,${data.buffer}`;
            node.hasImage = true;
            s.valid = false;
        });
        // this.updateCanvas();
    },
    beforeDestroy() {
        if (this.socket) this.socket.disconnect();
    },
};
</script>

<style scoped>
    .info-box {
        display: flex;
    }

    .info-box > div{
        padding: 0.5rem;
    }

    #canvas {
        margin: 5px;
    }

    .btn {
        text-decoration: none;
        margin: 10px;
        height: 20px;
        line-height: 20px;
        padding: 0 14px;
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        background: #fff;
        color: #6772e5;
        border-radius: 4px;
        font-size: 15px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .025em;
        transition: all .15s ease;
        cursor: pointer;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
    }

    .sub-header {
        display: flex;
        justify-content: space-between;
    }

</style>
