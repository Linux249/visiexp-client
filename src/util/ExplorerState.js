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
        this.drawScissors = false;
        this.scissorsStartX = 0;
        this.scissorsStartY = 0;
        this.scissorsEndX = 0;
        this.scissorsEndY = 0;
        this.scissiorColor = [56, 130, 255];

        // this._cluster = 100;
        this._clusterRadius = 40;
        this._clusterTile = 5;
        this.supercluster = supercluster(); // TODO check best init for this var


        this._scale = 20;
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

        this.startX = null;
        this.startY = null;

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
        this.groupNeighbours = {};
        this.removedGroupNeighbours = {};
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
    }

    set sizeRange(v) {
        if (v < 0) this._sizeRange = 0;
        else this._sizeRange = v;
        // this.triggerDraw();
    }

    get sizeRange() {
        return this._sizeRange;
    }

    set scale(value) {
        if (value < 20) this._scale = 20;
        else this._scale = value; // Math.round(value);
        this.ui.scale = this.scale;
    }

    get scale() {
        return this._scale;
    }

    set zoomStage(value) {
        if (value < 0) this._zoomStage = 0;
        else if (value > this.maxZoomLvl) this._zoomStage = this.maxZoomLvl;
        else this._zoomStage = value;
        this.ui.zoomStage = this._zoomStage;
    }

    get zoomStage() {
        return this._zoomStage;
    }

    set scaleFaktor(value) {
        if (value < 0) this._scaleFaktor = 0;
        else this._scaleFaktor = value;
    }

    get scaleFaktor() {
        return this._scaleFaktor;
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

    set clusterRadius(value) {
        if (value < 1) this._clusterRadius = 1;
        else this._clusterRadius = value;
    }

    get clusterRadius() {
        return this._clusterRadius;
    }

    set clusterTile(value) {
        if (value < 1) this._clusterTile = 1;
        else this._clusterTile = value;
    }

    get clusterTile() {
        return this._clusterTile;
    }

    set scissors(value) {
        this._scissors = value;
        this.explorer.style.cursor = value ? 'crosshair' : 'default';
    }

    get scissors() {
        return this._scissors;
    }

    set nodeUnderMouse(value) {
        this._nodeUnderMouse = value;
        this.explorer.style.cursor = value ? 'grab' : 'default';
    }

    get nodeUnderMouse() {
        return this._nodeUnderMouse;
    }

    set moveGroupToMousePosition(value) {
        this._moveGroupToMouse = value;
        // const curser = `url('${pointer}')`;
        // console.log({curser, value});
        // TODO check why this is not working
        // this.explorer.style.cursor = value ? curser : 'default';
    }

    get moveGroupToMousePosition() {
        return this._moveGroupToMouse;
    }

    lngX(lng) {
        return lng / 360 + 0.5;
    }

    latY(lat) {
        const sin = Math.sin((lat * Math.PI) / 180);
        const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;
        return y < 0 ? 0 : y > 1 ? 1 : y;
    }

    save() {
        console.log('save');
        const dataUrl = this.explorer.toDataURL('image/png').replace('image/png', 'image/octet-stream');

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

    /* set activeImgScale(value) {
        if (value < 1) this._activeImgScale = 1;
        else this._activeImgScale = value;
        this.triggerDraw();
    }

    get activeImgScale() {
        return this._activeImgScale;
    } */

    /* set borderWidth(value) {
        if (value < 0) this._borderWidth = 0;
        else this._borderWidth = value;
        this.triggerDraw();
    }

    get borderWidth() {
        return this._borderWidth;
    } */

    /* set scrollGrowth(v) {
        if (v <= 1) this._scrollGrowth = 1.01;
        else this._scrollGrowth = v;
    }

    get scrollGrowth() {
        return this._scrollGrowth;
    } */

    /* set scrollImgGrowth(v) {
        if (v <= 1) this._scrollImgGrowth = 1.01;
        else this._scrollImgGrowth = v;
    }

    get scrollImgGrowth() {
        return this._scrollImgGrowth;
    } */

    /* get clusterGrowth() {
        return this._clusterGrowth;
    }

    set clusterGrowth(v) {
        if (v <= 1) this._clusterGrowth = 1.01;
        else this._clusterGrowth = v;
        this.ui.clusterGrowth = this.clusterGrowth;
    } */

    triggerDraw() {
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
            const sorted = this.perfLogs.draw.sort((a, b) => a - b);
            console.log(sorted);
            const min = sorted[0];
            const max = sorted[n - 1];
            const median = (sorted[49] + sorted[50]) / 2;
            const firstQuantil = (sorted[24] + sorted[25]) / 2;
            const thirdQuantil = (sorted[74] + sorted[74]) / 2;

            const avrg = sorted.reduce((e, a) => a + e, 0) / sorted.length;

            const data = {
                nodes: Object.keys(this.nodes).length,
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
                node.groupId = null;
            }
        });
        this.triggerDraw();
    }

    loadGroupByGroupId(groupId) {
        Object.values(this.nodes).forEach((node) => {
            node.group = node.groupId === groupId ? groupId : null;
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

    getGroupIdsByGroupId(id) {
        const ids = [];
        Object.values(this.nodes).forEach(node => (node.groupId === id ? ids.push(node.index) : null));
        return ids;
    }

    // set to all als group marked items the group id
    // the groups are saved in the ui state
    saveGroup(groupId) {
        Object.keys(this.nodes).forEach(
            i => (this.nodes[i].group ? (this.nodes[i].groupId = groupId) : null),
        );
        this.updateGroupCount();
    }

    addNodesToActiveGroup(ids) {
        ids.forEach((id) => {
            this.nodes[id].group = true;
            this.nodes[id].groupId = this.ui.activeGroupId;
        });
        this.updateGroupCount();
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
        Object.values(this.nodes).forEach(
            ({
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
            },
        );
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
        return Object.values(this.nodes).sort(
            (x, y) => (x.isClusterd === y.isClusterd ? 0 : x.isClusterd ? repsBefore : repsBefore * -1),
        );
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
        // console.time('draw');
        const startTime = window.performance.now();

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
            nonActiveGroupAplha,
        } = this;
        const zoomStage = Math.floor(this.zoomStage);
        const explorerPixel = new Uint8ClampedArray(explorerW * explorerH * 4);
        const hitmapPixel = new Uint8ClampedArray(explorerW * explorerH * 4);
        // console.log({ explorerW, explorerH, tx, ty, scale });

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
        } = this.ui;

        // if (clusterMode) this.updateClustering();

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
            const isRepresent = (clusterMode && !node.isClusterd);
            if (isRepresent) imgSize += representImgSize;
            // || (oldClusterMode && node.cluster < this.cluster);

            // asked here to not ask later again
            const neighbour = neighbourMode && !node.group && this.groupNeighbours[node.index];
            const removedNeighbour = neighbourMode && !node.group && this.removedGroupNeighbours[node.index];

            if (neighbourMode && !node.group) {
                // the node should not be in the neighbours list
                if (neighbour || removedNeighbour) imgSize += this.neighbourImgSize;
                else return;
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
            if (!(imgX < (explorerW - imgW) && imgY < (explorerH - imgH) && imgX > 0 && imgY > 0)) return;


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

            // 2. if neighbours mode:  check if node is not groupd

            // cluster
            // if (node.cluster < this.cluster) {
            const imgData = img.data;

            const neighbourColor = [250, 208, 44]; // yellow
            // const groupColor = [100, 100, 100]; // black
            // NOTE bedder perfomance in draw if grouColourId whould be saved in node
            const group = this.ui.savedGroups.find(e => e.groupId === node.groupId);
            const groupColor = (group && this.groupColours[group.colorId]) || [100, 100, 100]; // black
            const nearColor = [0, 127, 0]; // gren

            /*
                DRAW not active Groups
             */
            if (node.groupId && !node.group) {
                for (let imgRow = -2; imgRow <= imgH + 1; imgRow += 1) {
                    const explorerRow = ((imgY + imgRow) * explorerW + imgX) * 4;
                    if (imgRow === -2 || imgRow === -1 || imgRow === imgH + 1 || imgRow === imgH) {
                        // draw top line r
                        for (let imgCol = -2; imgCol < imgW + 2; imgCol += 1) {
                            const c = explorerRow + imgCol * 4;
                            explorerPixel[c] = groupColor[0]; // R
                            explorerPixel[c + 1] = groupColor[1]; // G
                            explorerPixel[c + 2] = groupColor[2]; // B
                            explorerPixel[c + 3] = 50;
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

            /*
                DRAW IMAGE
             */
            if (!removedNeighbour) {
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
                        explorerPixel[c + 3] = representMaxAlpha && isRepresent
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
            } else {
                // loop through rows in img
                for (let imgRow = 0; imgRow < imgH; imgRow += 1) {
                    const explorerRow = ((imgY + imgRow) * explorerW + imgX) * 4;
                    // loop through column in img
                    for (let imgCol = 0; imgCol < imgW; imgCol += 1) {
                        const c = explorerRow + imgCol * 4;
                        const p = (imgRow * imgW + imgCol) * 4;

                        // red cast
                        explorerPixel[c] = 255; // imgData[p]; // R
                        explorerPixel[c + 1] = imgData[p + 1]; // G
                        explorerPixel[c + 2] = imgData[p + 2]; // B
                        // special mode for represents // img over other img // white background
                        explorerPixel[c + 3] = representMaxAlpha && isRepresent
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
            }

            /*
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

            /*
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

            /*
                DRAW GROUP BORDER
             */
            // TODO Perfomance is maybe bedder without another loop

            // draw only if group, label2 or neighbour
            if (
                !node.group
                && !node.isNearly
            // && (!neighbour)
            ) return;

            const lineColor = neighbour
                ? neighbourColor
                : node.isNearly
                    ? nearColor
                    : node.group
                        ? groupColor
                        : null;
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

        /*
            DRAW UNDLINE FOR GROUPED NODES
         */
        // TODO use color user can choose in UI + add choose color in UI
        // const groupColor = [225, 225, 115];
        // const neighbourColor = [225, 225, 115];

        // const groupColor = [195,230,203];  // bootstrap green
        // const label2Color = [153, 0, 51];

        /* nodes.forEach((node) => {
            const neighbour = this.groupNeighbours[node.index];
            // TODO Perfomance is maybe bedder without another loop

            // draw only if group, label2 or neighbour
            if (
                !node.group
                && !node.isNearly
                && (!neighbour || neighbour > this.ui.neighboursThreshold)
            ) return;

            const lineColor = neighbour ? neighbourColor : node.isNearly ? nearColor : groupColor;

            let imgSize = sizeRankedMode
                ? zoomStage + Math.floor(node.rank * this.sizeRange)
                : zoomStage;
            imgSize += this.imgSize;
            const isRepresent = (clusterMode && !node.isClusterd)
                || (oldClusterMode && node.cluster < this.cluster);

            if (neighbourMode && !node.group) {
                // the node should not be in the neighbours list
                const neighbour = this.groupNeighbours[node.index];
                if (neighbour && neighbour <= this.ui.neighboursThreshold) {
                    imgSize += this.neighbourImgSize;
                } else return;
            } else if (isRepresent) imgSize += representImgSize;

            if (imgSize < 0) imgSize = 0;
            if (imgSize > 14) imgSize = 14;

            const img = node.imageData[imgSize];
            if (!img) return console.error(`no image for node: ${node.id}exists`);

            const iw = img.width;
            const ih = img.height;

            const imgX = Math.floor(node.x * scale + tx - iw / 2);
            const imgY = Math.floor(node.y * scale + ty - ih / 2);

            const inside = imgX > borderW
                && imgY > borderW
                && imgX < explorerW - iw - borderW
                && imgY < explorerH - ih - borderW;

            if (inside) {
                const h = Math.ceil(ih / 10);
                const w = Math.ceil(iw / 10);
                // wir gehen durch alle reihen des bildes
                for (let imgRow = 0; imgRow < h; imgRow += 1) {
                    const explorerRow = ((imgY + ih + h + imgRow) * explorerW + imgX - w) * 4;
                    // copy imgRow to pixel
                    // wir laufen durch alle spalten des bildes und betrachten dann 4 werte im array
                    for (let imgCol = 0; imgCol < iw + 2 * w; imgCol += 1) {
                        const c = explorerRow + imgCol * 4;
                        // if(c > explorerW * explorerH * 4) console.error("CRY")
                        explorerPixel[c] = lineColor[0]; // R
                        explorerPixel[c + 1] = lineColor[1]; // G
                        explorerPixel[c + 2] = lineColor[2]; // B
                        explorerPixel[c + 3] = neighbour ? 200 : 255;
                    }
                }
            }

            // test if image obj exists
        }); */

        /*
            DRAW SCISSORS
         */
        if (this.drawScissors) {
            const explorerX = this.scissorsStartX < this.scissorsEndX ? this.scissorsStartX : this.scissorsEndX;
            const explorerY = this.scissorsStartY < this.scissorsEndY ? this.scissorsStartY : this.scissorsEndY;

            const scissorW = Math.abs(this.scissorsEndX - this.scissorsStartX);
            const scissorH = Math.abs(this.scissorsEndY - this.scissorsStartY);

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
        // this.ctx.resetTransform();
        // this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.putImageData(pic, 0, 0);
        // hitmapCtx.resetTransform();
        // hitmapCtx.clearRect(0, 0, this.width, this.height);
        hitmapCtx.putImageData(hitmap, 0, 0);
        // console.log(pic);
        // console.log(explorerPixel);

        // console.log({ w, h, tx, ty, pixel });
        // console.timeEnd('draw');
        const endTime = window.performance.now();
        const time = endTime - startTime;
        // console.log(`Draw: ${time}`);
        if (this.ui.showLogs || this.performanceTest) this.perfLogs.draw.push(Math.round(time * 1000) / 1000);
        if (time > this.maxDrawTime) {
            this.maxDrawTime = time;
            console.warn('new max draw time');
            console.warn(this.maxDrawTime);
        }
        // requestAnimationFrame(() => this.drawHitmap());
        this.valid = true;
        if (this.ui.showHeatmap) requestAnimationFrame(this.ui.drawHeatmap);
        // if (this.ui.showNavMap) requestAnimationFrame(this.ui.drawNavMapRect);
        if (this.ui.showNavHeatmap) requestAnimationFrame(this.ui.drawNavHeatmapRect);
    }

    zoom(wheelEvent) {
        // console.log('zoom event');
        // event can be a custom/dummy event
        if (wheelEvent.hasOwnProperty('preventDefault')) wheelEvent.preventDefault();
        if (Object.prototype.hasOwnProperty.call(wheelEvent, 'preventDefault')) wheelEvent.preventDefault();
        if (wheelEvent.hasOwnProperty('stopPropagation')) wheelEvent.stopPropagation();
        if (Object.prototype.hasOwnProperty.call(wheelEvent, 'preventDefault')) wheelEvent.stopPropagation();
        // console.log(wheelEvent)
        // const { nodeUnderMouse } = this;

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
            this.zoomStage += 0.2;
            this.changeScaleUp();
            // this.cluster *= this.clusterGrowth;
        }

        // Zoom out = decrease = wheel down = positiv delta Y
        if (wheelEvent.deltaY > 0) {
            console.log('zoom out');
            // this.scale2 -= 1;
            // this.scaleStage[this.zoomStage] || this.scaleStage[this.scaleStage.length - 1];
            this.zoomStage -= 0.2;
            this.changeScaleDown();
            // this.cluster /= this.clusterGrowth;
        }
        // console.log(this.zoomStage);
        // console.log(this.scale);

        const scaleChange = this.scale - oldScale;
        this.translateX -= offsetX * scaleChange;
        this.translateY -= offsetY * scaleChange;

        this.updateClustering();
        this.triggerDraw();

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
        // console.log(this.explorer.width);
        // console.log(this.ctx.width);

        // saving for checking if node was clicked in handleMouseUp
        const { nodeUnderMouse } = this;
        this.nodeOnMouseDown = nodeUnderMouse;

        // save start position
        this.startX = e.offsetX;
        this.startY = e.offsetY;

        // if there is no mouse under mouse then move everything
        if (nodeUnderMouse) {
            this.draggedNode = nodeUnderMouse;
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
            x: e.clientX - explorer.offsetLeft,
            y: e.clientY - explorer.offsetTop
        }; */

        const mouseX = e.offsetX;
        const mouseY = e.offsetY;

        if (this.scissors) {
            this.scissorsEndX = mouseX;
            this.scissorsEndY = mouseY;
            return this.triggerDraw();
        }

        // DRAG AND DROP
        if (this.draggedNode || this.panning) {
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
        this.nodeUnderMouse = nodeUnderMouse;
        this.ui.activeNode = nodeUnderMouse;
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
            this.triggerDraw();
            return;
        }
        const { nodeUnderMouse } = this;
        const ctrlKeyPressed = e.ctrlKey;
        // const shiftKeyPressed = e.shiftKey;
        // const altKeyPressed = e.altKey;

        if (nodeUnderMouse && nodeUnderMouse === this.nodeOnMouseDown) {
            // click event on a special node - do something
            console.log('click on node:');
            console.log(nodeUnderMouse);

            // used for components for adding nodes to special cases
            this.ui.clickedNode = nodeUnderMouse;

            // flag/unflag node as and add/remove from group
            if (ctrlKeyPressed && !this.ui.neighbourMode) {
                if (nodeUnderMouse.group) {
                    nodeUnderMouse.group = false;
                    nodeUnderMouse.groupId = 0;
                } else {
                    nodeUnderMouse.group = true;
                    nodeUnderMouse.groupId = this.ui.activeGroupId;
                }
                this.updateGroupCount();
            }

            if (this.ui.neighbourMode) {
                // if user removes a neighbour
                if (this.groupNeighbours[nodeUnderMouse.index]) {
                    // add node to removed neighbours
                    console.log('remove node from neighbours');
                    this.removedGroupNeighbours[nodeUnderMouse.index] = this.groupNeighbours[
                        nodeUnderMouse.index
                    ];
                    // remove node from neighbours
                    this.groupNeighbours[nodeUnderMouse.index] = undefined;
                } else if (this.removedGroupNeighbours[nodeUnderMouse.index]) {
                    // remove node from removed nodes and add it back again to neighbours
                    console.log('add removed node from neighbours back to neighbours');
                    this.groupNeighbours[nodeUnderMouse.index] = this.removedGroupNeighbours[nodeUnderMouse.index];
                    this.removedGroupNeighbours[nodeUnderMouse.index] = undefined;
                } else if (nodeUnderMouse.group) {
                    // nodeUnderMouse.group = false;
                    // nodeUnderMouse.groupId = 0;
                    // this.removedGroupNeighbours[nodeUnderMouse.index] = 1; // 1 is default threshold - isn't uses
                }
            }

            if (this.draggedNode) {
                // merge all "nearby nodes" to group
                if (this.draggedNode.group) {
                    this.addNodesInRangeToGroup();
                    this.updateGroupCount();
                }
                this.draggedNode = false;
                // update clustering after move one or more nodes
                this.createCluster();
                return; // draw triggers in create cluster
            }

            // todo update instead of recreate supercluster here maybe bedder? how?
            // update cluster cause of new embedding
        } else if (this.scissors) {
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
                        node.groupId = this.ui.activeGroupId;
                    }
                }
            });

            this.updateGroupCount();
            // reset
            this.scissors = false;
            this.ui.scissors = false;
            this.drawScissors = false;
        }
        this.triggerDraw();
    }

    handleDoubleClick(e) {
        console.log('Double click');
        /* if (this.nodeUnderMouse && this.nodeUnderMouse !== this.selection) {
            this.selection = this.nodeUnderMouse;
        } else this.selection = null; */
        if (this.moveGroupToMousePosition) {
            const x = (e.offsetX - this.translateX) / this.scale;
            const y = (e.offsetY - this.translateY) / this.scale;
            // move group members to mouse position
            Object.values(this.nodes).forEach((node) => {
                if (node.group) {
                    node.x += (x - node.x) / 2;
                    node.y += (y - node.y) / 2;
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
        const nodes = tree.within(
            this.lngX(this.draggedNode.x),
            this.latY(this.draggedNode.y),
            r,
        );
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
