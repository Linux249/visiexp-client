<template>
    <div class="body">
        <div class="sub-header">
            <div></div>


            <!--<div>
                <div class="row">
                    <div># {{nodesCount}}</div>
                    <div>connected: {{connectedToSocket}}</div>
                    &lt;!&ndash;<div @click="scaleUp" class="btn">+</div>
                    <div @click="scaleDown" class="btn">-</div>&ndash;&gt;
                </div>
            </div>-->
            <div class="row">
                <div class="labels" @mouseenter="showLabels = true" @mouseleave="showLabels = false">
                    <div class="btn">labels</div>
                    <div v-if="showLabels">
                        <div
                            v-for="(value, i) in labels"
                            class="btn"
                            :class="{ active: selectedLabel === value }"
                            :key="i"
                            @click="toogleLabel(value)"
                            v-bind:style="{'color': value}"
                        >
                            {{ value }}
                        </div>
                        <div
                            class="btn"
                            :class="{ active: showKLabels }"
                            @click="toggleShowKLabels"
                        >
                            K-Label
                        </div>
                    </div>
                </div>
                <div @click="toggleShowOptions" class="btn" :class="{ active: showOptions }">Options</div>
                <div @click="sendData" class="btn" >Update Data</div>
                <div class="tool-box row">
                    <div v-if="loadingNodes" class="loader" ></div>
                    <scissors :active="scissors" :clickHandler="selectScissors">a</scissors>
                </div>
            </div>
        </div>
        <div class="row">
            <canvas  ref="canvas" id="canvas" tabindex="0" ></canvas>
            <div class="details">
                <div v-if="showOptions" class="options info-box">
                    <div class="row-btn">
                        <div>Cluster: {{Math.round(cluster)}}</div>
                        <div class="row">
                            <div @click="changeCluster(-100)" class="btn">-100</div>
                            <div @click="changeCluster(-1000)" class="btn">-1000</div>
                            <div @click="changeCluster(100)" class="btn">+100</div>
                            <div @click="changeCluster(1000)" class="btn">+1000</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>ImageWidth: {{imgWidth}}</div>
                        <div class="row">
                            <div @click="changeImgWidth(-2)" class="btn">-2</div>
                            <div @click="changeImgWidth(2)" class="btn">+2</div>
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
                    <div class="row-btn">
                        <div>ScrollGrowth: {{scrollGrowth}}</div>
                        <div class="row">
                            <div @click="changeScrollGrowth(-0.01)" class="btn">-0.1</div>
                            <div @click="changeScrollGrowth(0.01)" class="btn">+0.1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>ScrollImgGrowth: {{scrollImgGrowth}}</div>
                        <div class="row">
                            <div @click="changeScrollImgGrowth(-0.01)" class="btn">-0.1</div>
                            <div @click="changeScrollImgGrowth(0.01)" class="btn">+0.1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>ClusterGrowth: {{clusterGrowth}}</div>
                        <div class="row">
                            <div @click="changeClusterGrowth(-0.01)" class="btn">-0.1</div>
                            <div @click="changeClusterGrowth(0.01)" class="btn">+0.1</div>
                        </div>
                    </div>

                    <!--<div class="row-btn">
                        <div>{{range}}}</div>
                        <range-slider v-model="cluster" type="range" min="0" max="800" step="10" />
                    </div>-->
                </div>

                <router-view
                    :nodes="cuttedNodes"
                    :labels="labels"
                    :node="clickedNode"
                    :getNode="getNode"
                    :changeActiveNode="changeActiveNode"
                />


                <div class="info-box">
                    <img class="img" v-if="activeNode.hasImage" :src="activeNode.image.src" />
                    <div>Name: {{activeNode.name}}</div>
                    <div>Label: {{activeNode.label}}</div>
                    <div>Labels: {{activeNode.labels}}</div>
                    <div>Links #: {{selectedNodeNeighboursCount}}</div>
                </div>
            </div>
        </div>
        <triplets :node="activeNode"/>
    </div>
</template>

<script>
import io from 'socket.io-client';
import Node from '../util/Node';
import CanvasState from '../util/CanvasState';

import RangeSlider from './RangeSlider';
import Triplets from './Triplets';
import Classifier from './Classifier';
import Scissors from '../icons/Scissors';

/*
    TODO:
    - rename imageWidth to imageSize
    - rename scale to zoom
*/

function makeImgageData(img) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    const data = context.getImageData(0, 0, img.width, img.height);
    console.log(data);
    return data;
}


export default {
    store: null,
    name: 'TsneMap',
    components: {
        Scissors,
        RangeSlider,
        Triplets,
        Classifier,
    },
    data: () => ({
        items: [],
        positives: [],
        negatives: [],
        // store: null,
        socket: null,
        connectedToSocket: false,
        loadingNodes: false,
        nodesCount: 0,
        scale: 0,
        scale2: 0,
        labels: [],
        selectedLabel: null,
        showLabels: false, // show the labels in a dropdown
        clickedNode: null,
        labelColor: '#6057ff',
        showKLabels: false,
        scissors: false,
        width: 0,
        height: 0,
        activeNode: {},
        cluster: 5, // default - set on mount from CanvasStore class
        imgWidth: 0, // default - set on mount from CanvasStore class
        activeImgWidth: 0, // default - set on mount from CanvasStore class
        borderWidth: 0, // default - set on mount from CanvasStore class
        range: 0,
        cuttedNodes: [], // selected nodes through scissor
        showOptions: false, // show options menu
        scrollGrowth: 0,
        scrollImgGrowth: 0,
        clusterGrowth: 0,

    }),
    methods: {
        getNode(i) {
            return this.store.getNode(i);
        },
        sendData() {
            console.log('send data clicked');
            const nodes = this.store.getNodes();
            // this.store.clear()
            this.store.resetStore();
            this.socket.emit('updateNodes', nodes);
            this.loadingNodes = true;
            this.nodesCount = 0;
        },

        changeActiveNode(n) {
            this.activeNode = n
            return null
        },

        //
        changeCluster(v) {
            // console.log("cluster more clicked")
            this.store.cluster += v; // update canvasState
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

        updateScale2(scale2) {
            this.scale2 = scale2;
        },

        changeImgWidth(v) {
            this.store.imgScale += v; // update canvasState
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

        addNodeToClassify(node) {
            console.log('addNodeToClassify');
            console.log(node);
            if (this.cuttedNodes.indexOf(node) === -1) this.cuttedNodes.push(node);
        },
        toggleShowOptions() {
            this.showOptions = !this.showOptions;
        },
        changeScrollGrowth(v) {
            this.store.scrollGrowth = Math.round((this.store.scrollGrowth + v) * 100) / 100;
            this.scrollGrowth = this.store.scrollGrowth;
        },
        changeScrollImgGrowth(v) {
            this.store.scrollImgGrowth = Math.round((this.store.scrollImgGrowth + v) * 100) / 100;
            this.scrollImgGrowth = this.store.scrollImgGrowth;
        },
        changeClusterGrowth(v) {
            this.store.clusterGrowth = Math.round((this.store.clusterGrowth + v) * 100) / 100;
            // this.clusterGrowth = this.store.clusterGrowth;
        },
        toggleShowKLabels() {
            this.showKLabels = !this.showKLabels;
            this.store.showKLabels = this.showKLabels;
            this.store.valid = false;
            console.log(this.showKLabels);
        },
        toogleLabel(label) {
            if (this.selectedLabel === label) this.selectedLabel = null;
            else this.selectedLabel = label;
            this.store.selectedLabel = this.selectedLabel;
            this.store.triggerDraw();
        },
        selectScissors() {
            console.log('selectScissors');
            this.scissors = !this.scissors;
            this.store.scissors = this.scissors;
        },

    },
    watch: {
        cluster(value) {
            console.log('change cluster');
            this.store.cluster = value;
        },
    },
    computed: {
        selectedNode() {
            return this.store && this.store.selection && this.store.selection.name;
        },
        selectedNodeNeighboursCount() {
            return this.activeNode.links && Object.keys(this.activeNode.links).length;
        },
        imageScale() {
            return this.store && this.store.selection && this.store.selection.imageScale;
        },
    },
    mounted() {
        const socket = io.connect('http://localhost:3000', {
            transports: ['websocket'],
            reconnectionDelay: 100,
            reconnectionDelayMax: 1000,
        });
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
        const s = new CanvasState(canvas, hitCanvas, socket, this);

        this.store = s;

        s.updateSelectionUI = this.updateSelection;
        s.updateScaleUI = this.updateScale;
        s.updateScale2UI = this.updateScale2;
        s.addNodeToClassify = this.addNodeToClassify;

        // sync values from UI to store
        s.labelColor = this.labelColor;

        // set init value in UI
        this.cluster = s.cluster;
        this.imgWidth = s.imgScale;
        this.activeImgWidth = s.activeImgScale;
        this.borderWidth = s.borderWidth;
        this.scrollGrowth = s.scrollGrowth;
        this.scrollImgGrowth = s.scrollImgGrowth;

        console.log('Save store');
        console.log(this.store);
        this.socket = socket;

        socket.on('connect', () => {
            this.connectedToSocket = true;
            console.log('conected'); // das wirft immer unde
            console.log(`Socket id: ${socket.id}`); // das wirft immer unde
            console.log(socket);
            // if there is allready data then this is just a reconnect
            const nodes = this.store.getNodes();
            console.log('nodes in store while connect (its maybe just a reconnect)');
            console.log(nodes);
            if (!Object.keys(nodes).length && !this.loadingNodes) {
                socket.emit('updateNodes', {});
                this.loadingNodes = true;
            }
            // s.clear() // maybe there is something inside?
        });
        socket.on('disconnect', (reason) => {
            this.connectedToSocket = false;
            console.log(`disconnect: ${reason}`); // das wirft immer unde
            console.log(socket);
            // s.clear() // maybe there is something inside?
        });

        socket.on('node', (data, cb) => {
            if (data.index % 100 === 0) {
                console.log(`receive node ${data.index}`);
                console.log(data);
            }

            s.addNode(new Node(data, s.ctx, s.hitCtx));
            s.triggerDraw();
            cb(data.index);
        });

        socket.on('receiveImage', (data) => {
            // console.log('receive image data');
            // console.log(data);
            const node = s.nodes[data.index];
            // console.log(node);
            node.image.src = `data:image/jpeg;base64,${data.buffer}`;
            node.hasImage = true;
            s.valid = false;
        });

        socket.on('allNodesUpdated', () => {
            this.loadingNodes = false;
        });
        socket.on('nodesCount', (nodesCount) => {
            console.log(`nodesCount: ${nodesCount}`);
            this.nodesCount = nodesCount;
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

        socket.on('connect_error', () => {
            console.log('connect_error');
        });

        socket.on('connect_timeout', () => {
            console.log('connect_timeout');
        });

        socket.on('reconnect', () => {
            console.log('reconnect');
        });

        socket.on('connecting', () => {
            console.log('connecting');
        });

        socket.on('reconnecting', () => {
            console.log('reconnecting');
        });

        socket.on('connect_failed', () => {
            console.log('connect_failed');
        });

        socket.on('reconnect_failed', () => {
            console.log('reconnect_failed');
        });

        socket.on('close', () => {
            console.log('close');
        });
    },
    beforeDestroy() {
        // end connection with server socket
        if (this.socket) this.socket.disconnect();
        // clear check-for-drawing interval
        clearInterval(this.store.timerId);
    },
};
</script>

<style scoped>
    #canvas {
        height: 700px;
        margin: 5px;
        background-color: white;
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
    }

    .sub-header {
        display: flex;
        justify-content: space-between;
        /*align-items: center;*/
        height: 2.5rem;
        padding: 5px;
    }

    .body {
        /*width: 100%;*/
        /*height: 100%;*/
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

    .loader {
        border: 3px solid #f3f3f3; /* Light grey */
        border-top: 3px solid #6772e5; /* Blue */
        border-radius: 50%;
        width: 15px;
        height: 15px;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .labels {
        /*display: flex;*/
        /*flex-direction: column;*/
        z-index: 1;
    }

</style>
