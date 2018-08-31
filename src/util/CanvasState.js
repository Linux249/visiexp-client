import range from './range';
import { SVM, NEIGHBOURS } from './modes';
import Node from './Node';

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


        this.valid = true; // when set to false, the canvas will redraw everything
        this._valid = true;
        this.nodes = {}; // hash for all nodes
        this.colorHash = {}; // find nodes by color
        this.dragging = false; // Keep track of when we are dragging
        this.draggNode = false; // save the node for dragging

        // the current selected object.
        // TODO  In the future we could turn this into an array for multiple selection
        this.selection = null; // pointer to the activated node
        this.nodeOnMouseDown = false; // save node on mouseDown for check in mouseUp

        // K labels for development
        this.showKLabels = false;
        this.selectedLabel = null; // the choosen label for highlighten images
        this.selectedCategory = null; // the choosen Category
        this.labelColor = null; // updatet throud ui

        this.activeMode = false; // freeze for handling selection
        this.nodeUnderMouse = false; // is set (only!) on mouse move

        this.scissors = false;
        this.drawScissors = false;
        this.scissorsStartX = 0;
        this.scissorsStartY = 0;

        this.scissorsEndX = 0;
        this.scissorsEndY = 0;

        this._cluster = 50000;
        // this.updateClusterUI = null;
        this._scale = 20;
        // this._scale2 = 20; // vorher 0
        this._zoomStage = 0; // default zoom stage, 0 is the smalest pic
        // this.updateScaleUI = null;
        // this.updateScale2UI = null;
        this._imgSize = 0; // for adding higher img size as standart
        this._activeImgScale = 10;
        this._borderWidth = 5;

        this._scrollGrowth = 100; // vorher 20
        this.scaleStage = [20, 50, 100, 200, 400, 800, 1600, 3200];
        this._scrollImgGrowth = 1.1;
        this._clusterGrowth = 1.2;

        // this.interval = 100;
        //
        // this.offsetLeft = canvas.getBoundingClientRect().left;
        // this.offsetTop = canvas.getBoundingClientRect().top;

        this.translateX = this.width / 2;
        this.translateY = this.height / 2;

        this.startX = null;
        this.startY = null;
        // this.ctx.translate(this.translateX / 2, this.translateY / 2);
        // this.ctx.scale(this.scale, this.scale);


        // add event listener
        this.canvas.onmousedown = e => this.handleMouseDown(e);
        this.canvas.onmousemove = e => this.handleMouseMove(e);
        this.canvas.onmouseup = e => this.handleMouseUp(e);
        this.canvas.ondblclick = e => this.handleDoubleClick(e);
        this.canvas.onwheel = e => this.zoom(e);

        this.sortedNodes = [];
        this.sorted = false;
        // this.canvas.onblur = this.blur;
        // this.timerId = setInterval(() => this.draw(), this.interval);
        this.sizeRange = 3;
    }

    set sizeRange(v) {
        if (v < 0) this._sizeRange = 0;
        else this._sizeRange = v;
        this.triggerDraw();
    }

    get sizeRange() {
        return this._sizeRange;
    }

    set scale(value) {
        if (value < 20) this._scale = 20;
        else this._scale = Math.round(value);
        this.triggerDraw();
        this.ui.scale = this.scale;
    }

    get scale() {
        return this._scale;
    }
    /*

    set scale2(value) {
        if (value < 0) this._scale2 = 0;
        else if (value > 9) this._scale2 = 9;
        else this._scale2 = value;
        this.triggerDraw();
        this.ui.scale2 = this.scale2;
    }

    get scale2() {
        return this._scale2;
    }
    */

    set zoomStage(value) {
        if (value < 0) this._zoomStage = 0;
        // else if (value > 9) this._zoomStage = 9;
        else this._zoomStage = value;
        this.triggerDraw();
        this.ui.zoomLvl = this.zoomStage;
    }

    get zoomStage() {
        return this._zoomStage;
    }

    set imgSize(value) {
        if (!(value < 0)) this._imgSize = value;
        this.triggerDraw();
    }

    get imgSize() {
        return this._imgSize;
    }

    set translateX(value) {
        this._translateX = Math.round(value);
        this.ui.translateX = value;
    }

    get translateX() {
        return this._translateX;
    }

    set translateY(value) {
        this._translateY = Math.round(value);
        this.ui.translateY = value;
    }

    get translateY() {
        return this._translateY;
    }

    set activeImgScale(value) {
        if (value < 1) this._activeImgScale = 1;
        else this._activeImgScale = value;
        this.triggerDraw();
    }

    get activeImgScale() {
        return this._activeImgScale;
    }

    set borderWidth(value) {
        if (value < 0) this._borderWidth = 0;
        else this._borderWidth = value;
        this.triggerDraw();
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set cluster(value) {
        // console.log(this._cluster);
        if (value < 1) this._cluster = 1;
        else this._cluster = value;
        this.triggerDraw();
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
        // let i;
        // TODO so wird jeder neue draw ausgetzt weil der alte noch läuft
        if (!v && this.valid) window.requestAnimationFrame(() => this.draw2());
        // console.log(i)
        // if (i > 2) window.cancelAnimationFrame(i)
        this._valid = v;
    }

    get valid() {
        return this._valid;
    }

    triggerDraw() {
        this.valid = false;
    }

    doubleNodes() {
        const l = Object.keys(this.nodes).length;
        const e = Math.random() * 2 - 1;
        console.log(l);
        Object.values(this.nodes).map((node, i) => {
            const index = l + i;
            const newNode = { x: (i % 2) ? node.x - e : node.x + e, y: (i % 2) ? node.y - e : node.y + e, ...node };
            newNode.index = index;
            console.log({ newNode, node, index });
            this.addNode(newNode);
        });
        console.log(this.nodes);
    }


    clearGroup() {
        Object.values(this.nodes).forEach(node => (node.group ? node.group = false : null));
        this.triggerDraw()
    }

    groupNodesByIds(ids = []) {
        this.clearGroup();
        ids.forEach(id => this.nodes[id].group = true);
        this.triggerDraw();
    }

    // return the id's of all nodes with group flag
    getGroupeIds() {
        const ids = [];
        Object.values(this.nodes).forEach(node => (node.group ? ids.push(node.index) : null));
        return ids;
    }


    addNode(node) {
        // TODO der NodeArray könnte bereits inistalisert sein oder?
        // TODO wie initaliseren ? https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/fill

        this.nodes[node.index] = node;
        this.colorHash[`rgb(${node.colorKey[0]},${node.colorKey[1]},${node.colorKey[2]})`] = node.index;
        this.triggerDraw(); // for redrawing
    }

    updateNodes(nodes) {
        nodes.forEach((node) => {
            this.nodes[node.id].x = node.x;
            this.nodes[node.id].y = node.y;
        });
        this.triggerDraw();
    }

    getNodes() {
        const nodes = {};
        Object.values(this.nodes).forEach(({ index, x, y, name, negatives, positives, links, labels }, i) => {
            nodes[i] = { index, x, y, name, negatives, positives, links, labels };
        });
        return nodes;
    }

    getNodesSimple() {
        return Object.values(this.nodes).map(({ index, x, y }) => ({ id: index, x, y }));
    }

    getNode(i) {
        return this.nodes[i];
    }


    range(minX, minY, maxX, maxY) {
        // TODO min x, max should be automatic
        const result = range(this.kdtree.ids,
            this.kdtree.coords, minX, minY, maxX, maxY, this.kdtree.nodeSize);
        console.log('range');
        console.log(result);
    }

    resetStore() {
        this.nodes = {};
        this.colorHash = {};
        this.triggerDraw();
    }

    sortNodes() {
        this.sorted = !this.sorted;
        if (!this.sortedNodes.length) {
            console.time('sortNodes');
            this.sortedNodes = Object.values(this.nodes).sort((a, b) => {
                console.log(a.cliqueLen - b.cliqueLen);
                return a.cliqueLen - b.cliqueLen;
            });
            // nodes.forEach(node => console.log(`name: ${node.name}: ${node.cliqueLen}`))
            console.timeEnd('sortNodes');
        }
        this.triggerDraw();
    }

    clear() {
        // move point 0,0 to middle of canvas
        // console.log(this.ctx)
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.scale(this.scale, this.scale);
        // console.log(this.ctx)
        console.log(this.translateX, this.translateY);

        // same on hit ctx
        this.hitCtx.resetTransform();
        this.hitCtx.clearRect(0, 0, this.width, this.height);
        this.hitCtx.translate(this.translateX, this.translateY);
        this.hitCtx.scale(this.scale, this.scale);
    }

    /* draw() {
        // if our state is invalid, redraw and validate!
        if (!this.valid) {
            console.time('draw');
            console.time('nextFrameAfterDraw');
            // const nodes = this.nodes;
            this.clear();


            // if some nodes are active set other transparent
            // if (this.selection) this.ctx.globalAlpha = 0.3;
            // else this.ctx.globalAlpha = 1;
            if (this.selection) {
                console.log('SELECTION WHILE DRAW');
                const links = Object.keys(this.selection.links);
                console.log(this.selection);
                console.log(links);

                this.ctx.globalAlpha = 0.2;

                Object.values(this.nodes).forEach((node) => {
                    if (node === this.selection) {
                        console.log('ACKTIVE NODE');
                        console.log(node);
                        this.ctx.globalAlpha = 1;
                        node.drawAsActive(this.scale, this.activeImgScale);
                        this.ctx.globalAlpha = 0.2;
                    } else if (this.selection.links[node.index]) {
                        console.log('LINKED NODE');
                        this.ctx.globalAlpha = 1;
                        node.drawAsNeighbour(
                            this.scale,
                            this.activeImgScale,
                            this.selection.links[node.index],
                        );
                        this.ctx.globalAlpha = 0.2;
                    } else if (this.cluster < node.cluster) { // TODO add cluster mode
                        node.drawClusterd(this.scale, this.scale2, this.imgScale, this.cluster);
                    } else node.draw(this.scale, this.scale2, this.imgScale, this.cluster);
                });

                this.ctx.globalAlpha = 1;
            } else {
                // draw images
                Object.values(this.nodes).forEach((node) => {
                    // if node is clustered dont draw and draw pixel instead
                    if (this.cluster < node.cluster) { // TODO add cluster mode
                        node.drawClusterd(this.scale, this.scale2, this.imgScale, this.cluster);
                    } else node.draw(this.scale, this.scale2, this.imgScale, this.cluster);
                });
            }


            // draw borders
            if (this.showKLabels) {
                // draw borders
                Object.values(this.nodes).forEach((node) => {
                    node.drawBorder(
                        this.scale,
                        this.imgScale,
                        this.activeImgScale,
                        this.cluster,
                        this.borderWidth);
                });
            } else if (this.selectedLabel) {
                Object.values(this.nodes).forEach((node) => {
                    if (node.labels.indexOf(this.selectedLabel) !== -1) {
                        node.drawBorder(
                            this.scale,
                            this.imgScale,
                            this.activeImgScale,
                            this.cluster,
                            this.borderWidth,
                            this.labelColor);
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
            this.valid = true;
            console.timeEnd('draw');
            requestAnimationFrame(() => console.timeEnd('nextFrameAfterDraw'));
        }
    }
*/

    drawHitmap() {
        console.time('drawHitmap');

        const canvasW = this.width,
            canvasH = this.height,
            tx = this.translateX, // verschiebung des Nullpunktes im Raum
            ty = this.translateY,
            zoomStage = this.zoomStage,
            scale = this.scale; // skalierung der x,y Koordinaten
        const canvasPixel = new Uint8ClampedArray(canvasW * canvasH * 4);
        // console.log({ canvasW, canvasH, tx, ty, scale });

        const rankSize = this.ui.sizeRanked;
        const nodes = this.sorted ? this.sortedNodes : Object.values(this.nodes);

        nodes.forEach((node) => {
            // start x,y ist x *scale + translateX
            const nodeX = Math.floor(node.x * scale + tx);
            const nodeY = Math.floor(node.y * scale + ty);

            let imgSize = rankSize ? zoomStage + Math.floor(node.rank * this.sizeRange) : zoomStage;
            imgSize += this.imgSize; // add imgSize from user input
            if (imgSize < 0) imgSize = 0;
            if (imgSize > 14) imgSize = 14;

            const img = node.imageData[imgSize];
            // console.log(img)
            const imgW = img.width;
            const imgH = img.height;
            const inside = nodeX > 0 && nodeY > 0 && nodeX < (canvasW - imgW) && nodeY < (canvasH - imgH);


            // test if image obj exists
            if (img && inside) {
                // cluster
                if (node.cluster < this.cluster) {
                    // wir gehen durch alle reihen des bildes
                    for (let row = 0; row < imgH; row += 1) {
                        const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                        // wir laufen durch alle spalten des bildes und betrachten dann 4 werte im array
                        for (let col = 0; col < imgW; col += 1) {
                            const c = canvasRow + col * 4;
                            const p = (row * imgW + col) * 4;
                            canvasPixel[c] = node.colorKey[0]; // R
                            canvasPixel[c + 1] = node.colorKey[1]; // G
                            canvasPixel[c + 2] = node.colorKey[2]; // B
                            canvasPixel[c + 3] = 255; //
                        }
                    }
                } else {
                    // drawcluster
                    let c = (nodeY * canvasW + nodeX) * 4;
                    canvasPixel[c] = node.colorKey[0];
                    canvasPixel[c + 1] = node.colorKey[1];
                    canvasPixel[c + 2] = node.colorKey[2];
                    canvasPixel[c + 3] = 255;
                    c = (nodeY * canvasW + nodeX + 1) * 4;
                    canvasPixel[c] = node.colorKey[0];
                    canvasPixel[c + 1] = node.colorKey[1];
                    canvasPixel[c + 2] = node.colorKey[2];
                    canvasPixel[c + 3] = 255;
                    c = (nodeY * canvasW + canvasW + nodeX) * 4;
                    canvasPixel[c] = node.colorKey[0];
                    canvasPixel[c + 1] = node.colorKey[1];
                    canvasPixel[c + 2] = node.colorKey[2];
                    canvasPixel[c + 3] = 255;
                    c = (nodeY * canvasW + canvasW + nodeX + 1) * 4;
                    canvasPixel[c] = node.colorKey[0];
                    canvasPixel[c + 1] = node.colorKey[1];
                    canvasPixel[c + 2] = node.colorKey[2];
                    canvasPixel[c + 3] = 255;
                }
            } else if (inside) {
                console.error('Bild scheint nicht fertig geladen');
                console.log(node);
                console.log(zoomStage);
            }
        });

        const pic = new ImageData(canvasPixel, canvasW, canvasH);
        const ctx = this.ui.toggle ? this.ctx : this.hitCtx;
        ctx.resetTransform();
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.putImageData(pic, 0, 0);

        // console.log(pic);
        // console.log(canvasPixel);


        // console.log({ w, h, tx, ty, pixel });
        console.timeEnd('drawHitmap');
    }

    draw2() {
        console.time('draw2');

        const canvasW = this.width,
            canvasH = this.height,
            tx = this.translateX, // wird auf die node x,y aufaddiert
            ty = this.translateY,
            zoomStage = this.zoomStage,
            scale = this.scale;// node x,y werden multipliziert
        const canvasPixel = new Uint8ClampedArray(canvasW * canvasH * 4);
        // console.log({ canvasW, canvasH, tx, ty, scale });

        const drawBoarder = this.ui.boarderRanked;
        const rankSize = this.ui.sizeRanked;
        const borderW = 1;
        const gradient = this.ui.gradient;
        const nodes = this.sorted ? this.sortedNodes : Object.values(this.nodes);

        nodes.forEach((node) => {
            // start x,y ist x *scale + translateX
            // console.log(node)
            // console.log(zoomStage)
            const canvasX = Math.floor(node.x * scale + tx);
            const canvasY = Math.floor(node.y * scale + ty);

            let imgSize = rankSize ? zoomStage + Math.floor(node.rank * this.sizeRange) : zoomStage;
            imgSize += this.imgSize; // add imgSize from user input
            if (imgSize < 0) imgSize = 0;
            if (imgSize > 14) imgSize = 14;

            const img = node.imageData[imgSize];
            // console.log(img)
            const iw = img.width;
            const ih = img.height;
            const inside = canvasX > borderW && canvasY > borderW && canvasX < (canvasW - iw - borderW) && canvasY < (canvasH - ih - borderW);

            // test if image obj exists
            if (img && inside) {
                // cluster
                if (node.cluster < this.cluster) {
                    const imgData = img.data;
                    // wir gehen durch alle reihen des bildes
                    for (let row = 0; row < ih; row += 1) {
                        const canvasRow = ((canvasY + row) * canvasW + canvasX) * 4;
                        // copy row to pixel
                        // wir laufen durch alle spalten des bildes und betrachten dann 4 werte im array
                        for (let col = 0; col < iw; col += 1) {
                            const c = canvasRow + col * 4;
                            const p = (row * iw + col) * 4;
                            // if(c > canvasW * canvasH * 4) console.error("CRY")
                            canvasPixel[c] = imgData[p]; // R
                            canvasPixel[c + 1] = imgData[p + 1]; // G
                            canvasPixel[c + 2] = imgData[p + 2]; // B

                            canvasPixel[c + 3] ? canvasPixel[c + 3] += 10 * node.cliqueLen : canvasPixel[c + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                        }
                    }

                    if (drawBoarder) {
                        const color = gradient[node.cliqueLen];
                        // draw boarder
                        for (let row = -2; row <= ih + 1; row += 1) {
                            const canvasRow = ((canvasY + row) * canvasW + canvasX) * 4;
                            if (row === -2 || row === ih + 1) {
                                // draw top line r
                                for (let col = 0; col < iw; col += 1) {
                                    const c = canvasRow + col * 4;
                                    canvasPixel[c] = color[0]; // R
                                    canvasPixel[c + 1] = color[1]; // G
                                    canvasPixel[c + 2] = color[2]; // B
                                    canvasPixel[c + 3] = 200; // ? canvasPixel[c + 3] += 10 : canvasPixel[c + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                                }
                            } else {
                                // draw left boarder
                                const l = canvasRow - 8;
                                canvasPixel[l] = color[0]; // R
                                canvasPixel[l + 1] = color[1]; // G
                                canvasPixel[l + 2] = color[2]; // B
                                canvasPixel[l + 3] = 200; // ? canvasPixel[l + 3] += 10 : canvasPixel[l + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A

                                // draw left boarder
                                const r = canvasRow + (iw + 1) * 4;
                                canvasPixel[r] = color[0]; // R
                                canvasPixel[r + 1] = color[1]; // G
                                canvasPixel[r + 2] = color[2]; // B
                                canvasPixel[r + 3] = 200; // ? canvasPixel[r + 3] += 10 : canvasPixel[r + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                            }
                        }
                    }

                    if (this.selectedCategory && this.selectedLabel && this.selectedLabel === node.labels[this.selectedCategory]) {
                        const color = [0, 0, 140];
                        // draw boarder
                        for (let row = -2; row <= ih + 1; row += 1) {
                            const canvasRow = ((canvasY + row) * canvasW + canvasX) * 4;
                            if (row === -2 || row === ih + 1) {
                                // draw top line r
                                for (let col = 0; col < iw; col += 1) {
                                    const c = canvasRow + col * 4;
                                    canvasPixel[c] = color[0]; // R
                                    canvasPixel[c + 1] = color[1]; // G
                                    canvasPixel[c + 2] = color[2]; // B
                                    canvasPixel[c + 3] = 200; // ? canvasPixel[c + 3] += 10 : canvasPixel[c + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                                }
                            } else {
                                // draw left boarder
                                const l = canvasRow - 8;
                                canvasPixel[l] = color[0]; // R
                                canvasPixel[l + 1] = color[1]; // G
                                canvasPixel[l + 2] = color[2]; // B
                                canvasPixel[l + 3] = 200; // ? canvasPixel[l + 3] += 10 : canvasPixel[l + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A

                                // draw left boarder
                                const r = canvasRow + (iw + 1) * 4;
                                canvasPixel[r] = color[0]; // R
                                canvasPixel[r + 1] = color[1]; // G
                                canvasPixel[r + 2] = color[2]; // B
                                canvasPixel[r + 3] = 200; // ? canvasPixel[r + 3] += 10 : canvasPixel[r + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                            }
                        }
                    }
                } else {
                    // drawcluster
                    let c = (canvasY * canvasW + canvasX) * 4;
                    canvasPixel[c] = 210;
                    canvasPixel[c + 1] = 210;
                    canvasPixel[c + 2] = 210;
                    canvasPixel[c + 3] = 255;
                    c = (canvasY * canvasW + canvasX + 1) * 4;
                    canvasPixel[c] = 210;
                    canvasPixel[c + 1] = 210;
                    canvasPixel[c + 2] = 210;
                    canvasPixel[c + 3] = 255;
                    c = (canvasY * canvasW + canvasW + canvasX) * 4;
                    canvasPixel[c] = 210;
                    canvasPixel[c + 1] = 210;
                    canvasPixel[c + 2] = 210;
                    canvasPixel[c + 3] = 255;
                    c = (canvasY * canvasW + canvasW + canvasX + 1) * 4;
                    canvasPixel[c] = 210;
                    canvasPixel[c + 1] = 210;
                    canvasPixel[c + 2] = 210;
                    canvasPixel[c + 3] = 255;
                }
            } else if (inside) {
                console.error('Bild scheint nicht fertig geladen');
                console.log(node);
                console.log(zoomStage);
            }
        });


        // TODO use color user can choose in UI + add choose color in UI
        const lineColor = [225, 225, 115]; // let s = '#ffff73'
        nodes.forEach((node) => {
            // start x,y ist x *scale + translateX

            // TODO test perfomance if the group-marks are bedder collected in the first loop
            // in an array and draw after
            if (node.group) {
                const canvasX = Math.floor(node.x * scale + tx);
                const canvasY = Math.floor(node.y * scale + ty);

                let imgSize = rankSize ? zoomStage + Math.floor(node.rank * this.sizeRange) : zoomStage;
                imgSize += this.imgSize; // add imgSize from user input
                if (imgSize < 0) imgSize = 0;
                if (imgSize > 14) imgSize = 14;

                const img = node.imageData[imgSize];
                // console.log(img)
                const iw = img.width;
                const ih = img.height;

                const inside = canvasX > borderW && canvasY > borderW && canvasX < (canvasW - iw - borderW) && canvasY < (canvasH - ih - borderW);

                if (img && inside) {
                    const h = Math.ceil(ih / 10);
                    const w = Math.ceil(iw / 10);
                    // wir gehen durch alle reihen des bildes
                    for (let row = 0; row < h; row += 1) {
                        const canvasRow = ((canvasY + ih + h + row) * canvasW + canvasX - w) * 4;
                        // copy row to pixel
                        // wir laufen durch alle spalten des bildes und betrachten dann 4 werte im array
                        for (let col = 0; col < iw + 2 * w; col += 1) {
                            const c = canvasRow + col * 4;
                            // if(c > canvasW * canvasH * 4) console.error("CRY")
                            canvasPixel[c] = lineColor[0]; // R
                            canvasPixel[c + 1] = lineColor[1]; // G
                            canvasPixel[c + 2] = lineColor[2]; // B
                            canvasPixel[c + 3] = 225; // ? canvasPixel[c + 3] += 10 * node.cliqueLen : canvasPixel[c + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                        }
                    }

                    if (drawBoarder) {
                        const color = gradient[node.cliqueLen];
                        // draw boarder
                        for (let row = -2; row <= ih + 1; row += 1) {
                            const canvasRow = ((canvasY + row) * canvasW + canvasX) * 4;
                            if (row === -2 || row === ih + 1) {
                                // draw top line r
                                for (let col = 0; col < iw; col += 1) {
                                    const c = canvasRow + col * 4;
                                    canvasPixel[c] = color[0]; // R
                                    canvasPixel[c + 1] = color[1]; // G
                                    canvasPixel[c + 2] = color[2]; // B
                                    canvasPixel[c + 3] = 200; // ? canvasPixel[c + 3] += 10 : canvasPixel[c + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                                }
                            } else {
                                // draw left boarder
                                const l = canvasRow - 8;
                                canvasPixel[l] = color[0]; // R
                                canvasPixel[l + 1] = color[1]; // G
                                canvasPixel[l + 2] = color[2]; // B
                                canvasPixel[l + 3] = 200; // ? canvasPixel[l + 3] += 10 : canvasPixel[l + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A

                                // draw left boarder
                                const r = canvasRow + (iw + 1) * 4;
                                canvasPixel[r] = color[0]; // R
                                canvasPixel[r + 1] = color[1]; // G
                                canvasPixel[r + 2] = color[2]; // B
                                canvasPixel[r + 3] = 200; // ? canvasPixel[r + 3] += 10 : canvasPixel[r + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                            }
                        }
                    }

                    if (this.selectedCategory && this.selectedLabel && this.selectedLabel === node.labels[this.selectedCategory]) {
                        const color = [0, 0, 140];
                        // draw boarder
                        for (let row = -2; row <= ih + 1; row += 1) {
                            const canvasRow = ((canvasY + row) * canvasW + canvasX) * 4;
                            if (row === -2 || row === ih + 1) {
                                // draw top line r
                                for (let col = 0; col < iw; col += 1) {
                                    const c = canvasRow + col * 4;
                                    canvasPixel[c] = color[0]; // R
                                    canvasPixel[c + 1] = color[1]; // G
                                    canvasPixel[c + 2] = color[2]; // B
                                    canvasPixel[c + 3] = 200; // ? canvasPixel[c + 3] += 10 : canvasPixel[c + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                                }
                            } else {
                                // draw left boarder
                                const l = canvasRow - 8;
                                canvasPixel[l] = color[0]; // R
                                canvasPixel[l + 1] = color[1]; // G
                                canvasPixel[l + 2] = color[2]; // B
                                canvasPixel[l + 3] = 200; // ? canvasPixel[l + 3] += 10 : canvasPixel[l + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A

                                // draw left boarder
                                const r = canvasRow + (iw + 1) * 4;
                                canvasPixel[r] = color[0]; // R
                                canvasPixel[r + 1] = color[1]; // G
                                canvasPixel[r + 2] = color[2]; // B
                                canvasPixel[r + 3] = 200; // ? canvasPixel[r + 3] += 10 : canvasPixel[r + 3] = 50 + zoomStage * 50;// imgData[p + 3]; // A
                            }
                        }
                    }
                } else if (inside) {
                    console.error('Bild scheint nicht fertig geladen');
                    console.log(node);
                    console.log(zoomStage);
                }
            }


            // test if image obj exists
        });

        if (this.drawScissors) {
            const canvasX = this.scissorsStartX < this.scissorsEndX ? this.scissorsStartX : this.scissorsEndX;
            const canvasY = this.scissorsStartY < this.scissorsEndY ? this.scissorsStartY : this.scissorsEndY;

            const w = Math.abs(this.scissorsEndX - this.scissorsStartX);
            const h = Math.abs(this.scissorsEndY - this.scissorsStartY);


            // '#3882ff';
            const color = [56, 130, 255];

            for (let row = 0; row < h; row += 1) {
                const canvasRow = ((canvasY + row) * canvasW + canvasX) * 4;

                for (let col = 0; col < w; col += 1) {
                    const c = canvasRow + col * 4;
                    if (row === 0 || row === h - 1) {
                        // draw top line r

                        canvasPixel[c] = color[0]; // R
                        canvasPixel[c + 1] = color[1]; // G
                        canvasPixel[c + 2] = color[2]; // B
                        canvasPixel[c + 3] = 255;
                    } else if (col === 0 || col === w - 1) {
                        // draw left boarder
                        const l = canvasRow;
                        canvasPixel[l] = color[0]; // R
                        canvasPixel[l + 1] = color[1]; // G
                        canvasPixel[l + 2] = color[2]; // B
                        canvasPixel[l + 3] = 255;

                        // draw left boarder
                        const r = canvasRow + (w - 1) * 4;
                        canvasPixel[r] = color[0]; // R
                        canvasPixel[r + 1] = color[1]; // G
                        canvasPixel[r + 2] = color[2]; // B
                        canvasPixel[r + 3] = 255;
                    }
                }
            }
        }

        const pic = new ImageData(canvasPixel, canvasW, canvasH);
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.putImageData(pic, 0, 0);

        // console.log(pic);
        // console.log(canvasPixel);


        // console.log({ w, h, tx, ty, pixel });
        console.timeEnd('draw2');
        requestAnimationFrame(() => this.drawHitmap());
        this.valid = true;
        if (this.ui.showHeatmap) requestAnimationFrame(this.ui.drawHeatmap);
        if (this.ui.showNavMap) requestAnimationFrame(this.ui.drawNavMapRect);
        if (this.ui.showNavHeatmap) requestAnimationFrame(this.ui.drawNavHeatmapRect);
    }

    zoom(wheelEvent) {
        // console.log('zoom event');
        wheelEvent.preventDefault();
        wheelEvent.stopPropagation();
        // console.log(wheelEvent)
        const nodeUnderMouse = this.nodeUnderMouse;

        // if there is a selection and the mouse is over a link
        // TODO test if this.selection.links[nodeUnderMouse.index] exists for cleaner statment
        if (this.selection && this.selection.links[nodeUnderMouse.index]) {
            const i = nodeUnderMouse.index;
            const links = this.selection.links;
            if (wheelEvent.deltaY < 0) {
                console.log('zoom in - image smaller');
                links[i] -= 0.1;
            }

            // Zoom out = decrease = wheel down = positiv delta Y
            if (wheelEvent.deltaY > 0) {
                console.log('zoom out - image bigger');
                links[i] += 0.1;
            }
            if (links[i] < 0.1) links[i] = 0.1;
            if (links[i] > 1) links[i] = 1;
            this.triggerDraw();
        } else {
            const oldScale = this.scale;
            const mouseX = wheelEvent.offsetX;
            const mouseY = wheelEvent.offsetY;
            // console.log({ mouseX, mouseY });
            // get mouse movement based on the last triggered event
            const offsetX = (mouseX - this.translateX) / oldScale; // +80 means move 80px to right
            const offsetY = (mouseY - this.translateY) / oldScale; // -50 means move 50 to top
            // console.log({ offsetX, offsetY });

            // Zoom in = increase = wheel up = negativ delta Y
            if (wheelEvent.deltaY < 0) {
                console.log('zoom in');
                // this.scale2 += 1;
                this.scale += 20; // *= 2; // this.scaleStage[this.zoomStage] || this.scaleStage[this.scaleStage.length - 1];
                this.zoomStage += 1;
                this.cluster *= this.clusterGrowth;
            }

            // Zoom out = decrease = wheel down = positiv delta Y
            if (wheelEvent.deltaY > 0) {
                console.log('zoom out');
                // this.scale2 -= 1;
                this.scale -= 20; // /= 2; // this.scaleStage[this.zoomStage] || this.scaleStage[this.scaleStage.length - 1];
                this.zoomStage -= 1;
                this.cluster /= this.clusterGrowth;
            }


            const scaleChange = this.scale - oldScale;
            this.translateX -= offsetX * scaleChange;
            this.translateY -= offsetY * scaleChange;

            this.triggerDraw();
        }
        return false;
    }

    findNodeByMousePosition(x, y) {
        const pixel = this.hitCtx.getImageData(x, y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const nodeId = this.colorHash[color];
        // console.log({ x, y });
        // console.log(pixel);
        if (nodeId >= 0) {
            return this.nodes[nodeId];
        }
        return false;
    }

    handleMouseDown(e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        // console.log(e)

        console.log('mousedown');
        // console.log(e.offsetX);
        // console.log(e.offsetY);

        // console.log(this.hitCanvas.width);
        // console.log(this.hitCtx.width);
        // console.log(this.canvas.width);
        // console.log(this.ctx.width);


        // saving for checking if node was clicked in handleMouseUp
        const nodeUnderMouse = this.nodeUnderMouse;
        this.nodeOnMouseDown = nodeUnderMouse;

        // save start position
        this.startX = e.offsetX;
        this.startY = e.offsetY;


        // if there is no mouse under mouse then move everything
        if (nodeUnderMouse) {
            this.draggNode = nodeUnderMouse;
        } else if (this.scissors) {
            console.log('Scissors');
            // save start X/Y
            this.drawScissors = true;
            this.scissorsStartX = this.startX;
            this.scissorsStartY = this.startY;
            this.triggerDraw();
        } else {
            // if nothing is clicked
            this.dragging = true;
        }
    }


    handleMouseMove(e) {
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
            this.triggerDraw();
        }


        // there is a freeze and not freeze mode -
        // different interaction based ob if a node is active or node
        const nodeUnderMouse = this.findNodeByMousePosition(mouseX, mouseY);
        this.nodeUnderMouse = nodeUnderMouse;
        this.ui.activeNode = nodeUnderMouse;
        // load high resoultion image
        if (nodeUnderMouse && !nodeUnderMouse.hasImage) this.socket.emit('requestImage', { name: nodeUnderMouse.name, index: nodeUnderMouse.index });

        // DRAG AND DROP
        if (this.draggNode || this.dragging) {
            // get mouse movement based on the last triggered event
            const moveX = mouseX - this.startX; // +80 means move 80px to right
            const moveY = mouseY - this.startY; // -50 means move 50 to top
            // console.log({ moveX, moveY });

            // save new mouse position for next event
            this.startX = mouseX;
            this.startY = mouseY;

            if (this.dragging) {
                // console.log("dragging")
                // move the x/y
                this.translateX += moveX;
                this.translateY += moveY;
            } else if (this.draggNode) {
                // console.log("draggeNode")
                // scale the X/Y
                const nodeX = moveX / this.scale;
                const nodeY = moveY / this.scale;

                // drag hole group
                if (this.draggNode.group) {
                    Object.values(this.nodes).forEach((node) => {
                        if (node.group) node.move(nodeX, nodeY);
                    });
                } else {
                    // drag only one node
                    this.draggNode.move(nodeX, nodeY);
                }

                // drag neighbours in freeze mode
                if (this.selection && this.selection === this.draggNode) {
                    Object.entries(this.selection.links).forEach(([i, strength]) => {
                        const neighbour = this.nodes[i];
                        // todo error handling if the neighbour is not existing for katja
                        if (neighbour) neighbour.move(nodeX * strength, nodeY * strength);
                    });
                }
            }
            this.triggerDraw();
        }

        // mouse over empty area
    }

    handleMouseUp(e) {
        console.log('mouseup');
        const nodeUnderMouse = this.nodeUnderMouse;
        const ctrlKeyPressed = e.ctrlKey;
        // const shiftKeyPressed = e.shiftKey;
        // const altKeyPressed = e.altKey;
        if (nodeUnderMouse && nodeUnderMouse === this.nodeOnMouseDown) {
            // click event on a special node - do something
            console.log('click on node:');
            console.log(nodeUnderMouse);

            // marke node as group in every case
            if (ctrlKeyPressed) nodeUnderMouse.group = !nodeUnderMouse.group;
            // used for components for adding nodes to special cases
            this.ui.clickedNode = nodeUnderMouse;
            switch (this.ui.$route.name) {
            case SVM:
                break;
            case NEIGHBOURS:
                if (this.selection && this.selection !== this.nodeUnderMouse && ctrlKeyPressed) {
                    console.log('Add or remove link');
                    const links = Object.keys(this.selection.links);
                    const i = this.nodeUnderMouse.index;
                    console.log({ i, links });
                    if (this.selection.links[i]) {
                        console.log('remove link');
                        delete this.selection.links[i];
                    } else {
                        console.log('Add link');
                        this.selection.links[i] = 0.5;
                    }
                    console.log(this.selection);
                }
                break;
            default:
                console.log('no mode selected - what to do with a node click now?');
            }
        }

        // there is a selection and this is not the activeNode


        this.dragging = false;
        this.draggNode = false;

        if (this.scissors) {
            this.ui.cuttedNodes = [];
            const startX = (this.scissorsStartX - this.translateX) / this.scale;
            const startY = (this.scissorsStartY - this.translateY) / this.scale;
            const endX = (this.scissorsEndX - this.translateX) / this.scale;
            const endY = (this.scissorsEndY - this.translateY) / this.scale;
            // console.log({startX, startY})
            // console.log({endX, endY})
            Object.values(this.nodes).forEach((node) => {
                // console.log(node)
                // check for all nodes if they are inside the rectangle
                if ((node.x > startX && node.x < endX) || (node.x < startX && node.x > endX)) {
                    if ((node.y < startY && node.y > endY) || (node.y > startY && node.y < endY)) {
                        this.ui.cuttedNodes.push(node);
                        node.group = true;
                    }
                }
            });

            // reset
            this.scissors = false;
            this.ui.scissors = false;
            this.drawScissors = false;
            // TODO handle object in scissors rectangle
        }
        this.triggerDraw();
    }


    handleDoubleClick() {
        console.log('Double click');
        if (this.nodeUnderMouse && this.nodeUnderMouse !== this.selection) {
            this.selection = this.nodeUnderMouse;
        } else this.selection = null;
        this.triggerDraw();
    }
}
