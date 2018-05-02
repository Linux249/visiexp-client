import range from './range';
import { SVM } from './modes';

export default class CanvasState {
    constructor(canvas, hitCanvas, socket, ui) {
        this.socket = socket;

        this.ui = ui;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.hitCanvas = hitCanvas;
        this.hitCtx = hitCanvas.getContext('2d');

        // **** Keep track of state! ****
        this.kdtree = {};


        this.valid = false; // when set to false, the canvas will redraw everything
        this._valid = false;
        this.nodes = {}; // hash for all nodes
        this.colorHash = {}; // find nodes by color
        this.dragging = false; // Keep track of when we are dragging
        this.draggNode = false; // save the node for dragging

        // the current selected object. TODO  In the future we could turn this into an array for multiple selection
        this.selection = null;
        this.nodeUnderMouse = null;

        // K labels for development
        this.showKLabels = false;
        this.selectedLabel = null; // the choosen label for highlighten images
        this.labelColor = null; // updatet throud ui

        this.activeMode = false; // freeze for handling selection
        this.activeNode = false; // node while freeze

        this.scissors = false;
        this.drawScissors = false;
        this.scissorsStartX = 0;
        this.scissorsStartY = 0;

        this.scissorsEndX = 0;
        this.scissorsEndY = 0;

        this._cluster = 500;
        this.updateClusterUI = null;
        this._scale = 20;
        this._scale2 = 20;
        this.updateScaleUI = null;
        this.updateScale2UI = null;
        this._imgScale = 12;
        this._activeImgScale = 5;
        this._borderWidth = 5;

        this._scrollGrowth = 1.3;
        this._scrollImgGrowth = 1.1;
        this._clusterGrowth = 1.2;

        this.classify = false; // set via UI
        this.addNodeToClassify = null; // UI set function here

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
        this.canvas.ondblclick = this.handleDoubleClick;
        this.canvas.onwheel = this.zoom;
        // this.canvas.onblur = this.blur;
        // this.timerId = setInterval(() => this.draw(), this.interval);
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

    set scale2(value) {
        if (value < 1) this._scale = 1;
        else this._scale2 = value;
        this.valid = false;
        this.updateScale2UI(this.scale2);
    }

    get scale2() {
        return this._scale2;
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
        if (value < 0) this._borderWidth = 0;
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
        this.ui.cluster = this.cluster;
    }

    get cluster() {
        return this._cluster;
    }

    set scrollGrowth(v) {
        if (v <= 1) this._scrollGrowth = 1.01;
        else this._scrollGrowth = v;
    }

    get scrollGrowth() {
        return this._scrollGrowth;
    }

    set scrollImgGrowth(v) {
        if (v <= 1) this._scrollImgGrowth = 1.01;
        else this._scrollImgGrowth = v;
    }

    get scrollImgGrowth() {
        return this._scrollImgGrowth;
    }

    get clusterGrowth() {
        return this._clusterGrowth;
    }

    set clusterGrowth(v) {
        if (v <= 1) this._clusterGrowth = 1.01;
        else this._clusterGrowth = v;
        this.ui.clusterGrowth = this.clusterGrowth;
    }

    set valid(v) {
        if (!v) window.requestAnimationFrame(this.draw);
        this._valid = v;
    }

    get valid() {
        return this._valid;
    }

    triggerDraw() {
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
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.scale(this.scale, this.scale);

        // same on hit ctx
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
            // if (this.selection) this.ctx.globalAlpha = 0.3;
            // else this.ctx.globalAlpha = 1;

            // draw images
            Object.values(this.nodes).forEach((node) => {
                // if (node.isActive) node.drawAsActive(this.scale, this.activeImgScale, this.cluster);
                // else if (node.isActiveNeighbour) node.drawAsNeighbour(this.scale, this.activeImgScale, this.cluster);
                // else

                // if node is clustered dont draw and draw pixel instead
                if (this.cluster < node.cluster) {
                    node.drawClusterd(this.scale, this.scale2, this.imgScale, this.cluster);
                } else node.draw(this.scale, this.scale2, this.imgScale, this.cluster);
            });

            if (this.showKLabels) {
                // draw borders
                Object.values(this.nodes).forEach((node) => {
                    node.drawBorder(this.scale, this.imgScale, this.activeImgScale, this.cluster, this.borderWidth);
                });
            } else if (this.selectedLabel) {
                Object.values(this.nodes).forEach((node) => {
                    if (node.labels.indexOf(this.selectedLabel) !== -1) {
                        node.drawBorder(this.scale, this.imgScale, this.activeImgScale, this.cluster, this.borderWidth, this.labelColor);
                    }
                });
            }

            if (this.drawScissors) {
                const x = (this.scissorsStartX - this.translateX) / this.scale;
                const y = (this.scissorsStartY - this.translateY) / this.scale;
                const w = (this.scissorsEndX - this.scissorsStartX) / this.scale;
                const h = (this.scissorsEndY - this.scissorsStartY) / this.scale;

                this.ctx.strokeStyle = '#3882ff';
                this.ctx.lineWidth = 2 / this.scale;

                this.ctx.strokeRect(x, y, w, h);
                this.ctx.globalAlpha = 0.2;
                this.ctx.fillRect(x, y, w, h);
                this.ctx.globalAlpha = 1.0;
            }

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
            const mouseX = wheelEvent.offsetX;
            const mouseY = wheelEvent.offsetY;
            // get mouse movement based on the last triggered event
            const offsetX = (mouseX - this.translateX) / this.scale; // +80 means move 80px to right
            const offsetY = (mouseY - this.translateY) / this.scale; // -50 means move 50 to top
            // console.log({ moveX, moveY });

            // console.log("mouse position")
            // console.log({mouseX, mouseY})
            // console.log("Offset - distanz to null point ")
            // console.log({offsetX, offsetY})
            // console.log("nullpoint position")
            // console.log(this.translateX, this.translateY)


            const oldScale = this.scale;

            // Zoom in = increase = wheel up = negativ delta Y
            if (wheelEvent.deltaY < 0) {
                console.log('zoom in');

                this.scale *= this.scrollGrowth;
                this.scale2 *= this.scrollImgGrowth;
                this.cluster *= this.clusterGrowth;
            }

            // Zoom out = decrease = wheel down = positiv delta Y
            if (wheelEvent.deltaY > 0) {
                console.log('zoom out');

                this.scale /= this.scrollGrowth;
                this.scale2 /= this.scrollImgGrowth;
                this.cluster /= this.clusterGrowth;
            }
            const scaleChange = this.scale - oldScale;
            this.translateX -= offsetX * scaleChange;
            this.translateY -= offsetY * scaleChange;

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
        if (nodeId >= 0) {
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
        // saving node under mouse while mouseDown
        this.nodeUnderMouse = nodeUnderMouse;

        // TODO test if mouse hits Image and set their drag flag

        console.log('mousedown');
        // console.log(e.offsetX);
        // console.log(e.offsetY);
        console.log(this.classify);

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
            } else if (this.classify) {
                // add node to
                console.log('click while classify mode');
                this.addNodeToClassify(nodeUnderMouse);
            }
        } else if (this.scissors) {
            console.log('Scissors');
            // save start X/Y
            this.drawScissors = true;
            this.scissorsStartX = this.startX;
            this.scissorsStartY = this.startY;
            this.valid = false;
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

        if (this.scissors) {
            this.scissorsEndX = mouseX;
            this.scissorsEndY = mouseY;
            this.valid = false;
        }


        // there is a freeze and not freeze mode - different interaction based ob if a node is active or node
        const nodeUnderMouse = this.findNodeByMousePosition(mouseX, mouseY);

        // load high resoultion image
        if (nodeUnderMouse && !nodeUnderMouse.hasImage) this.socket.emit('requestImage', { name: nodeUnderMouse.name, index: nodeUnderMouse.index });

        if (!this.activeMode) {
            if (nodeUnderMouse) this.ui.activeNode = nodeUnderMouse;
            else this.ui.activeNode = false;
        }


        if (this.draggNode || this.dragging) {
            // get mouse movement based on the last triggered event
            const moveX = mouseX - this.startX; // +80 means move 80px to right
            const moveY = mouseY - this.startY; // -50 means move 50 to top
            // console.log({ moveX, moveY });

            // save new mouse position for next event
            this.startX = mouseX;
            this.startY = mouseY;

            if (this.dragging) {
                // move the x/y
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

    handleMouseUp = (e) => {
        console.log('mouseup');
        const nodeUnderMouse = this.findNodeByMousePosition(e.offsetX, e.offsetY);
        if (nodeUnderMouse === this.nodeUnderMouse) {
            // click event on a special node - do something
            this.ui.clickedNode = nodeUnderMouse;
            console.log('click on node');
            switch (this.ui.$route.name) {
            case SVM:
                break;
            default:
                console.log('no mode selected - what to do with a node click now?');
            }
        }


        this.dragging = false;
        this.draggNode = false;

        if (this.scissors) {
            this.scissors = false;
            this.drawScissors = false;
            this.ui.scissors = false;
            this.valid = false;
            // TODO handle object in scissors rectangle
        }
    }


    handleDoubleClick = () => {
        console.log('Double click');

        if (this.selection && !this.activeMode) {
            this.activeMode = true;
            this.ui.activeNode = this.activeNode;
            // this.activeNode = this.selection;
            // update ui
        } else if (this.activeMode) {
            this.ui.activeNode = false;
            this.activeNode = false;
            // this.activeMode = false;
        }
        this.triggerDraw();
    }
}
