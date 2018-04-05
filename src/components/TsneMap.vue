<template>
    <div class="body">
        <div class="sub-header">
            <div>
                <div class="row">
                    <div>S: {{scale}}</div>
                    <!--<div @click="scaleUp" class="btn">+</div>
                    <div @click="scaleDown" class="btn">-</div>-->
                </div>
            </div>
            <div class="row">
                <div
                    class="btn"
                    v-for="(value, key) in labels"
                    :key="key"
                    v-bind:style="{'color': value}"
                >
                    {{ key }}
                </div>
            </div>
            <div class="row">
                <div @click="toggleClassify" class="btn" :class="{ active: classify }">Classification</div>
                <div @click="sendData" class="btn" >Update Data</div>
            </div>
        </div>
        <div class="row">
            <canvas  ref="canvas" id="canvas" tabindex="0" :class="{classify}"></canvas>
            <div class="details">
                <div class="info-box">
                    <div class="row-btn">
                        <div>Cluster: {{cluster}}</div>
                        <div class="row">
                            <div @click="clusterLess" class="btn">-10</div>
                            <div @click="clusterMore" class="btn">+10</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>ImageWidth: {{imgWidth}}</div>
                        <div class="row">
                            <div @click="imgWidthLess" class="btn">-1</div>
                            <div @click="imgWidthMore" class="btn">+1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>ImageWidth(active): {{activeImgWidth}}</div>
                        <div class="row">
                            <div @click="activeImgWidthLess" class="btn">-1</div>
                            <div @click="activeImgWidthMore" class="btn">+1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>BorderWidth: {{borderWidth}}</div>
                        <div class="row">
                            <div @click="borderWidthLess" class="btn">-1</div>
                            <div @click="borderWidthMore" class="btn">+1</div>
                        </div>
                    </div>
                    <!--<div class="row-btn">
                        <div>{{range}}}</div>
                        <range-slider v-model="cluster" type="range" min="0" max="800" step="10" />
                    </div>-->
                </div>
                <classifier v-if="classify" :nodes="classifyNodes"/>
                <div class="info-box">
                    <img class="img" v-if="activeNode.hasImage" :src="activeNode.image.src" />
                    <div>Name: {{activeNode.name}}</div>
                    <div>Label: {{activeNode.label}}</div>
                    <div>Links #: {{selectedNodeNeighboursCount}}</div>
                    <div>x: {{selectedNodeX}}</div>
                    <div>y: {{selectedNodeY}}</div>
                    <div>ImgScale: {{imageScale}}</div>
                    <div>classifyNodes: {{classifyNodes.length}}</div>
                </div>
            </div>
        </div>
        <triblets :node="activeNode"/>
    </div>
</template>

<script>
import io from 'socket.io-client';
import range from '../util/range';
// import logo from '../assets/logo.png';

/*
    TODO:
    - rename imageWidth to imageSize
    - rename scale to zoom
*/

/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
class Node {
    constructor(data, ctx, hitCtx, triggerDraw) {
        this.name = data.name;
        this.links = data.links;
        this.index = data.index;
        this._x = data.x;
        this._y = data.y;
        this._width = 1; // 40;
        this._height = 1; // 40;
        this.colorKey = data.colorKey;
        this.color = data.color;
        this.ctx = ctx;
        this.hitCtx = hitCtx;

        this.cluster = data.cluster;
        this.positives = data.positives;
        this.negatives = data.negatives;

        this.label = data.label;
        // x,y for reseting
        this.initX = data.x;
        this.initY = data.y;

        // callback for drawing everything
        this.triggerDraw = triggerDraw;

        this.activeScale = 3; // showing images bigger
        // this.scale = 1;
        this.icon = new Image();
        this.icon.src = `data:image/jpeg;base64,${data.buffer}`;

        this._isActive = false; // handle clicked node
        this.isActiveNeighbour = false; // is this a neighbour of a active node?
        this.hasImage = false; // is there detailed image?

        this.image = new Image();
        // this.image.src = `data:image/jpeg;base64,${data.buffer}`;

        this.scale = null; // used for scaling the x/y position
        this.imgScale = null; // used for scaling img width
        //
        this.timerId = 0;

        this._value = null; // value will be set by the active nodes neighbour-values, default is 5
    }

    get width() {
        const w = this._width;
        if (this.isActive) return w + (w * this.activeScale);
        if (this.isActiveNeighbour) return w + (w * this.activeScale * this.value);
        return w;
    }

    set width(value) {
        this._width = value;
    }

    get height() {
        const h = this._height;
        if (this.isActive) return h + (h * this.activeScale);
        if (this.isActiveNeighbour) return h + (h * this.activeScale * this.value);
        return h;
    }

    set height(value) {
        this._height = value;
    }

    get value() {
        return this._value;
    }

    set value(v) {
        if (v < 0.1) this._value = 0.1;
        else if (v > 1) this._value = 1;
        else this._value = v;
    }

    get isActive() {
        return this._isActive;
    }

    set isActive(v) {
        this._isActive = v;

        /* if(this.timerId) clearInterval(this.timerId);
        this._isActive = v;
        if (v === true) {
            this._isActive = v;
            this.timerId = setInterval(() => {
                console.log(this.activeScale)
                this.activeScale += 0.1;
                ;
                if (this.activeScale >= 5) {
                    clearInterval(this.timerId);
                    this.activeScale = 5
                }
                this.triggerDraw()
            }, 100);
        } else if(v === false) {
            this.timerId = setInterval(() => {
                this.activeScale -= 0.1;
                this.triggerDraw();

                if (this.activeScale <= 1) {
                    this._isActive = v;
                    clearInterval(this.timerId);
                    this.activeScale = 1
                }
                this.triggerDraw();
            }, 100);
        } */
    }

    // if isActive
    // scale x to real/current 2d-coords
    // subtract half width for moving left, width scaled with ImageScale
    // scale back to Node x/y
    // TODO the last point is because of the context is scaling it again - maybe we could get rid of this?

    get x() {
        return this._x - (this.width / 2 / this.scale);
        // return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y - (this.height / 2 / this.scale);
        // return this._y;
    }

    set y(value) {
        this._y = value;
    }

    // simple changing the x/y is not possible because
    // they have special getters witch would be use while setting/+= values
    move(x, y) {
        this._x += x;
        this._y += y;
    }


    // ctx is the canvas context
    // scale change through zooming and is used for positioning the images
    draw(scale, imgWidth, cluster) {
        // console.log('start draw Image');
        // check which picture to use
        this.scale = 1; // scale;

        const imgData = this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ;
        */
        const w = imgData.width * imgWidth / 1000;
        const h = imgData.height * imgWidth / 1000;
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);

        if (this.cluster < cluster) {
            // console.log('draw image');
            // console.log(this);
            this.ctx.drawImage(imgData, x, y, w, h);
            this.hitCtx.fillStyle = this.colorKey;
            this.hitCtx.fillRect(x, y, w, h);
        }

        // draw HitCanvas rect
    }

    drawAsActive(scale, activeImgWidth) {
        this.scale = 1; // scale;

        const imgData = this.icon; // this.hasImage ? this.image : this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ; */

        /* const w = activeImgWidth / 10;
        const h = activeImgWidth / 10; */
        const w = imgData.width * activeImgWidth / 1000; // TODO if image returns check if this width should be still used
        const h = imgData.height * activeImgWidth / 1000;
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);


        if (this.isActive) {
            // console.log(`Active node while draw: ${this.name}}`);
            // console.log(this);
            this.ctx.globalAlpha = 1;

            this.ctx.drawImage(imgData, x, y, w, h);
            this.ctx.globalAlpha = 0.3;
            // ctx.rect(this.x,this.y, this.width/scale,this.height/scale);
            // ctx.stroke();
        } else if (this.isActiveNeighbour) {
            // console.log(`Neighbour node while draw: ${this.name}}`);
            // console.log(this);
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(imgData, x, y, w, h);
            this.ctx.globalAlpha = 0.3;
        }
        // draw HitCanvas rect
        this.hitCtx.fillStyle = this.colorKey;
        this.hitCtx.fillRect(x, y, w, h);
    }

    drawAsNeighbour(scale, activeImgWidth, value) {
        this.scale = 1; // scale;

        const imgData = this.icon; // this.hasImage ? this.image : this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ; */

        /* const w = (activeImgWidth / 10) * this.value;
        const h = (activeImgWidth / 10) * this.value; */
        const w = imgData.width * activeImgWidth / 1000 * this.value; // TODO if image returns check if this width should be still used
        const h = imgData.height * activeImgWidth / 1000 * this.value;
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);


        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(imgData, x, y, w, h);
        this.ctx.globalAlpha = 0.3;

        // draw HitCanvas rect
        this.hitCtx.fillStyle = this.colorKey;
        this.hitCtx.fillRect(x, y, w, h);
    }


    drawBorder(scale, imgWidth, activeImgWidth, cluster, borderWidth) {
        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale;
        const h = this.height; // scale;
        */

        const w = this.icon.width * (
            this.isActive
                ? activeImgWidth
                : this.isActiveNeighbour
                    ? activeImgWidth * this.value
                    : imgWidth
        ) / 1000;
        const h = this.icon.height * (
            this.isActive
                ? activeImgWidth
                : this.isActiveNeighbour
                    ? activeImgWidth * this.value
                    : imgWidth
        ) / 1000;
        /* const w = (this.isActive ? activeImgWidth : this.isActiveNeighbour ? activeImgWidth * this.value : imgWidth) / 10;
        const h = (this.isActive ? activeImgWidth : this.isActiveNeighbour ? activeImgWidth * this.value : imgWidth) / 10; */
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);

        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = borderWidth / 10 / scale;

        if ((this.cluster < cluster) || this.isActive || this.isActiveNeighbour) {
            // cluster represent
            this.ctx.strokeRect(x, y, w, h);
        } else {
            this.ctx.strokeRect(x, y, w / scale, h / scale);
            this.hitCtx.fillStyle = this.colorKey;
            this.hitCtx.fillRect(x, y, w / scale, h / scale);
        }
    }


    // unused cause of non-math method for findNodeUnderMouse
    /* contains(x, y, scale) {
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
    } */
}


class CanvasState {
    constructor(canvas, hitCanvas, socket) {
        this.socket = socket;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.hitCanvas = hitCanvas;
        this.hitCtx = hitCanvas.getContext('2d');

        // **** Keep track of state! ****
        this.kdtree = {};

        this._cluster = 90;

        this.valid = false; // when set to false, the canvas will redraw everything
        this.nodes = {}; // hash for all nodes
        this.colorHash = {}; // find nodes by color
        this.dragging = false; // Keep track of when we are dragging
        this.draggNode = false; // save the node for dragging

        // the current selected object. TODO  In the future we could turn this into an array for multiple selection
        this.selection = null;

        this.activeMode = false; // freeze for handling selection
        this.activeNode = false; // node while freeze

        this._scale = 20;
        this._imgScale = 5;
        this._activeImgScale = 30;
        this._borderWidth = 5;

        this.classify = false  // set via UI
        this.addNodeToClassify = null // UI set function here

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
        //this.canvas.onblur = this.blur;

        this.timerId = setInterval(() => this.draw(), this.interval);
    }

    set scale(value) {
        if (value < 1) this._scale = 1;
        else this._scale = value;
        this.valid = false;
        this.updateScaleUI(this.scale);
    }

    get scale() {
        return this._scale;
    }

    set imgScale(value) {
        if (value < 1) this._imgScale = 1;
        else this._imgScale = value;
        this.valid = false;
    }

    get imgScale() {
        return this._imgScale;
    }

    set activeImgScale(value) {
        if (value < 1) this._activeImgScale = 1;
        else this._activeImgScale = value;
        this.valid = false;
    }

    get activeImgScale() {
        return this._activeImgScale;
    }

    set borderWidth(value) {
        if (value < 1) this._borderWidth = 1;
        else this._borderWidth = value;
        this.valid = false;
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set cluster(value) {
        // console.log(this._cluster);
        if (value < 1) this._cluster = 1;
        else this._cluster = value;
        this.valid = false;
    }

    get cluster() {
        return this._cluster;
    }


    getScale = () => this.scale

    triggerDraw() {
        console.log('triggerDraw');
        this.valid = false;
    }


    addNode = (node) => {
        // console.log('Node addded');
        this.nodes[node.index] = node;
        this.colorHash[node.colorKey] = node.index;
        this.valid = false; // for redrawing
    }

    getNodes() {
        this.removeSelection(); // for updating values in links before sending
        return this.nodes;
    }


    range(minX, minY, maxX, maxY) {
        // TODO min x, max should be automatic
        const result = range(this.kdtree.ids, this.kdtree.coords, minX, minY, maxX, maxY, this.kdtree.nodeSize); // TODO is this fast?
        console.log('range');
        console.log(result);
    }

    resetStore() {
        this.nodes = {};
        this.colorHash = {};
        this.valid = false;
    }

    clear() {
        // move point 0,0 to middle of canvas
        this.ctx.resetTransform();

        // this.ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.scale(this.scale, this.scale);

        this.hitCtx.resetTransform();
        this.hitCtx.clearRect(0, 0, this.width, this.height);
        this.hitCtx.translate(this.translateX, this.translateY);
        this.hitCtx.scale(this.scale, this.scale);
    }

    draw = () => {
        // if our state is invalid, redraw and validate!
        if (!this.valid) {
            console.log('reDraw started');
            // const nodes = this.nodes;
            this.clear();

            // ** Add stuff you want drawn in the background all the time here **


            // if some nodes are active set other transparent
            if (this.selection) this.ctx.globalAlpha = 0.3;
            else this.ctx.globalAlpha = 1;

            // draw images
            Object.values(this.nodes).forEach((node) => {
                if (node.isActive) node.drawAsActive(this.scale, this.activeImgScale, this.cluster);
                else if (node.isActiveNeighbour) node.drawAsNeighbour(this.scale, this.activeImgScale, this.cluster);
                else node.draw(this.scale, this.imgScale, this.cluster);
            });

            // draw borders
            Object.values(this.nodes).forEach((node) => {
                node.drawBorder(this.scale, this.imgScale, this.activeImgScale, this.cluster, this.borderWidth);
            });

            // draw Tribles


            /*
            if (this.activeMode) {
                ctx.globalAlpha = 0.1;
                Object.values(this.nodes).map((node) => {
                    // TODO skip the drawing of elements that have moved off the screen:
                    if (node.isActive || node.isActiveNeighbour) ctx.globalAlpha = 1;
                    node.draw(ctx, this.scale);
                    if (node.isActive || node.isActiveNeighbour) ctx.globalAlpha = 0.1;
                });
            } else {
                ctx.globalAlpha = 1;

            }

            // enlarge coordinates
            // draw all nodes
            Object.values(this.nodes).map((node) => {
                // We can skip the drawing of elements that have moved off the screen:
                // TODO handle elements offside the screen

                if (node.isActive || node.isActiveNeighbour) ctx.globalAlpha = 1;
                node.draw(ctx, this.scale);
                if (node.isActive || node.isActiveNeighbour) ctx.globalAlpha = 1;
            });
*/
            // ** Add stuff you want drawn on top all the time here **


            this.valid = true;
        }
    }

    zoom = (wheelEvent) => {
        console.log('zoom event');
        wheelEvent.preventDefault();
        wheelEvent.stopPropagation();
        // console.log(wheelEvent)
        const nodeUnderMouse = this.findNodeByMousePosition(wheelEvent.offsetX, wheelEvent.offsetY);

        if (this.selection && nodeUnderMouse && nodeUnderMouse.isActiveNeighbour) {
            console.log('nodeUnderMouse');
            console.log(nodeUnderMouse.name);

            if (wheelEvent.deltaY < 0) {
                console.log('zoom in - image smaller');
                nodeUnderMouse.value -= 0.1;
            }

            // Zoom out = decrease = wheel down = positiv delta Y
            if (wheelEvent.deltaY > 0) {
                console.log('zoom out - image bigger');
                nodeUnderMouse.value += 0.1;
            }

            this.valid = false;
        } else {
            // Zoom in = increase = wheel up = negativ delta Y
            if (wheelEvent.deltaY < 0) {
                console.log('zoom in');
                // this.ctx.scale(2, 2); // TODO is this needed??
                this.scale += 1;
                this.cluster += 10;
            }

            // Zoom out = decrease = wheel down = positiv delta Y
            if (wheelEvent.deltaY > 0) {
                console.log('zoom out');
                // this.ctx.scale(0.5, 0.5);
                this.scale -= 1;// this.scale - 1;
                this.cluster -= 10;
            }
            this.valid = false;
        }

        // console.log(this.scale);
        // this.ctx.scale(this.scale, this.scale);
        return false;
    }

    findNodeByMousePosition(x, y) {
        // old math way
        /* // find 'first' node under click
        // slice makes copy of array
        // translate X/Y to node x/y
        const nodeX = (x - this.translateX) / this.scale;
        const nodeY = (y - this.translateY) / this.scale;
        return Object.values(this.nodes).slice(0).reverse().find(
            node => node.contains(nodeX, nodeY, this.scale),
        ); */
        const pixel = this.hitCtx.getImageData(x, y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const nodeId = this.colorHash[color];
        if (nodeId) {
            return this.nodes[nodeId];
        } return null;
    }

    selectNode(node) {
        // delete old node
        if (this.selection && this.selection !== node) this.removeSelection();
        this.selection = node;
        console.log('selected Node');
        console.log(node);
        // const activeNode = this.selection;
        // mark node as active
        this.selection.isActive = true;

        // load detail image
        /* if (!node.hasImage) {
            console.log('request image');
            socket.emit('requestImage', node.name);
        } */

        // mark neighbours
        Object.entries(node.links).forEach(([index, strength]) => {
            // console.log(n.target);
            const neighbour = this.nodes[index];

            if (neighbour) {
                // mark as neighbour of a active note
                neighbour.isActiveNeighbour = true;
                // set value from links to nodes
                neighbour.value = strength;
                // load neighbours detailed image
                // if (!this.nodes[n.target].hasImage) socket.emit('requestImage', { name: this.nodes[n.target].name, index: this.nodes[n.target].index });

                // console.error(`FOUND Neighbours ID: ${n.target} Name: ${this.nodes[n.target].name} Value: ${n.value} isActive ${this.nodes[n.target].isActiveNeighbour}`);
            } else {
                // TODO proper error handling - inform Katja that there is a link to a node that is not existing
                // console.error(`Neighbours ID: ${index} is not a not found in nodes`);
                // console.log(node)
            }
        });

        this.triggerDraw();
    }

    removeSelection() {
        const selectedNode = this.selection;

        // this.updateSelectionUI(false);

        // mark the neighbours as not active
        if (selectedNode) {
            // console.log("remove selection")
            // console.log(this.selection)

            // deactivated selected node
            selectedNode.isActive = false;

            // deactivated all neighbours
            Object.keys(selectedNode.links).forEach((index) => {
                const neighbour = this.nodes[index];

                if (neighbour) {
                    neighbour.isActiveNeighbour = false;
                    // update (new) values in links
                    selectedNode.links[index] = neighbour.value;
                    // n.value = neighbour.value;
                } else {
                    // TODO proper error handling - inform Katja that there is a link to a node that is not existing
                    // console.error(`Neighbours ID: ${index} is not a not found in nodes`);
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

        // console.log(this.hitCanvas.width);
        // console.log(this.hitCtx.width);
        // console.log(this.canvas.width);
        // console.log(this.ctx.width);
        const shiftKeyPressed = e.shiftKey;

        const ctrlKeyPressed = e.ctrlKey;
        const altKeyPressed = e.altKey;

        const nodeUnderMouse = this.findNodeByMousePosition(e.offsetX, e.offsetY);

        // TODO test if mouse hits Image and set their drag flag

        console.log('mousedown');
        // console.log(e.offsetX);
        // console.log(e.offsetY);
        console.log(this.classify)

        // save start position
        this.startX = e.offsetX;
        this.startY = e.offsetY;


        // if there is no mouse under mouse then move everything
        if (nodeUnderMouse) {
            this.draggNode = nodeUnderMouse;
            // freeze = activation Mode
            if (this.activeMode) {
                if (false) {
                    // remove neighbour
                    if (nodeUnderMouse.isActiveNeighbour) {
                        nodeUnderMouse.isActiveNeighbour = false;
                        // this.selection.neighbours = this.selection.neighbours.filter(item => item.target !== nodeUnderMouse.index);
                        delete this.selection.links[nodeUnderMouse.index]; // remove link
                        this.valid = false;
                    }
                    // add neighbour if node is is not active node
                    else if (this.selection !== nodeUnderMouse) {
                        // nodeUnderMouse.v = 5
                        // this.selection.neighbours.push({ target: nodeUnderMouse.index, value: 0.5 });
                        this.selection.links[nodeUnderMouse.index] = 0.5;
                        nodeUnderMouse.isActiveNeighbour = true;
                        nodeUnderMouse.value = 0.5;
                        this.valid = false;
                    }
                } else if (ctrlKeyPressed) {
                    // add to left /negatives
                    this.activeNode.negatives.push(nodeUnderMouse);
                } else if (altKeyPressed || shiftKeyPressed) {
                    // add to right // positives
                    this.activeNode.positives.push(nodeUnderMouse);
                }
            } else if(this.classify) {
                // add node to
                console.log("click while classify mode")
                this.addNodeToClassify(nodeUnderMouse)
            }
        } else {
            // if nothing is clicked
            this.dragging = true;
        }
    }

    handleMouseMove = (e) => {
        // other way for getting x/y
        /* const mousePos = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop
        }; */

        const mouseX = e.offsetX;
        const mouseY = e.offsetY;


        // there is a freeze and not freeze mode - different interaction based ob if a node is active or node
        const nodeUnderMouse = this.findNodeByMousePosition(mouseX, mouseY);

        if (nodeUnderMouse && !nodeUnderMouse.hasImage) this.socket.emit('requestImage', { name: nodeUnderMouse.name, index: nodeUnderMouse.index });


        if (this.draggNode || this.dragging) {
            // get mouse movement based on the last triggered event
            const moveX = mouseX - this.startX; // +80 means move 80px to right
            const moveY = mouseY - this.startY; // -50 means move 50 to top
            // console.log({ moveX, moveY });

            // save new mouse position for next event
            this.startX = mouseX;
            this.startY = mouseY;

            if (this.dragging) {
                this.translateX += moveX;
                this.translateY += moveY;
            } else if (this.draggNode) {
                // scale the X/Y
                const nodeX = moveX / this.scale;
                const nodeY = moveY / this.scale;

                this.draggNode.move(nodeX, nodeY);

                // drag neighbours in freeze mode
                if (this.activeMode && this.draggNode.isActive) {
                    Object.keys(this.draggNode.links).forEach((i) => {
                        const neighbour = this.nodes[i];
                        // todo error handling if the neighbour is not existing for katja
                        if (neighbour) neighbour.move(nodeX * neighbour.value, nodeY * neighbour.value);
                    });
                }
            }
            this.triggerDraw();
        } else if (!this.activeMode) {
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
        /*
        // move neighbours of active Node in freeze mode
        if (this.activeMode && this.draggNode.isActive) {

            // mouse is over a neighbour
            if (this.dragging.isActive || this.dragging.isActiveNeighbour) {
                // drag the node and al of his neighbour
                // TODO later the 'moving weighted with values# should be toggled with a button


                // console.log({ nodeX, nodeY });

                // change the Node position
                this.dragging.move(nodeX, nodeY);
                // console.log(this.dragging)
                if (this.dragging.isActive) {
                    // change position of neighbours
                    /!*this.dragging.neighbours.forEach((n) => {
                        const neighbour = this.nodes[n.target];
                        // todo their should not be a case where n.target is outside the array
                        if (neighbour) {
                            neighbour.move(nodeX * neighbour.value, nodeY * neighbour.value);
                        }
                    });*!/

                }

                this.valid = false;
            }
        } else if (this.dragging === true) {
           /!* console.log('dragging');
            const moveX = e.offsetX - this.startX; // +80 means move 80px to right
            const moveY = e.offsetY - this.startY; // -50 means move 50 to top
            // console.log({ moveX, moveY });
            this.startX = e.offsetX;
            this.startY = e.offsetY;


            // start drawing
            this.valid = false;*!/
        } else

        // mouse over empty area */
    }

    handleMouseUp = () => {
        console.log('mouseup');
        this.dragging = false;
        this.draggNode = false;
    }


    handleDoubleClick = () => {
        console.log('Double click');

        if (this.selection && !this.activeMode) {
            this.activeMode = true;
            this.activeNode = this.selection;
            // update ui
            this.updateSelectionUI(this.activeNode);
        } else if (this.activeMode) {
            this.updateSelectionUI(false);
            this.activeMode = false;
            this.activeNode = false;
        }
        this.triggerDraw();
    }
}

import RangeSlider from './RangeSlider';
import Triblets from './Triblets';
import Classifier from './Classifier';

export default {
    store: null,
    name: 'TsneMap',
    components: {
        RangeSlider,
        Triblets,
        Classifier,
    },
    data: () => ({
        exampleContent: 'This is TEXT',
        items: [],
        positives: [],
        negatives: [],
        // store: null,
        socket: null,
        scale: 0,
        labels: {},
        width: 0,
        height: 0,
        activeNode: {},
        cluster: 5, // default - set on mount from CanvasStore class
        imgWidth: 0, // default - set on mount from CanvasStore class
        activeImgWidth: 0, // default - set on mount from CanvasStore class
        borderWidth: 0, // default - set on mount from CanvasStore class
        range: 0,
        classify: false, // toggle classify mode on/off
        classifyNodes: [], // selected nodes for classification
    }),
    methods: {
        sendData() {
            console.log('send data clicked');
            const nodes = this.store.getNodes();
            // this.store.clear()
            this.store.resetStore();
            this.socket.emit('updateNodes', nodes);
        },

        //
        clusterMore() {
            // console.log("cluster more clicked")
            this.store.cluster -= 10; // update canvasState
            this.cluster = this.store.cluster; // update ui
        },
        clusterLess() {
            // console.log("cluster less clicked")
            this.store.cluster += 10; // update canvasState
            this.cluster = this.store.cluster; // update ui
        },


        updateSelection(node) {
            if (!node) {
                // deactivation
                this.activeNode = {};
            } else {
                this.activeNode = node;
            }
        },

        updateScale(scale) {
            this.scale = scale;
        },

        imgWidthMore() {
            this.store.imgScale += 1; // update canvasState
            this.imgWidth = this.store.imgScale; // update ui
        },
        imgWidthLess() {
            this.store.imgScale -= 1; // update canvasState
            this.imgWidth = this.store.imgScale; // update ui
        },

        activeImgWidthMore() {
            this.store.activeImgScale += 1; // update canvasState
            this.activeImgWidth = this.store.activeImgScale; // update ui
        },
        activeImgWidthLess() {
            this.store.activeImgScale -= 1; // update canvasState
            this.activeImgWidth = this.store.activeImgScale; // update ui
        },

        borderWidthMore() {
            this.store.borderWidth += 1; // update canvasState
            this.borderWidth = this.store.borderWidth; // update ui
        },
        borderWidthLess() {
            this.store.borderWidth -= 1; // update canvasState
            this.borderWidth = this.store.borderWidth; // update ui
        },
        toggleClassify() {
            console.log("classify clicked")
            this.classify = !this.classify
            this.store.classify = this.classify
            console.log(this.store.classify)
        },
        addNodeToClassify(node) {
            console.log("addNodeToClassify")
            console.log(node)
            if (this.classifyNodes.indexOf(node) === -1) this.classifyNodes.push(node)
        }
    },
    watch: {
        exampleContent(val, oldVal) {
            this.updateCanvas();
        },
        cluster(value) {
            console.log('change cluster');
            this.store.cluster = value;
        },
    },
    computed: {
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
            return this.activeNode.links && Object.keys(this.activeNode.links).length;
        },
        imageScale() {
            return this.store && this.store.selection && this.store.selection.imageScale;
        },
    },
    mounted() {
        const socket = io('http://localhost:3000');
        const canvas = document.getElementById('canvas');
        const parantWidth = canvas.parentNode.clientWidth * 0.8;
        const parantHeight = 700; // canvas.parentNode.clientHeight //* 0.8

        this.width = parantWidth;
        this.height = parantHeight;

        const hitCanvas = document.createElement('canvas');

        canvas.width = parantWidth;
        canvas.height = parantHeight;

        hitCanvas.width = parantWidth;
        hitCanvas.height = parantHeight;

        // const ctx = canvas.getContext('2d');
        const s = new CanvasState(canvas, hitCanvas, socket);

        this.store = s;

        s.updateSelectionUI = this.updateSelection;
        s.updateScaleUI = this.updateScale;
        s.addNodeToClassify = this.addNodeToClassify;

        // set init value in UI
        this.cluster = s.cluster;
        this.imgWidth = s.imgScale;
        this.activeImgWidth = s.activeImgScale;
        this.borderWidth = s.borderWidth;

        console.log('Save store');
        console.log(this.store);
        this.socket = socket;

        socket.on('connect', (soc) => {
            if (!soc) {
                console.log('no conection');
                console.log(soc);
            } else {
                console.log('conected'); // das wirft immer unde
                console.log(soc);
            }
            socket.emit('updateNodes', {});
            // s.clear() // maybe there is something inside?
        });

        socket.on('node', (data) => {
            console.log('receive node');
            console.log(data);
            if (data) {
                s.addNode(new Node(data, s.ctx, s.hitCtx, s.triggerDraw));
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

        socket.on('updateLabels', (data) => {
            console.log('updateLabels');
            console.log(data);
            this.labels = data;
        });

        socket.on('updateKdtree', (kdtree) => {
            console.log('updateKdtree');
            console.log(kdtree);
            s.kdtree = kdtree;
            // console.log(s.range(-5 ,-5 ,5 ,5))
        });
        // this.updateCanvas();
    },
    beforeDestroy() {
        if (this.socket) this.socket.disconnect();
        clearInterval(this.store.timerId);
    },
};
</script>

<style scoped>


    #canvas {
        margin: 5px;
        background-color: black;
    }
    #canvas.classify {
        cursor: cell;
    }

    .btn {
        align-self: center;
        text-decoration: none;
        margin: 0.5rem;
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

    .btn.active {
        color: #fff;
        background: #6772e5;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
    }

    .sub-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        height: 2.5rem;

        padding: 5px;

    }

    .body {
        width: 100%;
        height: 100%;
        /*background-color: rgb(255, 90, 75);*/
        /*//color: black;*/
        /*padding: 5px;*/
    }

    .details {
        width: 18%;
        height: 100%;
        margin: 5px;
        background-color: white;
    }

    .row {
        display: flex;

    }

    .row-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info-box {
        padding: 0.5rem;
    }

    .img {
        max-width: 100%;
        max-height: 20rem;
    }

    input {

    }

</style>
