import supercluster from './cluster';
import groupColors from '../config/groupColors';

export default class ExplorerState {
    constructor(canvas, hitCanvas, socket, ui) {
        this.socket = socket;

        this.ui = ui;

        this.explorer = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.hitCtx = hitCanvas.getContext('2d');

        this.valid = true; // use for checking if draw() is running
        this.nodes = {}; // hash for all nodes
        this.colorHash = {}; // find nodes by color
        this.panning = false; // Keep track of when we are dragging
        this.draggedNode = false; // save the node for dragging

        // the current selected object.
        this.nodeOnMouseDown = false; // save node on mouseDown for check in mouseUp

        // K labels for development
        // this.showKLabels = false;
        this.selectedLabel = null; // the choosen label for highlighten images
        this.selectedCategory = null; // the choosen Category
        // this.labelColor = null; // updatet throud ui

        this._nodeUnderMouse = false; // is set (only!) on mouse move

        this._scissors = false;
        this._drawScissors = false;
        this.scissorStartX = 0;
        this.scissorStartY = 0;
        this.scissorEndX = 0;
        this.scissorEndY = 0;
        this.scissiorColor = [56, 130, 255];

        // this._cluster = 100;
        this._clusterRadius = 40;
        this._clusterTile = 5;
        this.supercluster = supercluster(); // TODO check best init for this var

        this.initScale = 20;
        this._scale = this.initScale;
        this._scaleFaktor = 0;
        this._zoomStage = 0; // default zoom stage, 0 is the smallest pic
        this.maxZoomLvl = 20; // granite the max zoom lvl
        this.clusteringOnZoomStages = new Object(null);
        for (let z = this._zoomStage; z < this.maxZoomLvl; z += 1) {
            this.clusteringOnZoomStages[z] = false;
        }

        this.imgSize = 0; // for adding higher img size as standart
        this.representImgSize = 5;
        this.neighbourImgSize = 15;

        // this._clusterGrowth = 1.2;

        // this.offsetLeft = canvas.getBoundingClientRect().left;
        // this.offsetTop = canvas.getBoundingClientRect().top;

        this.translateX = this.width / 2;
        this.translateY = this.height / 2;

        // save the mouse position for
        this.startX = null;
        this.startY = null;

        // save the last mouse position in while mouseMove
        this.lastX = null;
        this.lastY = null;

        // add event listener
        this.explorer.onmousedown = e => this.handleMouseDown(e);
        this.explorer.onmousemove = e => this.handleMouseMove(e);
        this.explorer.onmouseup = e => this.handleMouseUp(e);
        this.explorer.ondblclick = e => this.handleDoubleClick(e);
        this.explorer.onwheel = e => this.zoom(e);

        this.sortedNodes = [];
        this.sorted = false;
        this.sizeRange = 3;

        this._moveGroupToMouse = false;

        // array of node index's
        this.proposals = {};
        this.removedProposals = {};
        this.groupColours = groupColors;
        this.nonActiveGroupAplha = 50;

        // performance messure
        this.maxDrawTime = 0;
        this.maxHitMapTime = 0;
        this.perfLogs = {
            draw: [],
            hitmap: [],
        };
        this.performanceTest = false;
        this.datas = [];

        this.wasm = ui.wasm;
    }

    get sizeRange() {
        return this._sizeRange;
    }

    set sizeRange(v) {
        if (v < 0) this._sizeRange = 0;
        else this._sizeRange = v;
        // this.triggerDraw();
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        if (value < this.initScale) this._scale = this.initScale;
        else this._scale = value; // Math.round(value);
        this.ui.scale = this.scale;
    }

    get zoomStage() {
        return this._zoomStage;
    }

    set zoomStage(value) {
        if (value < 0) this._zoomStage = 0;
        else if (value > this.maxZoomLvl) this._zoomStage = this.maxZoomLvl;
        else this._zoomStage = value;
        this.ui.zoomStage = this._zoomStage;
    }

    get scaleFaktor() {
        return this._scaleFaktor;
    }

    set scaleFaktor(value) {
        if (value < 0) this._scaleFaktor = 0;
        else this._scaleFaktor = value;
    }

    get translateX() {
        return this._translateX;
    }

    set translateX(value) {
        this._translateX = Math.round(value);
        this.ui.translateX = value;
    }

    get translateY() {
        return this._translateY;
    }

    set translateY(value) {
        this._translateY = Math.round(value);
        this.ui.translateY = value;
    }

    /* set cluster(value) {
        // console.log(this._cluster);
        if (value < 1) this._cluster = 1;
        else this._cluster = value;
        this.triggerDraw();
        this.ui.cluster = this.cluster;
    } */

    /* get cluster() {
        return this._cluster;
    } */

    get clusterRadius() {
        return this._clusterRadius;
    }

    set clusterRadius(value) {
        if (value < 1) this._clusterRadius = 1;
        else this._clusterRadius = value;
    }

    get clusterTile() {
        return this._clusterTile;
    }

    set clusterTile(value) {
        if (value < 1) this._clusterTile = 1;
        else this._clusterTile = value;
    }

    get scissors() {
        return this._scissors;
    }

    set scissors(value) {
        this._scissors = value;
        this.explorer.style.cursor = value ? 'crosshair' : 'default';
    }

    get drawScissors() {
        return this._drawScissors;
    }

    set drawScissors(value) {
        this._drawScissors = value;
        if (this.wasm) this.wasm.stateSetScissior(value);
        this.explorer.style.cursor = value ? 'crosshair' : 'default';
    }

    get nodeUnderMouse() {
        return this._nodeUnderMouse;
    }

    set nodeUnderMouse(value) {
        this._nodeUnderMouse = value;
        this.explorer.style.cursor = value ? 'grab' : 'default';
    }

    get moveGroupToMousePosition() {
        return this._moveGroupToMouse;
    }

    set moveGroupToMousePosition(value) {
        this._moveGroupToMouse = value;
        // const curser = `url('${pointer}')`;
        // console.log({curser, value});
        // TODO check why this is not working
        // this.explorer.style.cursor = value ? curser : 'default';
    }

    lngX(lng) {
        return lng / 360 + 0.5;
    }

    latY(lat) {
        const sin = Math.sin((lat * Math.PI) / 180);
        const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;
        return y < 0 ? 0 : y > 1 ? 1 : y;
    }

    resetScaleTranslate() {
        this._scale = this.initScale;
        this._scaleFaktor = 0;
        this._zoomStage = 0;
        this.translateX = this.width / 2;
        this.translateY = this.height / 2;
        this.updateClustering();
        this.triggerDraw();
    }

    save() {
        console.log('save');
        const dataUrl = this.explorer
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

        const a = document.getElementById('save_canvas_to_png') || document.createElement('a');
        a.id = 'save_canvas_to_png';
        a.href = dataUrl;
        a.download = 'file.png';
        document.body.appendChild(a);
        a.click();
    }

    resetClusteringOnZoomStages() {
        for (let z = this._zoomStage; z < this.maxZoomLvl; z += 1) {
            this.clusteringOnZoomStages[z] = false;
        }
    }

    triggerDraw() {
        // console.log('trigger draw. valid?: ', this.valid)
        if (this.valid) window.requestAnimationFrame(() => this.draw());
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
        this.triggerDraw();
    }

    testPerformance(n = 100) {
        console.log('testPerformance');
        this.performanceTest = true;
        this.perfLogs.draw = [];

        for (let i = 0; i < n; i += 1) {
            window.requestAnimationFrame(() => this.draw());
        }
        window.requestAnimationFrame(() => {
            console.log(this.perfLogs);
            // round all numbers to xx.xxx
            this.perfLogs.draw = this.perfLogs.draw.map(x => Math.round(x * 1000) / 1000);
            // sort values
            const sorted = this.perfLogs.draw.sort((a, b) => a - b);
            console.log(sorted);
            const min = sorted[0];
            const max = sorted[n - 1];
            const median = (sorted[49] + sorted[50]) / 2;
            const firstQuantil = (sorted[24] + sorted[25]) / 2;
            const thirdQuantil = (sorted[74] + sorted[74]) / 2;
            const avrg = Math.round((sorted.reduce((e, a) => a + e, 0) / sorted.length) * 1000) / 1000;
            const size = Math.floor(this.zoomStage);
            let drawed = 0;

            const {
                scale,
                width: explorerW,
                height: explorerH,
                translateX: tx,
                translateY: ty,
                representImgSize,
            } = this;

            const { clusterMode } = this.ui;

            // count nodes inside explorer todo that can be perform bedder
            Object.values(this.nodes).forEach((node) => {
                let imgSize = size;
                // reps size higher
                const isRepresent = clusterMode && !node.isClusterd;
                if (isRepresent) imgSize += representImgSize;

                // check imgsize
                if (imgSize < 0) imgSize = 0;
                else if (imgSize > 9) imgSize = 9;

                const imgW = node.imageData[imgSize].width;
                const imgH = node.imageData[imgSize].height;

                const imgX = Math.floor(node.x * scale + tx - imgW / 2);
                const imgY = Math.floor(node.y * scale + ty - imgH / 2);

                // test if the image is outside the explorer
                if (imgX < explorerW - imgW && imgY < explorerH - imgH && imgX > 0 && imgY > 0) drawed += 1;
            });

            const data = {
                nodes: Object.keys(this.nodes).length,
                drawed,
                size,
                times: n,
                min,
                max,
                '1. Q': firstQuantil,
                '2. Q (M)': median,
                '3. Q (M)': thirdQuantil,
                avrg,
            };
            this.datas.push(data);
            console.table(this.datas);

            this.performanceTest = false;
        });

        // this.performanceTest = false;
        console.log('test performance end');
        console.log(this.perfLogs.draw);
    }

    // todo check where the function is used and if this is fine with updateCluster on every draw
    createCluster() {
        console.time('update createCluster');
        console.time('create geoPoints');

        // reset cluster flags for zoom stages
        this.resetClusteringOnZoomStages();
        // parse nodes into suitable format for supercluster
        const geoPoints = Object.values(this.nodes).map(n => ({
            x: n.x,
            y: n.y,
            properties: {
                index: n.index,
            },
            nodeId: n.index,
        }));
        console.timeEnd('create geoPoints');
        // console.log({ geoPoints });

        // calculated the supercluster
        this.supercluster = supercluster({
            radius: this.clusterRadius,
            maxZoom: this.maxZoomLvl,
            extent: this.clusterTile,
            log: false,
        });
        this.supercluster.load(geoPoints);
        console.timeEnd('update createCluster');
        console.log(this.supercluster);
        // update reps and new draw
        this.updateClustering();
        this.triggerDraw();
    }

    distance(v1, v2) {
        return Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);
    }

    // todo nodes can be saved for: draw only the nodes from here 'in the rect'
    updateClustering(log) {
        console.time('updateClustering');

        // TODO remove after right implementation
        //  +
        if (!this.supercluster) return;
        // console.time('get cluster');
        const {
            // zoomStage,
            scale,
            width: explorerW,
            height: explorerH,
            translateX: tx,
            translateY: ty,
        } = this;
        const zoomStage = Math.floor(this.zoomStage);

        // todo here kann man das kleiner machen um bilder nicht übern rand zu zeichnen
        // const rect = [-tx / scale, -ty / scale, (explorerW - ty) / scale, (explorerH - ty) / scale];
        const rect = [-25, -25, 25, 25];

        // get clustering for current section (viewbox)
        const cluster = this.supercluster.getClusters(rect, zoomStage);
        // console.timeEnd('get cluster');
        // console.log(rect);
        // console.log({ cluster });

        // console.log(cluster);
        cluster.forEach((c) => {
            const { index, cluster_id, point_count } = c.properties;
            // console.log({ index, cluster_id, point_count } )
            if (index) {
                // this is a not clustered point
                this.nodes[index].isClusterd = false;
            } else if (cluster_id) {
                // this is a cluster
                const pointsInsideCluster = this.supercluster.getLeaves(c.id);
                // console.log({pointsInsideCluster})
                if (log) console.log(c);
                if (log) console.log(c.geometry.coordinates);
                // TODO find represent
                // represent is first item LOL
                let centroidId = null;
                let min = Infinity;
                // set all points in cluster to false + check distance
                pointsInsideCluster.forEach((p) => {
                    const node = this.nodes[p.properties.index];
                    node.isClusterd = true;
                    if (log) console.log([node.x, node.y]);
                    if (log) console.log(p.geometry.coordinates);
                    const dist = this.distance([p.x, p.y], [c.x, c.y]);
                    if (log) console.log(dist);
                    if (dist < min) {
                        min = dist;
                        centroidId = p.properties.index;
                    }
                });
                if (log) console.log({ centroidId, min });
                // console.log({ centroidId, id: c.properties.centroidId });
                // set centroid as represent
                this.nodes[centroidId].isClusterd = false;
            }
        });
        console.timeEnd('updateClustering');
    }

    clearGroup() {
        Object.values(this.nodes).forEach((node) => {
            if (node.group) {
                node.group = false;
            }
        });
        this.triggerDraw();
    }

    deleteGroup(groupId) {
        Object.values(this.nodes).forEach((node) => {
            if (node.groupId === groupId) {
                node.group = false;
                node.groupId = 0;
            }
        });
        this.triggerDraw();
    }

    selectGroupByGroupId(groupId) {
        Object.values(this.nodes).forEach((node) => {
            node.group = (node.groupId === groupId);
        });
        this.triggerDraw();
    }

    addLabeledToGroup(label) {
        Object.values(this.nodes).forEach(
            node => node.labels.includes(label) && (node.group = true),
        );
        this.triggerDraw();
    }

    // return the id's of all nodes with group flag
    getGroupedNodeIds() {
        const ids = [];
        Object.values(this.nodes).forEach(node => (node.group ? ids.push(node.index) : null));
        return ids;
    }

    getNodeIdsByGroupId(id) {
        const ids = [];
        Object.values(this.nodes).forEach(node => (node.groupId === id ? ids.push(node.index) : null));
        return ids;
    }

    // set to all als group marked items the group id
    // the groups are saved in the ui state
    saveGroup(groupId) {
        Object.keys(this.nodes).forEach(i => (this.nodes[i].group ? (this.nodes[i].groupId = groupId) : null));
        this.updateGroupCount();
    }

    addNodesToActiveGroup(ids) {
        ids.forEach((id) => {
            this.nodes[id].group = true;
            this.nodes[id].groupId = this.ui.activeGroupId;
        });
        this.updateGroupCount();
    }

    updateGroupProposals(neighbours) {
        this.proposals = neighbours;
        this.removedProposals = {};
        this.triggerDraw();
    }

    resetGroupNeighbours() {
        this.proposals = {};
        this.removedProposals = {};
        this.triggerDraw();
    }

    addNode(node) {
        // TODO der NodeArray könnte bereits inistalisert sein oder?
        // TODO wie initaliseren ? https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/fill

        this.nodes[node.index] = node;
        this.colorHash[`rgb(${node.colorKey[0]},${node.colorKey[1]},${node.colorKey[2]})`] = node.index;
        this.triggerDraw();
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
        Object.values(this.nodes).forEach(({
            index, x, y, name, labels, groupId,
        }) => {
            nodes[index] = {
                index,
                x,
                y,
                name,
                labels,
                groupId,
            };
        });
        return nodes;
    }

    getNode(i) {
        return this.nodes[i];
    }

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
                console.log(a.cliqueLength - b.cliqueLength);
                return a.cliqueLength - b.cliqueLength;
            });
            // nodes.forEach(node => console.log(`name: ${node.name}: ${node.cliqueLength}`))
            console.timeEnd('sortNodes');
        }
        this.triggerDraw();
    }

    sortNodesReps(mode) {
        console.log('sortNodesReps');
        /*
            nodes have prop isClustered showing with false => rep
         */
        const repsBefore = mode === 1 ? -1 : 1; // isClustered === false first
        return Object.values(this.nodes).sort((x, y) => (x.isClusterd === y.isClusterd ? 0 : x.isClusterd ? repsBefore : repsBefore * -1));
    }

    changeScaleUp() {
        this.scaleFaktor += 0.2;
        // this.scale += 20 * this.scaleFaktor;
        this.scale += 1 + (this.scaleFaktor ** 2);
        this.ui.scale = this.scale; // update ui (options)
    }

    changeScaleDown() {
        // this.scale -= 20 * this.scaleFaktor;
        this.scale -= 1 + (this.scaleFaktor ** 2);
        this.scaleFaktor -= 0.2;
        this.ui.scale = this.scale; // update ui (options)
    }

    // TODO test automatic draw effects like animation, zoom
    // toggleScaleTest() {
    //     this.scaleTest = !this.scaleTest;
    //     requestAnimationFrame(this.scaleTestDraw);
    //     return this.scaleTest;
    // }

    // scaleTestDraw = () => {
    //     if (this.scaleTest) {
    //         console.log('scaleTestDraw');
    //         requestAnimationFrame(this.scaleTestDraw);
    //     }
    // };

    updateGroupCount() {
        console.log('updateGroupCount');
        // build counter
        const counter = {};
        this.ui.savedGroups.forEach(group => (counter[group.groupId] = 0));
        // count group members
        Object.values(this.nodes).forEach((node) => {
            if (node.groupId) counter[node.groupId] += 1;
        });
        // update groups in ui
        this.ui.savedGroups.forEach(group => (group.count = counter[group.groupId]));
    }

    draw() {
        // console.log('start draw')
        const startTime = window.performance.now();
        if (this.wasm) {
            this.ui.draw2();
            const endTime = window.performance.now();
            const time = endTime - startTime;
            if (time > this.maxDrawTime) {
                this.maxDrawTime = time;
                console.warn('new max draw time');
                console.warn(this.maxDrawTime);
            }
            console.log(`Draw2: ${time}`);
            if (this.ui.showLogs || this.performanceTest) this.perfLogs.draw.push(Math.round(time * 1000) / 1000);
            this.valid = true;
            if (this.ui.showNavHeatmap) requestAnimationFrame(this.ui.drawNavHeatmapRect);
            return 0;
        }

        // TODO Performance tests

        // TODO kd tree
        // TODO 1. kdtree-range test for generating node id's
        // TODO 2. update kdtree test (after D&D)

        // TODO kmeans perfomance test
        // TODO 1. calc 50 k-means wirh kdtree results

        const {
            // zoomStage,
            scale,
            width: explorerW,
            height: explorerH,
            translateX: tx,
            translateY: ty,
            representImgSize,
            nodeUnderMouse,
        } = this;

        const {
            boarderRankedMode,
            sizeRankedMode,
            gradient,
            clusterMode,
            // oldClusterMode,
            neighbourMode,
            representMaxAlpha,
            repsMode,
            alphaBase,
            alphaIncrease,
            groupBorderAllActive,
        } = this.ui;

        const nonActiveGroupAplha = groupBorderAllActive ? 255 : this.nonActiveGroupAplha;
        const zoomStage = Math.floor(this.zoomStage);

        const explorerPixel = new Uint8ClampedArray(explorerW * explorerH * 4);
        const hitmapPixel = new Uint8ClampedArray(explorerW * explorerH * 4);
        // console.log({ explorerW, explorerH, tx, ty, scale });

        const nodes = this.sorted
            ? this.sortedNodes
            : clusterMode && repsMode
                ? this.sortNodesReps(repsMode)
                : Object.values(this.nodes);

        nodes.forEach((node) => {
            let imgSize = sizeRankedMode
                ? zoomStage + Math.floor(node.rank * this.sizeRange)
                : zoomStage;
            imgSize += this.imgSize; // add imgSize from user input
            // reps size higher
            const isRepresent = clusterMode && !node.isClusterd;
            if (isRepresent) imgSize += representImgSize;
            // || (oldClusterMode && node.cluster < this.cluster);

            // asked here to not ask later again
            const proposal = neighbourMode && this.proposals[node.index];

            // make image larger because zoom is reset
            if (neighbourMode) {
                if (proposal) imgSize += this.neighbourImgSize;
                else if (node.group) imgSize += 4;
                else return; // don't draw image anyway
            }

            // check imgsize
            if (imgSize < 0) imgSize = 0;
            else if (imgSize > 9) imgSize = 9;

            const img = node.imageData[imgSize];
            if (!img) return console.error(`no image for node: ${node.id}exists`);

            const imgW = img.width;
            const imgH = img.height;

            const imgX = Math.floor(node.x * scale + tx - imgW / 2);
            const imgY = Math.floor(node.y * scale + ty - imgH / 2);

            // test if the image is outside the explorer
            if (!(imgX < explorerW - imgW && imgY < explorerH - imgH && imgX > 0 && imgY > 0)) return;

            // 1. Rule: some labels can be selected as "not show this"
            // check if the image is allowed to draw in certain rules
            let show = true;
            // TODO diese funktion wird nicht in der BA beschrieben da nicht klar ob noch erwünscht
            node.labels.forEach((nodeLabel, i) => {
                if (nodeLabel && this.ui.labels[i]) {
                    this.ui.labels[i].labels.forEach((e) => {
                        if (e && !e.show && e.name === nodeLabel) show = false;
                    });
                }
            });

            if (!show) return;

            const imgData = img.data;

            // NOTE bedder performance in draw if grouColourId would be saved in node
            const group = this.ui.savedGroups.find(e => e.groupId === node.groupId);
            const groupColor = (group && this.groupColours[group.colorId]) || [50, 50, 50]; // black
            const nearColor = [0, 127, 0]; // green

            const nodeIdUnderMouse = nodeUnderMouse && nodeUnderMouse.index === node.index;

            /**
                DRAW not active Groups
             */
            if (node.groupId > 0 && !node.group) {
                for (let imgRow = -2; imgRow <= imgH + 1; imgRow += 1) {
                    const explorerRow = ((imgY + imgRow) * explorerW + imgX) * 4;
                    if (imgRow === -2 || imgRow === -1 || imgRow === imgH + 1 || imgRow === imgH) {
                        // draw top line r
                        for (let imgCol = -2; imgCol < imgW + 2; imgCol += 1) {
                            const c = explorerRow + imgCol * 4;
                            explorerPixel[c] = groupColor[0]; // R
                            explorerPixel[c + 1] = groupColor[1]; // G
                            explorerPixel[c + 2] = groupColor[2]; // B
                            explorerPixel[c + 3] = nonActiveGroupAplha;
                        }
                    } else {
                        // draw left boarder
                        const l = explorerRow - 8;
                        explorerPixel[l] = groupColor[0]; // R
                        explorerPixel[l + 1] = groupColor[1]; // G
                        explorerPixel[l + 2] = groupColor[2]; // B
                        explorerPixel[l + 3] = nonActiveGroupAplha;

                        const l2 = explorerRow - 4;
                        explorerPixel[l2] = groupColor[0]; // R
                        explorerPixel[l2 + 1] = groupColor[1]; // G
                        explorerPixel[l2 + 2] = groupColor[2]; // B
                        explorerPixel[l2 + 3] = nonActiveGroupAplha;

                        // draw right boarder
                        const r = explorerRow + (imgW + 1) * 4;
                        explorerPixel[r] = groupColor[0]; // R
                        explorerPixel[r + 1] = groupColor[1]; // G
                        explorerPixel[r + 2] = groupColor[2]; // B
                        explorerPixel[r + 3] = nonActiveGroupAplha;

                        const r2 = explorerRow + imgW * 4;
                        explorerPixel[r2] = groupColor[0]; // R
                        explorerPixel[r2 + 1] = groupColor[1]; // G
                        explorerPixel[r2 + 2] = groupColor[2]; // B
                        explorerPixel[r2 + 3] = nonActiveGroupAplha;
                    }
                }
            }

            /**
                DRAW IMAGE
             */
            // loop through rows in img
            for (let imgRow = 0; imgRow < imgH; imgRow += 1) {
                const explorerRow = ((imgY + imgRow) * explorerW + imgX) * 4;
                // loop through column in img
                for (let imgCol = 0; imgCol < imgW; imgCol += 1) {
                    const c = explorerRow + imgCol * 4;
                    const p = (imgRow * imgW + imgCol) * 4;
                    explorerPixel[c] = imgData[p]; // R
                    explorerPixel[c + 1] = imgData[p + 1]; // G
                    explorerPixel[c + 2] = imgData[p + 2]; // B
                    // special mode for represents // img over other img // white background
                    explorerPixel[c + 3] = (representMaxAlpha && isRepresent) || nodeIdUnderMouse
                        ? 255
                        : explorerPixel[c + 3]
                            ? explorerPixel[c + 3] + 10 * node.cliqueLength
                            : alphaBase + zoomStage * alphaIncrease;

                    // draw hitmap
                    hitmapPixel[c] = node.colorKey[0]; // R
                    hitmapPixel[c + 1] = node.colorKey[1]; // G
                    hitmapPixel[c + 2] = node.colorKey[2]; // B
                    hitmapPixel[c + 3] = 255; //
                }
            }

            /**
                DRAW RANK COLOR BORDER
             */
            if (boarderRankedMode) {
                const color = gradient[node.cliqueLength];
                // draw boarder
                for (let imgRow = -2; imgRow <= imgH + 1; imgRow += 1) {
                    const explorerRow = ((imgY + imgRow) * explorerW + imgX) * 4;
                    if (imgRow === -2 || imgRow === -1 || imgRow === imgH + 1 || imgRow === imgH) {
                        // draw top line r
                        for (let imgCol = -2; imgCol < imgW + 2; imgCol += 1) {
                            const c = explorerRow + imgCol * 4;
                            explorerPixel[c] = color[0]; // R
                            explorerPixel[c + 1] = color[1]; // G
                            explorerPixel[c + 2] = color[2]; // B
                            explorerPixel[c + 3] = 200;
                        }
                    } else {
                        // draw right boarder
                        const r = explorerRow - 4;
                        explorerPixel[r] = color[0]; // R
                        explorerPixel[r + 1] = color[1]; // G
                        explorerPixel[r + 2] = color[2]; // B
                        explorerPixel[r + 3] = 200;

                        const r2 = explorerRow - 8;
                        explorerPixel[r2] = color[0]; // R
                        explorerPixel[r2 + 1] = color[1]; // G
                        explorerPixel[r2 + 2] = color[2]; // B
                        explorerPixel[r2 + 3] = 200;

                        // draw left boarder
                        const l = explorerRow + (imgW + 1) * 4;
                        explorerPixel[l] = color[0]; // R
                        explorerPixel[l + 1] = color[1]; // G
                        explorerPixel[l + 2] = color[2]; // B
                        explorerPixel[l + 3] = 200;

                        const l2 = explorerRow + imgW * 4;
                        explorerPixel[l2] = color[0]; // R
                        explorerPixel[l2 + 1] = color[1]; // G
                        explorerPixel[l2 + 2] = color[2]; // B
                        explorerPixel[l2 + 3] = 200;
                    }
                }
            }

            /**
                DRAW LABEL BORDER
             */
            // Todo get variables via this.ui
            const labelBorder = this.selectedCategory
                && this.selectedLabel
                && this.selectedLabel === node.labels[this.selectedCategory];
            if (labelBorder) {
                const { color } = this.ui.labels[this.selectedCategory].labels.find(
                    e => e.name === this.selectedLabel,
                );
                // draw boarder
                for (let imgRow = -2; imgRow <= imgH + 1; imgRow += 1) {
                    const explorerRow = ((imgY + imgRow) * explorerW + imgX) * 4;
                    if (imgRow === -2 || imgRow === -1 || imgRow === imgH + 1 || imgRow === imgH) {
                        // draw top line r
                        for (let imgCol = -2; imgCol < imgW + 2; imgCol += 1) {
                            const c = explorerRow + imgCol * 4;
                            explorerPixel[c] = color[0]; // R
                            explorerPixel[c + 1] = color[1]; // G
                            explorerPixel[c + 2] = color[2]; // B
                            explorerPixel[c + 3] = 200;
                        }
                    } else {
                        // draw left boarder
                        const l = explorerRow - 8;
                        explorerPixel[l] = color[0]; // R
                        explorerPixel[l + 1] = color[1]; // G
                        explorerPixel[l + 2] = color[2]; // B
                        explorerPixel[l + 3] = 200;

                        const l2 = explorerRow - 4;
                        explorerPixel[l2] = color[0]; // R
                        explorerPixel[l2 + 1] = color[1]; // G
                        explorerPixel[l2 + 2] = color[2]; // B
                        explorerPixel[l2 + 3] = 200;

                        // draw left boarder
                        const r = explorerRow + (imgW + 1) * 4;
                        explorerPixel[r] = color[0]; // R
                        explorerPixel[r + 1] = color[1]; // G
                        explorerPixel[r + 2] = color[2]; // B
                        explorerPixel[r + 3] = 200;

                        const r2 = explorerRow + imgW * 4;
                        explorerPixel[r2] = color[0]; // R
                        explorerPixel[r2 + 1] = color[1]; // G
                        explorerPixel[r2 + 2] = color[2]; // B
                        explorerPixel[r2 + 3] = 200;
                    }
                }
            }

            /**
                DRAW GROUP BORDER
             */
            // TODO Perfomance is maybe bedder without another loop

            // draw only if group, label2 or proposal
            if (
                !node.group
                && !node.isNearly
                // && (!proposal)
            ) return;

            const lineColor = node.isNearly ? nearColor : node.group ? groupColor : null;
            if (lineColor) {
                for (let imgRow = -2; imgRow <= imgH + 1; imgRow += 1) {
                    const explorerRow = ((imgY + imgRow) * explorerW + imgX) * 4;
                    if (imgRow === -2 || imgRow === -1 || imgRow === imgH + 1 || imgRow === imgH) {
                        // draw top line r
                        for (let imgCol = -2; imgCol < imgW + 2; imgCol += 1) {
                            const c = explorerRow + imgCol * 4;
                            explorerPixel[c] = lineColor[0]; // R
                            explorerPixel[c + 1] = lineColor[1]; // G
                            explorerPixel[c + 2] = lineColor[2]; // B
                            explorerPixel[c + 3] = 200;
                        }
                    } else {
                        // draw left boarder
                        const l = explorerRow - 8;
                        explorerPixel[l] = lineColor[0]; // R
                        explorerPixel[l + 1] = lineColor[1]; // G
                        explorerPixel[l + 2] = lineColor[2]; // B
                        explorerPixel[l + 3] = 200;

                        const l2 = explorerRow - 4;
                        explorerPixel[l2] = lineColor[0]; // R
                        explorerPixel[l2 + 1] = lineColor[1]; // G
                        explorerPixel[l2 + 2] = lineColor[2]; // B
                        explorerPixel[l2 + 3] = 200;

                        // draw left boarder
                        const r = explorerRow + (imgW + 1) * 4;
                        explorerPixel[r] = lineColor[0]; // R
                        explorerPixel[r + 1] = lineColor[1]; // G
                        explorerPixel[r + 2] = lineColor[2]; // B
                        explorerPixel[r + 3] = 200;

                        const r2 = explorerRow + imgW * 4;
                        explorerPixel[r2] = lineColor[0]; // R
                        explorerPixel[r2 + 1] = lineColor[1]; // G
                        explorerPixel[r2 + 2] = lineColor[2]; // B
                        explorerPixel[r2 + 3] = 200;
                    }
                }
            }
        });

        /**
            DRAW SCISSORS
         */
        if (this.drawScissors) {
            const explorerX = this.scissorStartX < this.scissorEndX ? this.scissorStartX : this.scissorEndX;
            const explorerY = this.scissorStartY < this.scissorEndY ? this.scissorStartY : this.scissorEndY;

            const scissorW = Math.abs(this.scissorEndX - this.scissorStartX);
            const scissorH = Math.abs(this.scissorEndY - this.scissorStartY);

            // '#3882ff';
            const color = this.scissiorColor;

            // loop through each row of the reactangle
            for (let scisRow = 0; scisRow < scissorH; scisRow += 1) {
                const explorerRow = ((explorerY + scisRow) * explorerW + explorerX) * 4;

                // loop through each col of the reactangle
                for (let scisCol = 0; scisCol < scissorW; scisCol += 1) {
                    const c = explorerRow + scisCol * 4;
                    if (scisRow === 0 || scisRow === scissorH - 1) {
                        // draw top line r
                        explorerPixel[c] = color[0]; // R
                        explorerPixel[c + 1] = color[1]; // G
                        explorerPixel[c + 2] = color[2]; // B
                        explorerPixel[c + 3] = 255;
                    } else if (scisCol === 0 || scisCol === scissorW - 1) {
                        // draw left boarder
                        const l = explorerRow;
                        explorerPixel[l] = color[0]; // R
                        explorerPixel[l + 1] = color[1]; // G
                        explorerPixel[l + 2] = color[2]; // B
                        explorerPixel[l + 3] = 255;

                        // draw left boarder
                        const r = explorerRow + (scissorW - 1) * 4;
                        explorerPixel[r] = color[0]; // R
                        explorerPixel[r + 1] = color[1]; // G
                        explorerPixel[r + 2] = color[2]; // B
                        explorerPixel[r + 3] = 255;
                    }
                }
            }
        }

        const pic = new ImageData(explorerPixel, explorerW, explorerH);
        const hitmap = new ImageData(hitmapPixel, explorerW, explorerH);
        const hitmapCtx = this.ui.toggle ? this.ctx : this.hitCtx;
        this.ctx.putImageData(pic, 0, 0);
        hitmapCtx.putImageData(hitmap, 0, 0);

        const endTime = window.performance.now();
        const time = endTime - startTime;
        // console.log(`Draw: ${time}`);
        if (this.ui.showLogs || this.performanceTest) this.perfLogs.draw.push(Math.round(time * 1000) / 1000);
        if (time > this.maxDrawTime) {
            this.maxDrawTime = time;
            console.warn('new max draw time');
            console.warn(this.maxDrawTime);
        }
        this.valid = true;
    }

    zoom(wheelEvent) {
        // console.log('zoom event');
        if (wheelEvent.hasOwnProperty('preventDefault')) wheelEvent.preventDefault();
        if (Object.prototype.hasOwnProperty.call(wheelEvent, 'preventDefault')) wheelEvent.preventDefault();
        if (wheelEvent.hasOwnProperty('stopPropagation')) wheelEvent.stopPropagation();
        if (Object.prototype.hasOwnProperty.call(wheelEvent, 'preventDefault')) wheelEvent.stopPropagation();
        // console.log(wheelEvent)

        const oldScale = this.scale;
        const mouseX = wheelEvent.offsetX;
        const mouseY = wheelEvent.offsetY;

        // get mouse movement based on the last triggered event
        const offsetX = (mouseX - this.translateX) / oldScale; // +80 means move 80px to right
        const offsetY = (mouseY - this.translateY) / oldScale; // -50 means move 50 to top
        // console.log({ mouseX, mouseY, offsetX, offsetY });

        // Zoom in = increase = wheel up = negative delta Y
        if (wheelEvent.deltaY < 0) {
            console.log('zoom in');
            this.zoomStage += 0.2;
            this.changeScaleUp();
            console.log('zoomstage: ', this.zoomStage)
        }

        // Zoom out = decrease = wheel down = positive delta Y
        if (wheelEvent.deltaY > 0) {
            console.log('zoom out');
            this.zoomStage -= 0.2;
            this.changeScaleDown();
        }

        const scaleChange = this.scale - oldScale;
        this.translateX -= offsetX * scaleChange;
        this.translateY -= offsetY * scaleChange;

        console.log('setScale', this.scale, this.translateX, this.translateY, this.zoomStage);
        if (this.ui.wasmMode) {
            this.ui.wasm.setScale(this.scale);
            this.ui.wasm.setTxTy(this.translateX, this.translateY);
            this.ui.wasm.setZoom(Math.floor(this.zoomStage));
            // this.ui.draw2();
        }

        this.updateClustering();
        this.triggerDraw();
        if (this.ui.showNavHeatmap) requestAnimationFrame(this.ui.drawNavHeatmapRect);

        return false;
    }

    findNodeByMousePosition(x, y) {
        // console.time('findNodeByMousePosition');
        if (this.ui.wasmMode) {
            // console.log('wasmPixel', this.colorHash);
            const i = (this.ui.hitMapPixel.width * y + x) * 4;
            const r = this.ui.hitMapPixel.data[i];
            const g = this.ui.hitMapPixel.data[i + 1];
            const b = this.ui.hitMapPixel.data[i + 2];
            const color = `rgb(${r},${g},${b})`;
            const id = this.colorHash[color] || null;
            // console.log('wasmPixel',i, x, y, this.ui.hitMapPixel.width, r, g, b, nodeId, color, this.ui.hitMapPixel);
            return this.nodes[id] || null;
        }
        // else {
        const pixel = this.hitCtx.getImageData(x, y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        const nodeId = this.colorHash[color];
        // console.log({ pixel, x, y });
        // console.timeEnd('findNodeByMousePosition');
        return this.nodes[nodeId] || null;
        // }
    }

    handleMouseDown(e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();
        // console.log(e)

        console.log('mousedown');
        // console.log(e.offsetX);
        // console.log(e.offsetY);

        // saving for checking if node was clicked in handleMouseUp
        const { nodeUnderMouse } = this;
        this.nodeOnMouseDown = nodeUnderMouse;

        // save start position
        this.startX = e.offsetX;
        this.startY = e.offsetY;
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;

        // if there is no mouse under mouse then move everything
        if (nodeUnderMouse) {
            this.draggedNode = nodeUnderMouse;
        } else if (this.scissors) {
            console.log('Scissors');
            // save start X/Y
            this.drawScissors = true;
            this.scissorStartX = this.startX;
            this.scissorStartY = this.startY;
            if (this.wasm) this.wasm.stateSetScissiorStartXY(this.startX, this.startY);
            this.triggerDraw();
        } else {
            // if nothing is clicked
            this.panning = true;
        }
    }

    handleMouseMove(e) {
        // other way for getting x/y
        /* const mousePos = {
            x: e.clientX - explorer.offsetLeft,
            y: e.clientY - explorer.offsetTop
        }; */

        const mouseX = e.offsetX;
        const mouseY = e.offsetY;

        if (this.scissors) {
            this.scissorEndX = mouseX;
            this.scissorEndY = mouseY;
            if (this.wasm) this.wasm.stateSetScissiorEndXY(mouseX, mouseY);
            return this.triggerDraw();
        }

        // DRAG AND DROP
        if (this.draggedNode || this.panning) {
            // get mouse movement based on the last triggered event
            const moveX = mouseX - this.lastX; // +80 means move 80px to right
            const moveY = mouseY - this.lastY; // -50 means move 50 to top
            // console.log({ moveX, moveY });

            // save new mouse position for next event
            this.lastX = mouseX;
            this.lastY = mouseY;

            if (this.panning) {
                // move the x/y
                this.translateX += moveX;
                this.translateY += moveY;
                if (this.ui.wasmMode) {
                    this.ui.wasm.addTxTy(moveX, moveY);
                    // this.ui.draw2();
                }
                if (this.ui.showNavHeatmap) requestAnimationFrame(this.ui.drawNavHeatmapRect);
            } else if (this.draggedNode) {
                // console.log("draggeNode")
                // scale the X/Y
                const imgX = moveX / this.scale;
                const imgY = moveY / this.scale;

                // drag hole group
                if (this.draggedNode.group) {
                    Object.values(this.nodes).forEach((node) => {
                        if (node.group) {
                            node.x += imgX;
                            node.y += imgY;
                        }
                    });
                    // todo remove 'if' if clustermode is default
                    if (this.ui.clusterMode) {
                        this.updateNodesInRange();
                    }
                } else {
                    // drag only one node
                    this.draggedNode.x += imgX;
                    this.draggedNode.y += imgY;
                }
            }
            return this.triggerDraw();
        }
        // different interaction based ob if a node is active or node
        const nodeUnderMouse = this.findNodeByMousePosition(mouseX, mouseY);
        const oldnodeUnderMouse = this.nodeUnderMouse;
        if (
            (oldnodeUnderMouse && !nodeUnderMouse)
            || (!oldnodeUnderMouse && nodeUnderMouse)
            || (nodeUnderMouse
                && oldnodeUnderMouse
                && oldnodeUnderMouse.index !== nodeUnderMouse.index)
        ) {
            console.error('CHANGE NODE');
            this.nodeUnderMouse = nodeUnderMouse;
            this.ui.activeNode = nodeUnderMouse;
            this.triggerDraw();
        }

        // trigger load high resolution img
        if (nodeUnderMouse && !nodeUnderMouse.hasImage && !nodeUnderMouse.imgLoading) {
            nodeUnderMouse.imgLoading = true;
            this.socket.emit('requestImage', {
                name: nodeUnderMouse.name,
                index: nodeUnderMouse.index,
                datasetId: this.ui.dataset,
            });
        }

        return null;
    }

    handleMouseUp(e) {
        console.log('mouseup');
        if (this.panning) {
            this.panning = false;
            return this.triggerDraw();
        }
        const { nodeUnderMouse } = this;

        if (nodeUnderMouse && nodeUnderMouse === this.nodeOnMouseDown) {
            // check if mouse move just a small delta
            // => click on a image
            if (
                this.startX <= e.offsetX + 2
                && this.startX >= e.offsetX - 2
                && this.startY <= e.offsetY + 2
                && this.startY >= e.offsetY - 2
            ) {
                console.warn('click on:');
                console.log(nodeUnderMouse);

                // used in vue components
                this.ui.clickedNode = nodeUnderMouse;

                // flag/unflag node as and add/remove from group
                if (nodeUnderMouse.group) {
                    nodeUnderMouse.group = false;
                    nodeUnderMouse.groupId = 0;
                } else {
                    nodeUnderMouse.group = true;
                    nodeUnderMouse.groupId = this.ui.activeGroupId;
                }
                this.updateGroupCount();
                if (this.ui.neighbourMode) {
                    // if user adds a proposal
                    if (this.proposals[nodeUnderMouse.index]) {
                        // remove node from proposals
                        console.log('add proposal to group');
                        this.removedProposals[nodeUnderMouse.index] = this.proposals[
                            nodeUnderMouse.index
                        ];
                        this.proposals[nodeUnderMouse.index] = undefined;
                    } else {
                        // node is removed from group
                        console.log('remove group and add to proposals');
                        this.proposals[nodeUnderMouse.index] = 1; // dummy threshold
                        this.removedProposals[nodeUnderMouse.index] = undefined;
                    }
                }
            }

            if (this.ui.showNavHeatmap) requestAnimationFrame(this.ui.drawNavHeatmap);

            if (this.draggedNode) {
                // merge all "nearby nodes" to group
                if (this.draggedNode.group) {
                    this.addNodesInRangeToGroup();
                    this.updateGroupCount();
                }
                this.draggedNode = false;
                // update clustering after move one or more nodes
                return this.createCluster(); // draw triggers in create cluster
            }

            // todo update instead of recreate supercluster here maybe bedder? how?
            // update cluster cause of new embedding
        } else if (this.scissors) {
            this.ui.cuttedNodes = [];
            const startX = (this.scissorStartX - this.translateX) / this.scale;
            const startY = (this.scissorStartY - this.translateY) / this.scale;
            const endX = (this.scissorEndX - this.translateX) / this.scale;
            const endY = (this.scissorEndY - this.translateY) / this.scale;
            // console.log({startX, startY, endX, endY})
            Object.values(this.nodes).forEach((node) => {
                // console.log(node)
                // check for all nodes if they are inside the rectangle
                if (
                    (!this.ui.neighbourMode || this.proposals[node.index])
                    && ((node.x > startX && node.x < endX) || (node.x < startX && node.x > endX))
                    && ((node.y < startY && node.y > endY) || (node.y > startY && node.y < endY))
                ) {
                    this.ui.cuttedNodes.push(node);
                    node.group = true;
                    node.groupId = this.ui.activeGroupId;
                    if (this.ui.neighbourMode && this.proposals[node.index]) {
                        this.removedProposals[node.index] = this.proposals[node.index];
                        this.proposals[node.index] = undefined;
                    }
                }
            });

            this.updateGroupCount();
            // reset
            this.scissors = false;
            this.ui.scissors = false;
            this.drawScissors = false;
        }
        return this.triggerDraw();
    }

    /**
     * move all nodes in a group/marked half the way to a point
     * @param e event
     */
    handleDoubleClick(e) {
        console.log('Double click');
        if (this.moveGroupToMousePosition) {
            const x = (e.offsetX - this.translateX) / this.scale;
            const y = (e.offsetY - this.translateY) / this.scale;
            // move group members to mouse position
            // let counter = 0;
            Object.values(this.nodes).forEach((node) => {
                if (node.group) {
                    // counter += 1
                    // const dX = Math.random() - 0.5
                    // const dY = Math.random() - 0.5
                    // console.log({dX, dY})
                    // todo based on zoomstage, relative
                    node.x = x + (Math.random() * 4 - 2)/Math.floor(this.zoomStage + 1);
                    node.y = y + (Math.random() * 4 - 2)/Math.floor(this.zoomStage + 1);
                }
            });
            this.createCluster();
        }
    }

    updateNodesInRange() {
        console.time('nodesInRange');
        const tree = this.supercluster.trees[this.supercluster.trees.length - 1];
        // todo scale an zoomstufe anpassen da ja unterschiedliche trees?
        const r = (0.01 * 20) / this.scale;
        const nodes = tree.within(this.lngX(this.draggedNode.x), this.latY(this.draggedNode.y), r);
        Object.values(this.nodes).forEach((node) => {
            node.isNearly = !node.group && nodes.includes(node.index);
        });
        console.timeEnd('nodesInRange');
    }

    addNodesInRangeToGroup() {
        Object.values(this.nodes).forEach((node) => {
            if (node.isNearly) {
                node.group = true;
                node.groupId = this.draggedNode.groupId;
                node.isNearly = false; // remove nearly status
            }
        });
    }
}
