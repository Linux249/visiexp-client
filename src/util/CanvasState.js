import supercluster from 'supercluster';
import { SVM, LABELS, NEIGHBOURS } from './modes';

export default class CanvasState {
    constructor(canvas, hitCanvas, socket, ui) {
        this.socket = socket;

        this.ui = ui;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // this.hitCanvas = hitCanvas;
        this.hitCtx = hitCanvas.getContext('2d');

        // **** Keep track of state! ****
        this.kdtree = {};

        this.valid = true; // when set to false, the canvas will redraw everything
        this._valid = true;
        this.nodes = {}; // hash for all nodes
        this.colorHash = {}; // find nodes by color
        this.panning = false; // Keep track of when we are dragging
        this.draggNode = false; // save the node for dragging

        // the current selected object.
        // TODO  In the future we could turn this into an array for multiple selection
        // this.selection = null; // pointer to the activated node
        this.nodeOnMouseDown = false; // save node on mouseDown for check in mouseUp

        // K labels for development
        // this.showKLabels = false;
        this.selectedLabel = null; // the choosen label for highlighten images
        this.selectedCategory = null; // the choosen Category
        // this.labelColor = null; // updatet throud ui

        this.activeMode = false; // freeze for handling selection
        this.nodeUnderMouse = false; // is set (only!) on mouse move

        this.scissors = false;
        this.drawScissors = false;
        this.scissorsStartX = 0;
        this.scissorsStartY = 0;

        this.scissorsEndX = 0;
        this.scissorsEndY = 0;

        this._cluster = 100;
        this._clusterRadius = 2;
        this.supercluster = supercluster(); // TODO check best init for this var
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

        this.maxZoomLvl = 20;

        this.moveGroupToMouse = false;

        // array of node index's
        this.groupNeighbours = {};
        this.removedGroupNeighbours = {};

        // performance messure
        this.maxDrawTime = 0;
        this.maxHitMapTime = 0;
        this.perfLogs = {
            draw: [],
            hitmap: [],
        };
        this.scaleTest = false;
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
        else if (value > this.maxZoomLvl) this._zoomStage = this.maxZoomLvl;
        else this._zoomStage = value;
        this.triggerDraw();
        this.ui.zoomLvl = this._zoomStage;
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

    set clusterRadius(value) {
        if (value < 1) this._clusterRadius = 1;
        else this._clusterRadius = value;
    }

    get clusterRadius() {
        return this._clusterRadius;
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
            const newNode = {
                x: i % 2 ? node.x - e : node.x + e,
                y: i % 2 ? node.y - e : node.y + e,
                ...node,
            };
            newNode.index = index;
            console.log({ newNode, node, index });
            this.addNode(newNode);
        });
        console.log(this.nodes);
    }

    createSuperCluster() {
        console.time('create geoPoints');
        const geoPoints = Object.values(this.nodes).map(n => ({
            type: 'Feature',
            geometry: {
                // https://tools.ietf.org/html/rfc7946#section-3.1.2
                type: 'Point',
                coordinates: [n.x, n.y],
            },
            properties: {
                index: n.index,
            },
        }));
        console.timeEnd('create geoPoints');
        console.log(geoPoints);

        // TODO find the best radius

        // calculated the supercluster
        console.time('build superClusterIndex');
        this.supercluster = supercluster({
            radius: this.clusterRadius,
            maxZoom: this.maxZoomLvl,
            extend: 10,
            log: true,
        });
        this.supercluster.load(geoPoints);
        console.timeEnd('build superClusterIndex');
        console.log(this.supercluster);

        // testing

        /* const notClusterd = [];
        const clusterd = [];
        cluster.forEach((e) => {
            if (e.properties.index) {
                notClusterd.push(e.properties.index);
            }
        });
        cluster.forEach((e) => {
            if (e.id) {
                clusterd.push(e);
                console.log(e);
                const geclustert = superClusterIndex.getLeaves(e.id);
                console.log(geclustert);
                geclustert.forEach((c, i) => {
                    console.log(`${c.properties.index} ${notClusterd.includes(c.properties.index)}`);
                });
                // test tile: tile never get results...
                /!* console.log("TILE")
                const tile = superClusterIndex.getTile(zoomStage, e.geometry.coordinates[0], e.geometry.coordinates[1])
                console.log(tile) *!/
                // find represent: test if fist value suits
            }
        });
        console.log('not clustered items count');
        console.log(notClusterd.length);
        console.log('cluster count');
        console.log(clusterd.length); */
        this.updateClustering(true);
        this.triggerDraw();
    }

    updateClustering(init) {
        function distance(v1, v2) {
            return Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);
        }
        // TODO remove after right implementation
        if (!this.supercluster) return;
        console.time('get cluster');
        const {
            zoomStage,
            scale,
            width: canvasW,
            height: canvasH,
            translateX: tx,
            translateY: ty,
        } = this;

        const rect = [-tx / scale, -ty / scale, (canvasW - ty) / scale, (canvasH - ty) / scale];

        // get clustering for curretn section (viewbox)
        const cluster = this.supercluster.getClusters(rect, zoomStage);
        console.timeEnd('get cluster');
        // console.log(rect);
        // console.log(cluster);

        console.time('update cluster on nodes');
        console.log(cluster);
        cluster.forEach((c) => {
            const { index, cluster_id } = c.properties;
            if (index) {
                // this is a not clustered point
                this.nodes[index].isClusterd = false;
            } else if (cluster_id) {
                // this is a cluster
                const pointsInsideCluster = this.supercluster.getLeaves(c.id, Infinity);
                if (init) console.log(c);
                if (init) console.log(c.geometry.coordinates);
                // TODO find represent
                // represent is first item LOL
                let centroidId = null;
                let min = Infinity;
                // set all points in cluster to false + check distance
                pointsInsideCluster.forEach((p) => {
                    const node = this.nodes[p.properties.index];
                    node.isClusterd = true;
                    if (init) console.log([node.x, node.y]);
                    if (init) console.log(p.geometry.coordinates);
                    const dist = distance(p.geometry.coordinates, c.geometry.coordinates);
                    if (init) console.log(dist);
                    if (dist < min) {
                        min = dist;
                        centroidId = p.properties.index;
                    }
                });
                if (init) console.log({ centroidId, min });
                // set centroid as represent
                this.nodes[centroidId].isClusterd = false;
            }
        });
        console.timeEnd('update cluster on nodes');
    }

    clearGroup() {
        Object.values(this.nodes).forEach((node) => {
            if (node.group) {
                node.group = false;
                node.groupId = 0;
            }
        });
        this.triggerDraw();
    }

    groupNodesByGroupId(groupId) {
        Object.values(this.nodes).forEach(node => (node.group = node.groupId === groupId));
        this.triggerDraw();
    }

    addLabeledToGroup(label) {
        Object.values(this.nodes).forEach(
            node => (node.labels.includes(label) ? (node.group = true) : null),
        );
        this.triggerDraw();
    }

    // return the id's of all nodes with group flag
    getGroupeIds() {
        const ids = [];
        Object.values(this.nodes).forEach(node => (node.group ? ids.push(node.index) : null));
        return ids;
    }

    moveGroupToPosition(x, y) {
        Object.values(this.nodes).forEach((node) => {
            if (node.group) {
                node.x += (x - node.x) / 2;
                node.y += (y - node.y) / 2;
            }
        });
        this.triggerDraw();
    }

    updateGroupNeighbours(neighbours) {
        this.groupNeighbours = neighbours;
        this.removedGroupNeighbours = {};
        this.triggerDraw();
    }

    resetGroupNeighbours() {
        this.groupNeighbours = {};
        this.removedGroupNeighbours = {};
        this.triggerDraw();
    }

    addNode(node) {
        // TODO der NodeArray könnte bereits inistalisert sein oder?
        // TODO wie initaliseren ? https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/fill

        this.nodes[node.index] = node;
        this.colorHash[`rgb(${node.colorKey[0]},${node.colorKey[1]},${node.colorKey[2]})`] = node.index;
        this.triggerDraw(); // for redrawing
    }

    updateNodes(nodes) {
        Object.values(nodes).forEach((node) => {
            this.nodes[node.index].x = node.x;
            this.nodes[node.index].y = node.y;
            if (node.labels) this.nodes[node.index].labels = node.labels;
        });
        this.triggerDraw();
    }

    getNodes() {
        const nodes = {};
        Object.values(this.nodes).forEach(
            ({
                index, x, y, name, negatives, positives, links, labels,
            }) => {
                nodes[index] = {
                    index,
                    x,
                    y,
                    name,
                    negatives,
                    positives,
                    links,
                    labels,
                };
            },
        );
        return nodes;
    }

    getNodesSimple() {
        // TODO check perfomance: what is faster?
        // return Object.values(this.nodes).map(({ index, x, y }) => ({ id: index, x, y }));
        const nodes = {};
        Object.values(this.nodes).forEach(({ index, x, y }) => (nodes[index] = { index, x, y }));
        return nodes;
    }

    getNode(i) {
        return this.nodes[i];
    }

    /* range(minX, minY, maxX, maxY) {
        // TODO min x, max should be automatic
        const result = range(
            this.kdtree.ids,
            this.kdtree.coords,
            minX,
            minY,
            maxX,
            maxY,
            this.kdtree.nodeSize,
        );
        console.log('range');
        console.log(result);
    } */

    /* resetStore() {
        this.nodes = {};
        this.colorHash = {};
        this.triggerDraw();
    } */

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

    // TODO test automatic draw effects like animation, zoom
    toggleScaleTest() {
        this.scaleTest = !this.scaleTest;
        requestAnimationFrame(this.scaleTestDraw);
        return this.scaleTest;
    }

    scaleTestDraw = () => {
        if (this.scaleTest) {
            console.log('scaleTestDraw');
            requestAnimationFrame(this.scaleTestDraw);
        }
    };
    /* clear() {
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
    } */

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

    /* drawHitmap() {
        // TODO merge draw hitmap to draw2
        const startTime = window.performance.now();

        const canvasW = this.width;

        const canvasH = this.height;

        const tx = this.translateX;
        // verschiebung des Nullpunktes im Raum

        const ty = this.translateY;

        const { zoomStage, scale } = this;

        const hitmapPixel = new Uint8ClampedArray(canvasW * canvasH * 4);

        const { sizeRanked: rankSize, clusterMode } = this.ui;
        const nodes = this.sorted ? this.sortedNodes : Object.values(this.nodes);

        const neighbourMode = this.ui.$route.name === LABELS;

        nodes.forEach((node) => {
            // start x,y ist x *scale + translateX

            let imgSize = rankSize ? zoomStage + Math.floor(node.rank * this.sizeRange) : zoomStage;
            imgSize += this.imgSize; // add imgSize from user input
            if (imgSize < 0) imgSize = 0;
            if (imgSize > 14) imgSize = 14;
            if (clusterMode && !node.isClusterd) imgSize += 5;

            const img = node.imageData[imgSize];
            if (!img) return console.error(`no image for node: ${node.id}exists`);
            const imgW = img.width;
            const imgH = img.height;
            const nodeX = Math.floor(node.x * scale + tx - imgW / 2);
            const nodeY = Math.floor(node.y * scale + ty - imgH / 2);
            const inside = nodeX > 0 && nodeY > 0 && nodeX < canvasW - imgW && nodeY < canvasH - imgH;

            // check if the image is allowed to draw in certain rules
            let show = true;
            // 1. Rule: some labels can be selected as "not show this"
            node.labels.forEach((nodeLabel, i) => {
                if (nodeLabel && this.ui.labels[i]) {
                    this.ui.labels[i].labels.forEach((e) => {
                        if (e && !e.show && e.name === nodeLabel) show = false;
                    });
                }
            });

            // 2. if neighbours mode:  check if node is not grouped
            if (neighbourMode && !node.group) {
                // the node should not be in the neighbours list
                const neighbour = this.groupNeighbours[node.index];
                if (!neighbour || neighbour > this.ui.groupNeighboursThreshold) show = false;
            }

            // test if image obj exists
            if (show && inside) {
                // cluster
                // wir gehen durch alle reihen des bildes
                for (let row = 0; row < imgH; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    // wir laufen durch alle spalten des bildes
                    // und betrachten dann 4 werte im array
                    for (let col = 0; col < imgW; col += 1) {
                        const c = canvasRow + col * 4;
                        // const p = (row * imgW + col) * 4;
                        hitmapPixel[c] = node.colorKey[0]; // R
                        hitmapPixel[c + 1] = node.colorKey[1]; // G
                        hitmapPixel[c + 2] = node.colorKey[2]; // B
                        hitmapPixel[c + 3] = 255; //
                    }
                }
            }
        });

        const pic = new ImageData(hitmapPixel, canvasW, canvasH);
        const ctx = this.ui.toggle ? this.ctx : this.hitCtx;
        ctx.resetTransform();
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.putImageData(pic, 0, 0);

        // console.log(pic);
        // console.log(canvasPixel);

        // console.log({ w, h, tx, ty, pixel });
        // console.timeEnd('drawHitmap');
        const endTime = window.performance.now();
        const time = endTime - startTime;
        this.perfLogs.hitmap.push(time);
        if (time > this.maxHitMapTime) {
            this.maxHitMapTime = time;
            console.warn('new max hit map time');
            console.warn(this.maxHitMapTime);
        }
    } */

    draw2() {
        // console.time('draw2');
        const startTime = window.performance.now();

        // TODO Performance tests

        // TODO kd tree
        // TODO 1. kdtree-range test for generating node id's
        // TODO 2. update kdtree test (after D&D)

        // TODO kmeans perfomance test
        // TODO 1. calc 50 k-means wirh kdtree results

        const {
            zoomStage,
            scale,
            width: canvasW,
            height: canvasH,
            translateX: tx,
            translateY: ty,
        } = this;
        const canvasPixel = new Uint8ClampedArray(canvasW * canvasH * 4);
        const hitmapPixel = new Uint8ClampedArray(canvasW * canvasH * 4);
        // console.log({ canvasW, canvasH, tx, ty, scale });

        const {
            boarderRanked: drawBoarder, sizeRanked: rankSize, gradient, clusterMode,
        } = this.ui;
        const borderW = 1;
        const nodes = this.sorted ? this.sortedNodes : Object.values(this.nodes);

        // check if it is NEIGHBOUR mode
        const neighbourMode = this.ui.$route.name === LABELS;

        if (clusterMode) this.updateClustering();

        nodes.forEach((node) => {
            let imgSize = rankSize ? zoomStage + Math.floor(node.rank * this.sizeRange) : zoomStage;
            imgSize += this.imgSize; // add imgSize from user input
            if (clusterMode && !node.isClusterd) imgSize += 5;
            // TODO min, max size should be be configurable via class props
            if (imgSize < 0) imgSize = 0;
            if (imgSize > 14) imgSize = 14;

            const img = node.imageData[imgSize];
            if (!img) return console.error(`no image for node: ${node.id}exists`);

            const iw = img.width;
            const ih = img.height;

            const nodeX = Math.floor(node.x * scale + tx - iw / 2);
            const nodeY = Math.floor(node.y * scale + ty - ih / 2);

            // nothing to do if the image is outside the canvas
            const inside = nodeX > borderW
                && nodeY > borderW
                && nodeX < canvasW - iw - borderW
                && nodeY < canvasH - ih - borderW;
            if (!inside) return;

            // check if the image is allowed to draw in certain rules
            let show = true;

            // 1. Rule: some labels can be selected as "not show this"
            node.labels.forEach((nodeLabel, i) => {
                if (nodeLabel && this.ui.labels[i]) {
                    this.ui.labels[i].labels.forEach((e) => {
                        if (e && !e.show && e.name === nodeLabel) show = false;
                    });
                }
            });

            // 2. if neighbours mode:  check if node is not grouped
            if (neighbourMode && !node.group) {
                // the node should not be in the neighbours list
                const neighbour = this.groupNeighbours[node.index];
                if (!neighbour || neighbour > this.ui.groupNeighboursThreshold) show = false;
            }

            // cluster
            // if (node.cluster < this.cluster) {
            // if (true) {
            const imgData = img.data;
            // wir gehen durch alle reihen des bildes
            // TODO shift left/top

            if (show) {
                // loop through rows in img
                for (let row = 0; row < ih; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    // loop through column in img
                    for (let col = 0; col < iw; col += 1) {
                        const c = canvasRow + col * 4;
                        const p = (row * iw + col) * 4;
                        canvasPixel[c] = imgData[p]; // R
                        canvasPixel[c + 1] = imgData[p + 1]; // G
                        canvasPixel[c + 2] = imgData[p + 2]; // B
                        canvasPixel[c + 3] = canvasPixel[c + 3]
                            ? canvasPixel[c + 3] + 10 * node.cliqueLen
                            : 50 + zoomStage * 50;

                        // draw hitmap
                        hitmapPixel[c] = node.colorKey[0]; // R
                        hitmapPixel[c + 1] = node.colorKey[1]; // G
                        hitmapPixel[c + 2] = node.colorKey[2]; // B
                        hitmapPixel[c + 3] = 255; //
                    }
                }
            }

            if (drawBoarder) {
                const color = gradient[node.cliqueLen];
                // draw boarder
                for (let row = -2; row <= ih + 1; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    if (row === -2 || row === ih + 1) {
                        // draw top line r
                        for (let col = 0; col < iw; col += 1) {
                            const c = canvasRow + col * 4;
                            canvasPixel[c] = color[0]; // R
                            canvasPixel[c + 1] = color[1]; // G
                            canvasPixel[c + 2] = color[2]; // B
                            canvasPixel[c + 3] = 200;
                        }
                    } else {
                        // draw left boarder
                        const l = canvasRow - 8;
                        canvasPixel[l] = color[0]; // R
                        canvasPixel[l + 1] = color[1]; // G
                        canvasPixel[l + 2] = color[2]; // B
                        canvasPixel[l + 3] = 200;

                        // draw left boarder
                        const r = canvasRow + (iw + 1) * 4;
                        canvasPixel[r] = color[0]; // R
                        canvasPixel[r + 1] = color[1]; // G
                        canvasPixel[r + 2] = color[2]; // B
                        canvasPixel[r + 3] = 200;
                    }
                }
            }

            const labelBorder = this.selectedCategory
                && this.selectedLabel
                && this.selectedLabel === node.labels[this.selectedCategory];
            if (labelBorder) {
                const { color } = this.ui.labels[this.selectedCategory].labels.find(
                    e => e.name === this.selectedLabel,
                );
                // draw boarder
                for (let row = -2; row <= ih + 1; row += 1) {
                    const canvasRow = ((nodeY + row) * canvasW + nodeX) * 4;
                    if (row === -2 || row === ih + 1) {
                        // draw top line r
                        for (let col = 0; col < iw; col += 1) {
                            const c = canvasRow + col * 4;
                            canvasPixel[c] = color[0]; // R
                            canvasPixel[c + 1] = color[1]; // G
                            canvasPixel[c + 2] = color[2]; // B
                            canvasPixel[c + 3] = 200;
                        }
                    } else {
                        // draw left boarder
                        const l = canvasRow - 8;
                        canvasPixel[l] = color[0]; // R
                        canvasPixel[l + 1] = color[1]; // G
                        canvasPixel[l + 2] = color[2]; // B
                        canvasPixel[l + 3] = 200;

                        // draw left boarder
                        const r = canvasRow + (iw + 1) * 4;
                        canvasPixel[r] = color[0]; // R
                        canvasPixel[r + 1] = color[1]; // G
                        canvasPixel[r + 2] = color[2]; // B
                        canvasPixel[r + 3] = 200;
                    }
                }
            }
            /* } else {
                // drawcluster
                let c = (nodeY * canvasW + nodeX) * 4;
                canvasPixel[c] = 210;
                canvasPixel[c + 1] = 210;
                canvasPixel[c + 2] = 210;
                canvasPixel[c + 3] = 255;
                c = (nodeY * canvasW + nodeX + 1) * 4;
                canvasPixel[c] = 210;
                canvasPixel[c + 1] = 210;
                canvasPixel[c + 2] = 210;
                canvasPixel[c + 3] = 255;
                c = (nodeY * canvasW + canvasW + nodeX) * 4;
                canvasPixel[c] = 210;
                canvasPixel[c + 1] = 210;
                canvasPixel[c + 2] = 210;
                canvasPixel[c + 3] = 255;
                c = (nodeY * canvasW + canvasW + nodeX + 1) * 4;
                canvasPixel[c] = 210;
                canvasPixel[c + 1] = 210;
                canvasPixel[c + 2] = 210;
                canvasPixel[c + 3] = 255;
            } */
        });

        // DRAW UNDLINE FOR GROUPED NODES
        // TODO use color user can choose in UI + add choose color in UI
        // const groupColor = [225, 225, 115];
        // const neighbourColor = [225, 225, 115];
        const neighbourColor = [250, 208, 44]; // yellow
        const groupColor = [40, 33, 32]; // black
        // const groupColor = [195,230,203];  // bootstrap green
        // const label2Color = [153, 0, 51];

        nodes.forEach((node) => {
            const neighbour = this.groupNeighbours[node.index];
            // TODO Perfomance is maybe bedder without another loop

            // draw only if group, label2 or neighbour
            if (!node.group && (!neighbour || neighbour > this.ui.groupNeighboursThreshold)) return;

            const lineColor = neighbour ? neighbourColor : groupColor;

            let imgSize = rankSize ? zoomStage + Math.floor(node.rank * this.sizeRange) : zoomStage;
            imgSize += this.imgSize;
            if (imgSize < 0) imgSize = 0;
            if (imgSize > 14) imgSize = 14;
            if (clusterMode && !node.isClusterd) imgSize += 5;

            const img = node.imageData[imgSize];
            if (!img) return console.error(`no image for node: ${node.id}exists`);
            const iw = img.width;
            const ih = img.height;

            const nodeX = Math.floor(node.x * scale + tx - iw / 2);
            const nodeY = Math.floor(node.y * scale + ty - ih / 2);
            const inside = nodeX > borderW
                && nodeY > borderW
                && nodeX < canvasW - iw - borderW
                && nodeY < canvasH - ih - borderW;

            if (inside) {
                const h = Math.ceil(ih / 10);
                const w = Math.ceil(iw / 10);
                // wir gehen durch alle reihen des bildes
                for (let row = 0; row < h; row += 1) {
                    const canvasRow = ((nodeY + ih + h + row) * canvasW + nodeX - w) * 4;
                    // copy row to pixel
                    // wir laufen durch alle spalten des bildes und betrachten dann 4 werte im array
                    for (let col = 0; col < iw + 2 * w; col += 1) {
                        const c = canvasRow + col * 4;
                        // if(c > canvasW * canvasH * 4) console.error("CRY")
                        canvasPixel[c] = lineColor[0]; // R
                        canvasPixel[c + 1] = lineColor[1]; // G
                        canvasPixel[c + 2] = lineColor[2]; // B
                        canvasPixel[c + 3] = neighbour ? 200 : 255;
                    }
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
        const hitmap = new ImageData(hitmapPixel, canvasW, canvasH);
        const hitmapCtx = this.ui.toggle ? this.ctx : this.hitCtx;
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.putImageData(pic, 0, 0);
        hitmapCtx.resetTransform();
        hitmapCtx.clearRect(0, 0, this.width, this.height);
        hitmapCtx.putImageData(hitmap, 0, 0);
        // console.log(pic);
        // console.log(canvasPixel);

        // console.log({ w, h, tx, ty, pixel });
        // console.timeEnd('draw2');
        const endTime = window.performance.now();
        const time = endTime - startTime;
        this.perfLogs.draw.push(time);
        if (time > this.maxDrawTime) {
            this.maxDrawTime = time;
            console.warn('new max draw time');
            console.warn(this.maxDrawTime);
        }
        // requestAnimationFrame(() => this.drawHitmap());
        this.valid = true;
        if (this.ui.showHeatmap) requestAnimationFrame(this.ui.drawHeatmap);
        // if (this.ui.showNavMap) requestAnimationFrame(this.ui.drawNavMapRect);
        if (this.ui.showNavHeatmap) {
            requestAnimationFrame(this.ui.drawNavHeatmapRect);
        }
    }

    zoom(wheelEvent) {
        // console.log('zoom event');
        wheelEvent.preventDefault();
        wheelEvent.stopPropagation();
        // console.log(wheelEvent)
        const { nodeUnderMouse } = this;

        // if there is a selection and the mouse is over a link
        // TODO test if this.selection.links[nodeUnderMouse.index] exists for cleaner statement
        // if (this.selection && this.selection.links[nodeUnderMouse.index]) {
        // if (false) {
        /* const { index: i } = nodeUnderMouse;
            const { links } = this.selection;
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
            this.triggerDraw(); */
        // } else {
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
            // this.scaleStage[this.zoomStage] || this.scaleStage[this.scaleStage.length - 1];
            this.zoomStage += 1;
            this.scale += 20 * this.zoomStage;
            this.cluster *= this.clusterGrowth;
        }

        // Zoom out = decrease = wheel down = positiv delta Y
        if (wheelEvent.deltaY > 0) {
            console.log('zoom out');
            // this.scale2 -= 1;
            // this.scaleStage[this.zoomStage] || this.scaleStage[this.scaleStage.length - 1];
            this.scale -= 20 * this.zoomStage;
            this.zoomStage -= 1;
            this.cluster /= this.clusterGrowth;
        }

        const scaleChange = this.scale - oldScale;
        this.translateX -= offsetX * scaleChange;
        this.translateY -= offsetY * scaleChange;

        this.triggerDraw();
        // }
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
        return null;
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
        const { nodeUnderMouse } = this;
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
            this.panning = true;
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
            return this.triggerDraw();
        }

        // different interaction based ob if a node is active or node
        const nodeUnderMouse = this.findNodeByMousePosition(mouseX, mouseY);
        this.nodeUnderMouse = nodeUnderMouse;
        this.ui.activeNode = nodeUnderMouse;
        // trigger load high resolution img
        if (nodeUnderMouse && !nodeUnderMouse.hasImage) {
            this.socket.emit('requestImage', {
                name: nodeUnderMouse.name,
                index: nodeUnderMouse.index,
            });
        }

        // DRAG AND DROP
        if (this.draggNode || this.panning) {
            // get mouse movement based on the last triggered event
            const moveX = mouseX - this.startX; // +80 means move 80px to right
            const moveY = mouseY - this.startY; // -50 means move 50 to top
            // console.log({ moveX, moveY });

            // save new mouse position for next event
            this.startX = mouseX;
            this.startY = mouseY;

            if (this.panning) {
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
                /* if (this.selection && this.selection === this.draggNode) {
                    Object.entries(this.selection.links).forEach(([i, strength]) => {
                        const neighbour = this.nodes[i];
                        // todo error handling if the neighbour is not existing for katja
                        if (neighbour) {
                            neighbour.move(nodeX * strength, nodeY * strength);
                        }
                    });
                } */
            }
            this.triggerDraw();
        }

        // mouse over empty area
    }

    handleMouseUp(e) {
        console.log('mouseup');
        const { nodeUnderMouse } = this;
        const ctrlKeyPressed = e.ctrlKey;
        // const shiftKeyPressed = e.shiftKey;
        // const altKeyPressed = e.altKey;
        if (nodeUnderMouse && nodeUnderMouse === this.nodeOnMouseDown) {
            // click event on a special node - do something
            console.log('click on node:');
            console.log(nodeUnderMouse);

            // marke node as group in every case
            if (ctrlKeyPressed) {
                if (nodeUnderMouse.group) {
                    nodeUnderMouse.group = false;
                    nodeUnderMouse.groupId = 0;
                } else {
                    nodeUnderMouse.group = true;
                    nodeUnderMouse.groupId = this.ui.activeGroupe;
                }
            }
            // used for components for adding nodes to special cases
            this.ui.clickedNode = nodeUnderMouse;
            switch (this.ui.$route.name) {
            case SVM:
                break;
            case NEIGHBOURS:
                // nodeUnderMouse.label2 = !nodeUnderMouse.label2 ? 'test' : null;
                break;
            case LABELS:
                /* if (this.selection && this.selection !== this.nodeUnderMouse && ctrlKeyPressed) {
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
                    } */
                if (this.groupNeighbours[nodeUnderMouse.index]) {
                    this.removedGroupNeighbours[nodeUnderMouse.index] = this.groupNeighbours[
                        nodeUnderMouse.index
                    ];
                    this.groupNeighbours[nodeUnderMouse.index] = undefined;
                }
                break;
            default:
                console.log('no mode selected - what to do with a node click now?');
            }
        }

        // there is a selection and this is not the activeNode

        this.panning = false;
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
                        node.grouId = this.ui.activeGroupe;
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

    handleDoubleClick(e) {
        console.log('Double click');
        /* if (this.nodeUnderMouse && this.nodeUnderMouse !== this.selection) {
            this.selection = this.nodeUnderMouse;
        } else this.selection = null; */
        if (this.moveGroupToMouse) {
            const x = (e.offsetX - this.translateX) / this.scale;
            const y = (e.offsetY - this.translateY) / this.scale;
            this.moveGroupToPosition(x, y);
        }
        // this.triggerDraw();
    }
}
