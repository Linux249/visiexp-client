<template>
    <div class="tsne-map">
        <div class="header">
            <div class="left-header">
                <router-link to="/">t-SNE</router-link>
                <router-link to="/svm">SVM</router-link>
                <router-link to="/classifier">Classifier</router-link>
                <router-link to="/dataset">Dataset</router-link>
                <router-link to="/options">Options</router-link>
            </div>
            <div class="right-header">
                <div class="btn" @click="toggleWasmMode" :class="{ active: wasmMode }">
                    wasm
                </div>
                <div :class="{ active: loadingNodes }" @click="sendData" class="btn">
                    Update
                    <send v-if="!loadingNodes"></send>
                    <div class="loader" v-if="loadingNodes"></div>
                </div>
                <div :class="{ active: showInfo }" @click="showInfo = !showInfo" class="btn">
                    <help></help>
                </div>
                <!--<div
                    @click="toggleUpdateEmbedding"
                    :class="{ active: autoUpdateEmbedding }"
                    class="btn"
                >
                    {{ autoUpdateEmbedding ? 'stop' : 'start' }}
                    <play v-if="!autoUpdateEmbedding"></play>
                    <stop v-if="autoUpdateEmbedding"></stop>
                </div>-->
            </div>
        </div>
        <div class="row body">
            <div class="explorer">
                <canvas class="canvas" id="canvas" ref="canvas" tabindex="0"></canvas>
                <div class="box top right">
                    <div class="row">
                        <div :class="{ active: target }" @click="selectTarget" class="btn">
                            <target></target>
                        </div>
                        <div :class="{ active: scissors }" @click="selectScissors" class="btn">
                            <scissors></scissors>
                        </div>
                        <div @click="clearGroup" class="btn">
                            <x></x>
                        </div>
                    </div>
                    <div class="row-end">
                        <div
                            :class="{ active: showHeatmap }"
                            @click="toggleShowHeatmap"
                            class="btn"
                        >
                            <navmap></navmap>
                        </div>
                        <div
                            :class="{ active: showNavHeatmap }"
                            @click="toggleShowNavHeatmap"
                            class="btn"
                        >
                            <navmap></navmap>
                        </div>
                    </div>
                </div>
                <div class="box top left">
                    <div :if="nodesTotal" class="btn">{{ nodesRecived + '/' + nodesTotal }}</div>
                </div>
                <div class="box bottom left">
                    <div :class="{ hide: !showHeatmap }">
                        <canvas
                            class="canvas"
                            id="heatmap"
                            style="margin: 0.5rem; border-radius: 4px"
                            tabindex="0"
                        ></canvas>
                    </div>
                    <div :class="{ hide: !showNavHeatmap }" class="navMap">
                        <canvas
                            class="canvas"
                            id="navHeatmap"
                            style="margin: 0.5rem; border-radius: 4px"
                            tabindex="0"
                        ></canvas>
                        <canvas
                            id="navHeatmapRect"
                            style="margin: 0.5rem; border-radius: 4px"
                            tabindex="0"
                        ></canvas>
                    </div>
                </div>
                <div class="box bottom right">
                    <div class="row">
                        <div @click="changeScaleDown()" class="btn">
                            <minimize></minimize>
                        </div>
                        <div @click="changeScaleUp()" class="btn">
                            <maximize></maximize>
                        </div>
                    </div>
                    <div class="row">
                        <div @click="changeImgSize(-1)" class="btn">
                            <img-size-down></img-size-down>
                        </div>
                        <div @click="changeImgSize(1)" class="btn">
                            <img-size-up></img-size-up>
                        </div>
                    </div>
                </div>
            </div>

            <div class="details">
                <div class="area" v-if="$route.path === '/options'">
                    <div class="title">Options</div>
                    <!--<div class="option-title">Old cluster</div>
                    <div class="row-btn">
                        <div>Cluster: {{ Math.round(cluster) }}</div>
                        <div class="row">
                            <div @click="changeCluster(-10)" class="btn">-10</div>
                            <div @click="changeCluster(-100)" class="btn">-100</div>
                            <div @click="changeCluster(100)" class="btn">+100</div>
                            <div @click="changeCluster(10)" class="btn">+10</div>
                        </div>
                    </div>-->
                    <!--<div class="row-btn">
                        <div>Cluster: growth: {{ clusterGrowth }}</div>
                        <div class="row">
                            <div @click="changeClusterGrowth(-0.01)" class="btn">-0.1</div>
                            <div @click="changeClusterGrowth(0.01)" class="btn">+0.1</div>
                        </div>
                    </div>-->
                    <div class="row-btn">
                        <div>Save:</div>
                        <div class="row">
                            <div @click="saveCanvas" class="btn">
                                <save></save>
                            </div>
                        </div>
                    </div>
                    <div class="option-title">Image</div>
                    <div class="row-btn">
                        <div>Alpha (base): {{ alphaBase }}</div>
                        <div class="row">
                            <div @click="changeAlphaBase(-10)" class="btn">-10</div>
                            <div @click="changeAlphaBase(10)" class="btn">+10</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Aplha (increase): {{ alphaIncrease }}</div>
                        <div class="row">
                            <div @click="changeAlphaIncrease(-10)" class="btn">-10</div>
                            <div @click="changeAlphaIncrease(10)" class="btn">+10</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Represent: size: {{ representImgSize }}</div>
                        <div class="row">
                            <div @click="changeRepresentImgSize(-1)" class="btn">
                                <img-size-down></img-size-down>
                            </div>
                            <div @click="changeRepresentImgSize(1)" class="btn">
                                <img-size-up></img-size-up>
                            </div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Represent: alpha</div>
                        <div
                            :class="{ active: representMaxAlpha }"
                            @click="togglerepresentMaxAlpha"
                            class="btn"
                        >
                            {{ representMaxAlpha ? 'On' : 'Off' }}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Represent: sort</div>
                        <div :class="{ active: repsMode }" @click="toogleRepsMode" class="btn">
                            {{ repsMode === 0 ? 'normal' : repsMode === 1 ? 'before' : 'behind' }}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Similar: size: {{ neighbourImgSize }}</div>
                        <div class="row">
                            <div @click="changeNeighbourImgSize(-1)" class="btn">
                                <img-size-down></img-size-down>
                            </div>
                            <div @click="changeNeighbourImgSize(1)" class="btn">
                                <img-size-up></img-size-up>
                            </div>
                        </div>
                    </div>
                    <!--<div class="option-title">Other</div>
                    <div class="row-btn">
                        <div>zoomStage: {{ zoomStage }}</div>
                        <div class="row">
                            <div @click="changeZoomStage(-1)" class="btn"><minus></minus></div>
                            <div @click="changeZoomStage(1)" class="btn"><plus></plus></div>
                        </div>
                    </div>-->
                    <div class="option-title">Rank/Clique</div>
                    <div class="row-btn">
                        <div>Sort</div>
                        <div :class="{ active: sorted }" @click="sortNodes" class="btn">
                            {{ sorted ? 'On' : 'Off' }}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Size</div>
                        <div
                            :class="{ active: sizeRankedMode }"
                            @click="toggleSizeRankedMode"
                            class="btn"
                        >
                            {{ sizeRankedMode ? 'On' : 'Off' }}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Multiplier: {{ sizeRange }}</div>
                        <div class="row">
                            <div @click="changeSizeRange(-1)" class="btn">
                                <minus></minus>
                            </div>
                            <div @click="changeSizeRange(1)" class="btn">
                                <plus></plus>
                            </div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Border</div>
                        <div
                            :class="{ active: boarderRankedMode }"
                            @click="toggleBoarderRankedMode"
                            class="btn"
                        >
                            {{ boarderRankedMode ? 'On' : 'Off' }}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div
                            :class="{ activeColor: selectedGradient === i }"
                            :key="i"
                            @click="changeGradientColor(i)"
                            class="color"
                            v-bind:style="{
                                backgroundColor: `rgb(${color[0]},${color[1]},${color[2]})`,
                            }"
                            v-for="(color, i) in gradient"
                        >
                            {{ '.' + i }}
                        </div>
                    </div>
                    <slider-picker @input="changeColor" style="width: inherit;" v-model="colors" />
                    <div class="option-title">Heatmap</div>
                    <div class="row-btn">
                        <div>Radius: {{ heatmapRadius }}</div>
                        <div class="row">
                            <div @click="changeHeatmapRadius(-1)" class="btn">
                                <minus></minus>
                            </div>
                            <div @click="changeHeatmapRadius(1)" class="btn">
                                <plus></plus>
                            </div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Blur: {{ heatmapBlur }}</div>
                        <div class="row">
                            <div @click="changeHeatmapBlur(-1)" class="btn">
                                <minus></minus>
                            </div>
                            <div @click="changeHeatmapBlur(1)" class="btn">
                                <plus></plus>
                            </div>
                        </div>
                    </div>
                    <div class="option-title">Cluster</div>
                    <div class="row-btn">
                        <div>Cluster: radius: {{ clusterRadius }}</div>
                        <div class="row">
                            <div @click="changeClusterRadius(-1)" class="btn">
                                <minus></minus>
                            </div>
                            <div @click="changeClusterRadius(1)" class="btn">
                                <plus></plus>
                            </div>
                            <div @click="updateCluster()" class="btn">update</div>
                        </div>
                    </div>
                    <div class="option-title">Performance</div>
                    <div class="row-btn">
                        <div>Monitor</div>
                        <div :class="{ active: showLogs }" @click="toggleShowLogs" class="btn">
                            {{ showLogs ? 'On' : 'Off' }}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Show Hitmap</div>
                        <div :class="{ active: toggle }" @click="toggleShowHitmap" class="btn">
                            {{ toggle ? 'On' : 'Off' }}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Double Nodes</div>
                        <div @click="doubleNodes" class="btn">double</div>
                    </div>
                    <div class="row-btn">
                        <div>100xDraw</div>
                        <div @click="testPerformance" class="btn">TODO</div>
                    </div>

                    <!--<div class="row-btn">-->
                    <!--<div>Cluster: tile: {{ clusterTile }}</div>-->
                    <!--<div class="row">-->
                    <!--<div @click="changeClusterTile(-1)" class="btn"><minus></minus></div>-->
                    <!--<div @click="changeClusterTile(1)" class="btn"><plus></plus></div>-->
                    <!--</div>-->
                    <!--</div>-->
                </div>

                <div class="area" v-if="!neighbourMode">
                    <div class="title">Groups</div>
                    <div class="group-list" v-if="this.savedGroups.length">
                        <div
                            :key="i"
                            class="group-item row-between"
                            v-for="(group, i) in savedGroups"
                        >
                            <div
                                :class="{ active: group.groupId === activeGroupId }"
                                @click="selectGroup(i)"
                                class="btn"
                            >
                                {{ `${group.name}` }}
                            </div>
                            <div>{{ `#${group.count}` }}</div>
                            <select
                                :style="{
                                    width: '3rem',
                                    backgroundColor: `rgb(${groupColours[group.colorId][0]},${
                                        groupColours[group.colorId][1]
                                    },${groupColours[group.colorId][2]})`,
                                }"
                                @change="changeGroupColor($event, i)"
                                class="btn"
                            >
                                <option
                                    :id="group.colorId"
                                    :key="id"
                                    :selected="+group.colorId === +id"
                                    :style="{
                                        backgroundColor: `rgb(${color[0]},${color[1]},${color[2]})`,
                                    }"
                                    :value="id"
                                    v-for="(color, id) in groupColours"
                                >
                                </option>
                            </select>
                            <div
                                :class="{
                                    active: neighbourMode && group.groupId === activeGroupId,
                                }"
                                @click="handleNeighbourMode(i)"
                                class="btn"
                            >
                                <play
                                    v-if="!(neighbourMode && group.groupId === activeGroupId)"
                                ></play>
                                <stop
                                    v-if="neighbourMode && group.groupId === activeGroupId"
                                ></stop>
                            </div>
                            <div @click="deleteGroup(i)" class="btn">
                                <trash></trash>
                            </div>
                        </div>
                    </div>
                    <div class="row v-center">
                        <input class="input" type="text" v-model="groupName" />
                        <div @click="saveGroup" class="btn">save group</div>
                    </div>
                </div>

                <neighbours
                    :activeGroupId="activeGroupId"
                    :changeNeighboursThreshold="changeNeighboursThreshold"
                    :getStore="getStore"
                    :neighboursThreshold="neighboursThreshold"
                    :stop="stopNeighbourMode"
                    v-if="neighbourMode"
                />

                <router-view
                    :changeActiveNode="changeActiveNode"
                    :dataset="dataset"
                    :getNode="getNode"
                    :getStore="getStore"
                    :handleChangeDataset="switchDataset"
                    :labels="labels"
                    :node="clickedNode"
                    :nodes="cuttedNodes"
                    :selectedImgCount="selectedImgCount"
                />

                <div class="area padding" v-if="activeNode">
                    <img
                        :alt="activeNode.name"
                        :src="activeNode.image.src"
                        class="active-img"
                        v-if="activeNode.hasImage"
                    />
                    <div class="loader" v-if="activeNode.imgLoading"></div>
                    <div>Name: {{ activeNode.name }}</div>
                    <!--<div>X:Y: {{activeNode.x + ":" + activeNode.y}}</div>-->
                    <div class="row">
                        Labels:
                        <div :key="label" class="label" v-for="label in activeNode.labels">
                            {{ label }}
                        </div>
                    </div>
                </div>

                <div class="area info-box" v-if="showInfo && !neighbourMode">
                    <div class="row v-center">
                        1. mark images with
                        <div class="btn">Click</div>
                        /
                        <scissors class="btn"></scissors>
                    </div>
                    <div class="row v-center">
                        2. create groups with
                        <div class="btn">save group</div>
                    </div>
                    <div class="row v-center">
                        3. get proposals with
                        <play class="btn"></play>
                    </div>
                    <div class="row v-center">4. repeat with other groups</div>
                    <div class="row v-center">5. update embedding</div>
                </div>
                <div class="area info-box" v-if="showInfo && neighbourMode">
                    <div class="row v-center">
                        1. mark wrong with
                        <div class="btn">Click</div>
                    </div>
                    <div class="row v-center">2. update proposals and iterate</div>
                    <div class="row v-center">3. stop with</div>
                </div>

                <logs :getStore="getStore" v-if="showLogs" />
            </div>
        </div>
    </div>
</template>

<script>
import io from 'socket.io-client';
import simpleheat from 'simpleheat';
import { Slider } from 'vue-color';
import { instantiateStreaming } from 'assemblyscript/lib/loader';
import Node from '../util/Node';
import ExplorerState from '../util/ExplorerState';
import groupColors from '../config/groupColors';
import Neighbours from './Neighbours';
import Scissors from '../icons/Scissors';
import X from '../icons/X';
import Play from '../icons/Play';
import Stop from '../icons/Stop';
import Save from '../icons/Save';
import Send from '../icons/Send';
import Help from '../icons/Help';
import Navmap from '../icons/Map';
import Target from '../icons/Target';
import Maximize from '../icons/Maximize';
import Minimize from '../icons/Minimize';
import ImageSizeUp from '../icons/ImageSizeUp';
import ImageSizeDown from '../icons/ImageSizeDown';
import Plus from '../icons/Plus';
import Minus from '../icons/Minus';
import Logs from './Logs';
import Trash from '../icons/Trash';
import { apiUrl } from '../config/apiUrl';
import wasm from '../assets/wasm/optimized.wasm';
import { logYellow } from '../util/logging';

export default {
    store: null,
    name: 'TsneMap',
    props: {
        dataset: String,
        switchDataset: Function,
        toggleWasmMode: Function,
        userId: Number,
        selectedImgCount: Number,
        wasmMode: Boolean,
        loadOldDataset: Boolean,
    },
    components: {
        Scissors,
        X,
        Play,
        Stop,
        Save,
        Send,
        Help,
        Navmap,
        Target,
        // Groups,
        Neighbours,
        Logs,
        'slider-picker': Slider,
        Maximize,
        Minimize,
        'img-size-up': ImageSizeUp,
        'img-size-down': ImageSizeDown,
        Plus,
        Minus,
        Trash,
    },
    data: () => ({
        // store: null,
        socket: null,
        connectedToSocket: false,
        loadingNodes: false,
        nodesTotal: 0,
        nodesRecived: 0,
        initPython: false,
        scale: 0, // default - will update later
        labels: [],
        selectedLabel: null, // save the selected label
        selectedCategory: null,
        showLabels: false, // show the labels in a dropdown
        clickedNode: null,
        scissors: false,
        target: false,
        activeNode: null,
        cluster: 5, // default - set on mount from CanvasStore class
        clusterRadius: 0, // default - set on mount from CanvasStore class
        clusterTile: 0, // default - set on mount from CanvasStore class
        imgSize: 0, // default - set on mount from CanvasStore class
        representImgSize: 0, // default - set on mount from CanvasStore class
        neighbourImgSize: 0, // default - set on mount from CanvasStore class
        alphaBase: 100,
        alphaIncrease: 30,
        range: 0,
        cuttedNodes: [], // selected nodes through scissor
        // showOptions: false, // show options menu
        clusterGrowth: 0,
        showHeatmap: false,
        heatmapRadius: 1,
        heatmapBlur: 5,
        showNavHeatmap: false,
        sizeRankedMode: false,
        boarderRankedMode: false,
        clusterMode: false, // flag if first clustering was calculated
        // oldClusterMode: false,
        neighbourMode: false,
        repsMode: 0,
        gradient: [
            [50, 250, 0], // 9
            [100, 250, 0], // 8
            [150, 250, 0], // 7
            [200, 250, 0], // 6
            [255, 250, 0], // 5
            [255, 150, 0], // 4
            [255, 150, 0], // 3
            [255, 100, 0], // 2
            [255, 50, 0], // 1
            [255, 0, 0], // 0
        ],
        toggle: false,
        zoomStage: 0,
        showGroups: true,
        sorted: false,
        sizeRange: 0,
        showColorPicker: false,
        colors: {
            hex: '#194d33',
            hsl: {
                h: 150,
                s: 0.5,
                l: 0.2,
                a: 1,
            },
            hsv: {
                h: 150,
                s: 0.66,
                v: 0.3,
                a: 1,
            },
            rgba: {
                r: 25,
                g: 77,
                b: 51,
                a: 1,
            },
            a: 1,
        },
        selectedGradient: 0, // default is the first
        // autoUpdateEmbedding: false,
        socketId: '',
        // dataset: '001', // defualt value is 001
        neighboursThreshold: 15,
        activeGroupId: 0,
        representMaxAlpha: false,
        savedGroups: [],
        groupName: '',
        groupCounter: 0, // 0 is no group, counter inc for first use
        groupColours: groupColors,
        showLogs: false,
        showInfo: true,
        state2: undefined,
        memory: undefined,
        drawCtx: undefined,
        initOffset: 0,
        offset: 0,
        memoryView: undefined,
        pixelView: undefined,
        canvasW: 0,
        canvasH: 0,
        canvasPixelSize: 0,
        cachedNodes: undefined, // cache the nodes if 'updateEmbedding is faster than loading nodes
    }),
    methods: {
        getNode(i) {
            return this.store.getNode(i);
        },
        getStore() {
            return this.store;
        },
        sendData() {
            console.log('send data clicked');
            // console.log(this.store.nodes);
            // console.log(nodes);
            if (!this.loadingNodes && this.initPython) {
                const nodes = this.store.getNodes();
                // this.store.resetStore();
                this.loadingNodes = true;
                this.socket.emit('updateEmbedding', {
                    nodes,
                    datasetId: this.dataset,
                    userId: this.userId,
                    count: this.selectedImgCount,
                });
                this.$notify({
                    group: 'default',
                    title: 'Update embedding',
                });
                // this.reset();
            } else {
                this.$notify({
                    group: 'default',
                    title: 'update embedding still in progress',
                    type: 'error',
                });
            }
        },

        // called from socket.on('updateEmbedding')
        updateEmbedding(data) {
            logYellow('Socket: updateEmbedding');
            console.log(data);
            // not every handler sends a cb
            // if (cb) cb({ stopped: this.autoUpdateEmbedding });
            if (!this.loadingNodes) {
                this.store.updateNodes(data.nodes);
                // todo check if necessary after have a good solution for best place for init clustering
                this.store.createCluster();
                this.loadingNodes = false;
                this.$notify({
                    group: 'default',
                    title: 'Embedding updated', // todo add time maybe
                    type: 'success',
                });
            } else {
                this.cachedNodes = data;
                this.$notify({
                    group: 'default',
                    title: 'Embedding updated but nodes still loading', // todo add time maybe
                    type: 'success',
                    text: 'Nodes will be updated after finishing loading',
                });
            }
        },

        changeActiveNode(n) {
            this.activeNode = n;
            return null;
        },

        clearGroup() {
            this.store.clearGroup();
            this.activeGroupId = null;
            this.neighbourMode = false;
        },

        setActiveGroup(id) {
            this.activeGroupId = id;
            this.store.triggerDraw();
        },

        changeNeighboursThreshold({ target }) {
            console.log('changeNeighboursThreshold');
            // console.log(target.value);
            this.neighboursThreshold = +target.value;
            this.store.triggerDraw();
        },

        changeCluster(v) {
            // console.log("cluster more clicked")
            this.store.cluster += v; // update explorerState
            this.cluster = this.store.cluster; // update ui
        },

        changeClusterRadius(v) {
            this.store.clusterRadius += v; // update ui
            this.clusterRadius = this.store.clusterRadius;
        },
        changeClusterTile(v) {
            this.store.clusterTile += v; // update ui
            this.clusterTile = this.store.clusterTile;
        },

        sortNodes() {
            this.store.sortNodes();
            this.sorted = this.store.sorted;
        },

        drawHeatmap() {
            console.time('drawHeatmap');
            const { heatmap } = this;

            // data in form of [[x,y,v], [x,y,v], ...]
            const data = Object.values(this.store.getNodes()).map((node) => {
                const x = (node.x * this.store.scale + this.store.translateX) / 4;
                const y = (node.y * this.store.scale + this.store.translateY) / 4;
                return [x, y, 1];
            });

            // refresh radius before drawing
            heatmap.radius(this.heatmapRadius, this.heatmapBlur);

            // add data
            heatmap.data(data); // setting data clear the old one

            // draw heatmap
            heatmap.draw(/* this.heatmapMinOpacity */);
            requestAnimationFrame(() => console.timeEnd('drawHeatmap'));
        },

        drawNavHeatmap() {
            console.time('drawNavHeatmap');
            const { navHeatmap } = this;
            const w = this.navHeatmapRect.width;
            const h = this.navHeatmapRect.height;

            // data in form of [[x,y,v], [x,y,v], ...]
            const data = Object.values(this.store.getNodes()).map((node) => {
                const x = node.x * 5 + w / 2;
                const y = node.y * 5 + h / 2;
                return [x, y, 1];
            });

            // refresh radius before drawing
            navHeatmap.radius(this.heatmapRadius, this.heatmapBlur);

            // add data
            navHeatmap.data(data); // setting data clear the old one

            // draw heatmap
            navHeatmap.draw(/* this.heatmapMinOpacity */);
            requestAnimationFrame(() => console.timeEnd('drawNavHeatmap'));
        },

        drawNavHeatmapRect() {
            console.time('drawNavHeatmapRect');
            const ctx = this.navHeatmapRect.getContext('2d');
            const scale = 20 / this.store.scale;
            const tx = this.store.translateX / 4;
            const ty = this.store.translateY / 4;

            const w = this.navHeatmapRect.width;
            const h = this.navHeatmapRect.height;

            // const x = tx + w/2 ;
            const x = w / 2 - tx * scale;
            // const y = ty + h/2;
            const y = h / 2 - ty * scale;

            ctx.clearRect(0, 0, this.navHeatmapRect.width, this.navHeatmapRect.height);
            ctx.strokeRect(x, y, w * scale, h * scale);
            requestAnimationFrame(() => console.timeEnd('drawNavHeatmapRect'));
        },

        toggleShowNavHeatmap() {
            this.showNavHeatmap = !this.showNavHeatmap;
            if (this.showNavHeatmap) requestAnimationFrame(this.drawNavHeatmap);
            if (this.showNavHeatmap) {
                requestAnimationFrame(this.drawNavHeatmapRect);
            }
        },

        toggleShowHeatmap() {
            this.showHeatmap = !this.showHeatmap;
            if (this.showHeatmap) requestAnimationFrame(this.drawHeatmap);
        },

        toggleSizeRankedMode() {
            this.sizeRankedMode = !this.sizeRankedMode;
            this.store.triggerDraw();
        },

        toggleBoarderRankedMode() {
            this.boarderRankedMode = !this.boarderRankedMode;
            this.store.triggerDraw();
        },

        activateClusterMode() {
            this.clusterMode = true;
            this.store.createCluster();
        },

        changeImgSize(v) {
            this.store.imgSize += v;
            this.imgSize = this.store.imgSize;
            this.store.triggerDraw();
        },

        // toggleShowOptions() {
        //     this.showOptions = !this.showOptions;
        // },

        doubleNodes() {
            this.store.doubleNodes();
        },
        changeClusterGrowth(v) {
            this.store.clusterGrowth = Math.round((this.store.clusterGrowth + v) * 100) / 100;
            // this.clusterGrowth = this.store.clusterGrowth;
        },
        changeZoomStage(v) {
            this.store.zoomStage += v;
            // this.zoomStage = this.store.zoomStage;
            this.store.triggerDraw();
        },

        changeScaleUp() {
            const canvas = document.getElementById('canvas');
            this.store.zoomStage -= 1; // undoing image resize
            const event = {
                deltaY: -1,
                offsetX: Math.round(canvas.width / 2),
                offsetY: Math.round(canvas.height / 2),
            };
            this.store.zoom(event);
        },

        changeScaleDown() {
            const canvas = document.getElementById('canvas');
            this.store.zoomStage += 1; // undoing image resize
            const event = {
                deltaY: 1,
                offsetX: Math.round(canvas.width / 2),
                offsetY: Math.round(canvas.height / 2),
            };
            this.store.zoom(event);
        },

        changeHeatmapRadius(v) {
            this.heatmapRadius += v;
            this.drawHeatmap();
            this.drawNavHeatmap();
        },
        changeHeatmapBlur(v) {
            this.heatmapBlur += v;
            this.drawHeatmap();
            this.drawNavHeatmap();
        },

        changeSizeRange(v) {
            this.store.sizeRange += v;
            this.sizeRange = this.store.sizeRange;
            this.store.triggerDraw();
        },

        selectTarget() {
            this.target = !this.target;
            this.store.moveGroupToMousePosition = this.target;
        },
        selectScissors() {
            console.log('selectScissors');
            this.scissors = !this.scissors;
            this.store.scissors = this.scissors;
        },
        reset() {
            this.loadingNodes = true;
            this.nodesRecived = 0;
            this.nodesTotal = 0;
        },

        togglerepresentMaxAlpha() {
            this.representMaxAlpha = !this.representMaxAlpha;
            this.store.triggerDraw();
        },

        changeAlphaBase(n) {
            this.alphaBase += n;
            this.store.triggerDraw();
        },

        changeAlphaIncrease(n) {
            this.alphaIncrease += n;
            this.store.triggerDraw();
        },

        toogleRepsMode() {
            this.repsMode = (this.repsMode + 1) % 3;
            this.store.triggerDraw();
        },

        toggleShowHitmap() {
            this.toggle = !this.toggle;
        },

        changeGradientColor(i) {
            console.log('changeGradientColor');
            // console.log(this.gradient);
            this.selectedGradient = i;
            console.log(this.selectedGradient);
            this.colors.rgba.r = this.gradient[i][0];
            this.colors.rgba.g = this.gradient[i][1];
            this.colors.rgba.b = this.gradient[i][2];
            console.log(this.colors.rgba);
        },

        changeColor(color) {
            console.log('changeColor');
            console.log(color);
            const { rgba } = color;
            console.log(rgba);
            this.gradient.splice(this.selectedGradient, 1, [rgba.r, rgba.g, rgba.b]);
        },

        /* async toggleUpdateEmbedding() {
            this.autoUpdateEmbedding = !this.autoUpdateEmbedding;
            if (this.autoUpdateEmbedding) {
                console.log('startUpdateEmbedding');
                console.log(this.socketId);

                try {
                    const body = JSON.stringify({
                        nodes: this.store.getNodes(),
                        socketId: this.socketId,
                        userId: this.userId,
                    });
                    await fetch(`${apiUrl}/api/v1/startUpdateEmbedding`, {
                        method: 'POST',
                        headers: { 'Content-type': 'application/json' },
                        body,
                    }).then(res => res.text());
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.log('stopUpdateEmbedding');
            }
        }, */

        updateCluster() {
            this.store.createCluster();
        },

        changeRepresentImgSize(v) {
            this.store.representImgSize += v;
            this.representImgSize = this.store.representImgSize;
            this.store.triggerDraw();
        },

        changeNeighbourImgSize(v) {
            this.store.neighbourImgSize += v;
            this.neighbourImgSize = this.store.neighbourImgSize;
            this.store.triggerDraw();
        },

        saveCanvas() {
            this.store.save();
        },

        saveGroup() {
            // save the actually group
            this.groupCounter += 1;
            const groupId = this.groupCounter;

            // get the name
            const name = this.groupName || `Group ${groupId}`;

            // get the ids of the groupd nodes
            this.savedGroups.push({
                groupId,
                name,
                count: 0,
                colorId: groupId % Object.keys(this.groupColours).length,
            });

            this.activeGroupId = groupId;
            this.store.saveGroup(groupId);
            this.store.triggerDraw();
        },

        selectGroup(i) {
            const { groupId } = this.savedGroups[i];
            if (groupId === this.activeGroupId) {
                // console.log('unselect');
                this.setActiveGroup(null);
                this.store.clearGroup();
            } else {
                console.log('select');
                this.store.loadGroupByGroupId(groupId);
                this.setActiveGroup(groupId);
            }
        },

        changeGroupColor(e, i) {
            console.log('changeGroupColor', e.target.value, i);
            console.log(this.savedGroups[i]);
            this.savedGroups[i].colorId = e.target.value;
            console.log(this.savedGroups[i]);
            this.store.triggerDraw();
        },

        deleteGroup(i) {
            const { groupId } = this.savedGroups[i];
            this.savedGroups.splice(i, 1);
            this.store.deleteGroup(groupId);
        },

        handleNeighbourMode(i) {
            // set group to active if not already set
            const { groupId } = this.savedGroups[i];
            // the button is accessibly even if the group is not active
            if (groupId !== this.activeGroupId) this.selectGroup(i);
            // switch to neighbourmode
            if(this.savedGroups[i].count !== 0) {
                this.neighbourMode = !this.neighbourMode;
                this.store.triggerDraw();
            } else {
                this.$notify({
                    group: 'default',
                    title: 'Group empty',
                    type: 'error',
                    text: 'Please select some images before'
                })
            }
        },

        stopNeighbourMode() {
            this.neighbourMode = false;
        },

        toggleShowLogs() {
            this.showLogs = !this.showLogs;
        },

        testPerformance() {
            this.store.testPerformance();
        },

        handleResize(e) {
            logYellow('resize');
            console.log(e);
            this.updateCanvasSize();
            this.store.draw();
        },

        addNode(node) {
            console.warn(node);
            console.warn(`Add Node ${node.index}:`);
            const addNode1 = this.state2.addNode(node.x, node.y, node.index);
            // console.log({addNode1});
            console.log(this.offset);

            for (let i = 0; i < 10; i += 1) {
                const img = node.imageData[i];
                // console.log(img.data.byteLength, img.width, img.height, this.offset, node.x, node.y);
                // console.log({ img });

                // add img buffer to memory: Crete a view over the buffer and set use the viewer to set the data
                this.memoryView.set(img.data, this.offset, img.data.buffer.length);
                this.state2.addPic(node.index, img.width, img.height, this.offset);

                // const checkSum = img.data.reduce((a, e) => a + e, 0);
                // const realSum = this.state2.checkSum(node.index);
                // const getNodeXY = 0 // this.state2.getNodeXY(node.index);
                // console.log({checkSum, realSum, getNodeXY});

                this.offset += img.data.byteLength;
            }
            this.draw2();
        },

        draw2() {
            console.time('DRAW2');
            try {
                console.warn('DRAW2');
                // console.log(this.emptyDrawPixel, this.memoryView, this.pixelView.data)
                // const clear = this.state2.clear();
                // console.log({ clear });
                // console.log(`checksum draw empty: ${this.state2.checkSum()}`);

                const draw = this.state2.draw();
                // console.log({ draw });
                // console.log(`checksum draw after: ${this.state2.checkSum()}`);

                // clear canvas
                // this.drawCtx.clearRect(0, 0, this.canvasW, this.canvasH)

                // console.log(this.emptyDrawPixel, this.memoryView, this.pixelView)

                this.drawCtx.putImageData(this.pixelView, 0, 0);
                // const checkDraw = this.pixelView.data.reduce((a, e) => a + e, 0);
                // console.log({ checkDraw });
            } catch (e) {
                console.error(e);
            }
            console.timeEnd('DRAW2');

            return 0;
        },

        growMemory(bytes) {
            console.log(this.offset);
            console.log('%c growMemory(bytes)', 'background: #222; color: #bada55');
            if (!this.state2) new Error('Dont growMemory before init');
            const pagesNeeded = Math.ceil((bytes + this.initOffset) / (64 * 1024));
            const actualMemorySize = this.state2.memorySize();
            console.log({ pagesNeeded, actualMemorySize });
            if (pagesNeeded > actualMemorySize) this.state2.memory.grow(pagesNeeded - actualMemorySize);
            this.memoryView = new Uint8ClampedArray(this.state2.memory.buffer);
            this.pixelView = new ImageData(
                new Uint8ClampedArray(
                    this.state2.memory.buffer,
                    this.initOffset,
                    this.canvasPixelSize,
                ),
                this.canvasW,
                this.canvasH,
            );
            // console.log(this.memoryView,  this.pixelView);
        },

        updateCanvasSize() {
            console.log('');
            const canvas = document.getElementById('canvas');
            const parantWidth = canvas.parentNode.clientWidth;
            const parantHeight = canvas.parentNode.clientHeight;
            canvas.width = parantWidth;
            canvas.height = parantHeight;
        },
    },

    async mounted() {
        console.error('START FETCH');
        // set resize event handler
        window.addEventListener('resize', this.handleResize);

        // set width/height responsive
        const canvas = document.getElementById('canvas');
        const parantWidth = canvas.parentNode.clientWidth;
        const parantHeight = canvas.parentNode.clientHeight;
        canvas.width = parantWidth;
        canvas.height = parantHeight;

        this.drawCtx = canvas.getContext('2d');
        this.canvasW = parantWidth;
        this.canvasH = parantHeight;

        if (this.wasmMode) {
            try {
                const imports = {
                    env: {
                        // import as @external("env", "logf")
                        log1(value) {
                            console.log(
                                `%c from wasm: ${value}`,
                                'background: #222; color: #bada55',
                            );
                        },
                        abort(msg, file, line, column) {
                            console.error(`abort called at main.ts:${line}:${column}`);
                        },
                    },
                    console: {
                        log2(value) {
                            console.log(
                                `%c from wasm: ${value}`,
                                'background: #222; color: #bada55',
                            );
                        },
                    },
                };

                // const Module = await import('../assets/wasm/optimized.wasm');
                console.warn('START');
                console.log({ wasm });
                const Module = await instantiateStreaming(fetch(wasm), imports);
                console.log(Module);
                const { memory } = Module;

                this.state2 = Module;
                this.memory = memory;
                console.log(memory);

                /*
                TODO ADDED:
                    1. cummincate between js and AS
                    2. pass buffer to AS
                    3. Add Node Class to save pointer and size => get acces to pixel data for each img
                    4. add Store for saving nodes and operation on multi nodes
                    5. pixel array for return data and change via AS
                    6. Add draw to state and nodes
                    7. add test canvas for showing result
                    8. add variable memory based on canvasPixelSize and change cavnas size to 100, 100
                    9. add real pictures while streaming, first 10, handcrafted x,y,
                        init memory 10 * 10 * 10 * 4 = 4000
                    10. init full downloaded memory
                    11. add all nodes with smallest img size to state
                    11. add scale, transfer to node.draw(s, t) with functions to change them
                    13. resize full canvas to 500, 500
                    14. node.draw() checks if node should be drawed
                    15. add new load wasm with webpack, imports add logging
                    16. add panning (MouseMove), scale/translate change (zoom)
                    17. add 10 files of images to Node and resize with zooming
                    18. fix draw placing wrong pixel and missing content after high zooming

                Todo next
                    - add node.marked, node.groupId (default 0)
                    - add draw border
                    - add node move, groups move, marked moves
                    - add second array for getting pixel under mouse


                TODO Enhancment
                    - new Way in a worker
                */

                console.warn('INIT');
                this.initOffset = 1024 * 64 * 50; // 20 pages
                this.canvasPixelSize = this.canvasH * this.canvasW * 4;
                this.offset = this.initOffset;

                console.log({
                    initOffset: this.initOffset,
                    canvasW: this.canvasW,
                    canvasH: this.canvasH,
                    canvasPixelSize: this.canvasPixelSize,
                });

                // get more memory
                this.growMemory(this.canvasPixelSize);

                const init = this.state2.init(0, this.canvasW, this.canvasH, this.offset);
                console.log({ init });
                console.log(this.state2.__rtti_base.value);
                // update offset with canvasPixel size
                this.offset += this.canvasPixelSize;
                console.log('New Offset with canvasPixelSize: ', this.offset);
            } catch (e) {
                console.error('ERROR');
                console.error(e);
            }
        }

        const socketIp = process.env.NODE_ENV === 'production' ? '/' : 'localhost:3000';
        const socketPath = process.env.NODE_ENV === 'production' ? '/visiexp/socket.io' : '';

        // init socket connection
        const socket = io.connect(socketIp, {
            transports: ['websocket'],
            reconnectionDelay: 100,
            reconnectionDelayMax: 1000,
            path: socketPath,
        });

        const hitCanvas = document.createElement('canvas');
        hitCanvas.width = parantWidth;
        hitCanvas.height = parantHeight;

        const heatmapCanvas = document.getElementById('heatmap');
        heatmapCanvas.width = parantWidth / 4;
        heatmapCanvas.height = parantHeight / 4;
        this.heatmap = simpleheat(heatmapCanvas); // todo why is it grey/unused?

        const navHeatmapCanvas = document.getElementById('navHeatmap');
        navHeatmapCanvas.width = parantWidth / 4;
        navHeatmapCanvas.height = parantHeight / 4;
        this.navHeatmap = simpleheat(navHeatmapCanvas);

        const navHeatmapRect = document.getElementById('navHeatmapRect');
        navHeatmapRect.width = parantWidth / 4;
        navHeatmapRect.height = parantHeight / 4;
        navHeatmapRect.getContext('2d').strokeStyle = '#3882ff';
        navHeatmapRect.getContext('2d').lineWidth = 1.5;
        this.navHeatmapRect = navHeatmapRect;

        const store = new ExplorerState(canvas, hitCanvas, socket, this);
        this.store = store;

        // set init value from store to UI
        this.cluster = store.cluster;
        this.clusterRadius = store.clusterRadius;
        this.clusterTile = store.clusterTile;
        this.representImgSize = store.representImgSize;
        this.neighbourImgSize = store.neighbourImgSize;
        this.zoomStage = store.zoomStage;
        this.sizeRange = store.sizeRange;
        this.scale = store.scale;

        // save socket to ui
        this.socket = socket;

        socket.on('connect', () => {
            logYellow('Socket: connect');
            this.connectedToSocket = true;
            // notification
            this.$notify({
                group: 'default',
                title: 'Connected',
                type: 'success',
                // text: 'Hello user! This is a notification!'
            });
            console.log('Socket: connect');
            console.log(`Socket id: ${socket.id}`);
            // console.log(socket);
            this.socketId = socket.id;
            // there are already data then this is just a reconnect
            const nodes = this.store.getNodes();
            console.log('nodes in store while connect (its maybe just a reconnect)');
            console.log(nodes);
            if (!Object.keys(nodes).length && !this.loadingNodes) {
                socket.emit('getNodes', {
                    datasetId: this.dataset,
                    userId: this.userId,
                    count: this.selectedImgCount,
                    init: this.loadOldDataset ? 'resume' : 'new',
                });
                this.reset();
                this.$notify({
                    group: 'default',
                    title: 'Loading Data',
                    type: 'success',
                    text: `start loading data for ${this.selectedImgCount} images`,
                });
            }
        });

        socket.on('Error', (data) => {
            logYellow('Socket: Error');
            console.error('Server response with error:');
            console.error(data.message);
            console.error(data);
            this.$notify({
                group: 'default',
                title: 'Error from server',
                type: 'error',
                text: data.message,
            });
        });

        socket.on('disconnect', (reason) => {
            logYellow('Socket: disconnect');
            this.connectedToSocket = false;
            this.$notify({
                group: 'default',
                title: 'Disconnect',
                type: 'error',
                text: reason,
            });
            console.log('Socket: disconnect', reason);
        });

        // get a new node from server
        socket.on('node', (data) => {
            logYellow('Socket: node');
            if (data.index % 100 === 0) {
                console.log(`Socket: node ${data.index}`);
                console.log(data);
            }
            // start time measure, ended in allNodesSend
            if (this.nodesRecived === 0) console.time('loadAllNodes');
            this.nodesRecived += 1;
            store.addNode(new Node(data));
            store.triggerDraw();
        });

        socket.on('requestImage', (data) => {
            logYellow('Socket: requestImage');
            console.log(data);
            const node = store.nodes[data.index];
            // console.log(node);
            node.image.src = `data:image/jpeg;base64,${data.buffer}`;
        });

        socket.on('totalNodesCount', (data) => {
            logYellow('Socket: totalNodesCount');
            console.log(data);
            this.nodesTotal = data.count;
        });

        socket.on('sendAllNodes', async (nodes) => {
            logYellow('Socket: sendAllNodes');
            this.$notify({
                group: 'default',
                title: 'Finish loading data',
                type: 'success',
                text: 'Start loading images',
            });
            console.log(nodes);
            const state = this;

            async function consume(reader) {
                // let total = 0;
                let w = 0;
                let h = 1; // point to w/h positions in the buffer
                let size = 0; // actual size of the images
                let readFromChunk = 0; // save ow many bytes from the chunk are used
                let picByteLen = 0; // len of the pic to read
                let nodeId = 0; // starting node id
                let oldChunk = new Uint8Array(); // save the rest of the unused chunk

                function pump() {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            console.log('finish request with done');
                            return;
                        }
                        // merge rest of old chunk with new chunk for cleaner code
                        const chunk = new Uint8Array(oldChunk.length + value.length);
                        chunk.set(oldChunk);
                        chunk.set(value, oldChunk.length);
                        readFromChunk = 0; // reset
                        picByteLen = chunk[w] * chunk[h] * 4; // test if the hole image is in chunk

                        // check if a hole image is in the chunk or if the data are part of the next one
                        while (picByteLen <= chunk.byteLength - readFromChunk - 2) {
                            if (!nodes[nodeId].imageData) nodes[nodeId].imageData = Object.create(null);

                            nodes[nodeId].imageData[size] = new ImageData(
                                new Uint8ClampedArray(chunk.slice(h + 1, h + picByteLen + 1)),
                                chunk[w],
                                chunk[h],
                            );

                            // update vars for reading bytes
                            readFromChunk += picByteLen + 2; // 2 bytes for w/h
                            w += picByteLen + 2;
                            h += picByteLen + 2;
                            picByteLen = chunk[w] * chunk[h] * 4; // len of the next pic
                            if (size < 9) {
                                size += 1;
                            } else {
                                size = 0;
                                state.nodesRecived += 1;
                                const node = new Node(nodes[nodeId]);

                                // own js state
                                store.addNode(node);
                                store.triggerDraw();

                                if (state.wasmMode) {
                                    state.addNode(node);
                                }
                                // vue state
                                // if(nodeId < 90){
                                // console.log(node)
                                // }

                                nodeId += 1;
                                // todo the node can now be established
                            }
                        }

                        oldChunk = new Uint8Array(chunk.slice(readFromChunk));
                        w = 0;
                        h = 1;
                        return pump();
                    });
                }

                return pump();
            }


            await fetch(`${apiUrl}/api/v1/dataset/images/${this.dataset}/${this.selectedImgCount}`)
                .then(async (res) => {
                    console.log(res);
                    console.log(res.headers);
                    const contentLength = res.headers.get('content-length');
                    console.log({ contentLength });
                    if (!res.ok) {
                        const err = await res.json();
                        console.warn(err);
                        throw Error(err.error.message);
                    }
                    if (this.wasmMode) this.growMemory(this.canvasPixelSize + +contentLength);
                    await consume(res.body.getReader());

                    // test
                    if (this.wasmMode) {
                        // this.state2.setScale(10);
                        // this.state2.setTxTy(150, 150);
                        this.draw2();
                    }
                })
                .then(() => {
                    this.$notify({
                        group: 'default',
                        title: 'Finish loading images',
                        type: 'success',
                        text: 'all images should be visible now',
                    });
                    if (this.cachedNodes) {
                        logYellow('update embedding with cached nodes');
                        console.log(this.cachedNodes);
                        this.updateEmbedding(this.cachedNodes);
                        this.cachedNodes = undefined;
                    } else this.activateClusterMode();
                    console.log(
                        'consumed the entire body without keeping the whole thing in memory!',
                    );
                })
                .catch((e) => {
                    this.$notify({
                        group: 'default',
                        title: 'Error loading images',
                        type: 'error',
                        text: e.message,
                    });
                    console.error('something went wrong with reading img stream:');
                    console.log(e);
                    console.log(this.state2.memory);
                });

            this.loadingNodes = false;
            console.timeEnd('loadAllNodes');
        });

        socket.on('updateCategories', (data) => {
            logYellow('Socket: updateCategories');
            console.log(data);
            this.labels = data.labels;
        });

        socket.on('updateEmbedding', this.updateEmbedding);

        socket.on('initPython', (data) => {
            if (data.done) {
                this.initPython = data.done;
                this.$notify({
                    group: 'default',
                    title: 'Initialising features finished',
                    type: 'success',
                    text: this.loadingNodes ? 'Please wait updating embedding until loading finished ' : 'You can now update the embedding',
                });
            }
        });

        socket.on('connect_error', () => {
            logYellow('Socket: connect_error');
            this.$notify({
                group: 'default',
                title: 'Error connecting to Server',
                type: 'error',
                text: 'Trying to reconnect',
            });
        });

        socket.on('connect_timeout', () => {
            logYellow('Socket: connect_timeout');
        });

        socket.on('reconnect', () => {
            logYellow('Socket: reconnect');
        });

        socket.on('connecting', () => {
            logYellow('Socket: connecting');
        });

        socket.on('Socket: reconnecting', () => {
            logYellow('reconnecting');
        });

        socket.on('connect_failed', () => {
            logYellow('Socket: connect_failed');
        });

        socket.on('reconnect_failed', () => {
            logYellow('Socket: reconnect_failed');
        });

        socket.on('close', () => {
            logYellow('Socket: close');
        });
    },
    beforeDestroy() {
        // end connection with server socket
        if (this.socket) this.socket.disconnect();
        window.removeEventListener('resize', this.handleResize);
    },
};
</script>

<style>
.tsne-map {
    height: calc(100% - 40px);
    display: flex;
    flex-flow: column;
    /*background-color: rgb(255, 90, 75);*/
}

.mode-header {
    display: flex;
    justify-content: space-between;
    box-shadow: 0 5px 8px -3px rgba(32, 33, 36, 0.28);
}

.body {
    height: 100%;
    /*margin: 0.5rem;*/
}

.header {
    display: flex;
    justify-content: space-between;
    height: 40px;
    box-shadow: 0 2px 3px rgba(32, 33, 36, 0.28);
    margin-bottom: 3px;
}

.left-header,
.right-header {
    display: flex;
    align-items: center;
}

.explorer {
    position: relative;
    margin: 5px;
    height: calc(100% - 1rem); /* -double margin */
    width: calc(100% - 25rem); /* -details width */
}

.details {
    width: 25rem;
    /*margin-right: 0.5rem;*/
    padding: 3px;
    margin: 2px;
    background-color: white;
    height: calc(100% - 2rem);
    overflow-y: auto;
    overflow-x: hidden;
    /*z-index: -1;*/
}

.canvas {
    background-color: white;
    /*box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);*/
    box-shadow: 0 2px 4px rgba(50, 50, 93, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08);
    outline: none;
}

.box {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.top {
    top: 0;
}

.bottom {
    bottom: 0;
}

.left {
    left: 0;
}

.right {
    right: 0;
}

.maps {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin: 0.5rem;
}

.navMap {
    position: relative;
}

#navHeatmap {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10;
}

#navHeatmapRect {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 20;
    /*margin: 0.5rem;*/
    outline: none;
}

.hide {
    display: none;
}

.row-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.5rem;
}

.info-box {
    padding: 0.5rem;
}

.active-img {
    max-width: 100%;
    max-height: 20rem;
}

.loader {
    border: 3px solid #707bff; /* Blue */
    border-top: 3px solid #f3f3f3; /* Light grey */
    border-radius: 50%;
    width: 15px;
    height: 15px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.option-title {
    color: #6772e5;
    font-size: 15px;
    font-weight: 600;
    border-bottom: 0.05rem solid grey;
    padding: 0 0.5rem;
}

.color {
    display: flex;
    justify-content: center;
    align-items: center;

    flex-grow: 1;
    margin-bottom: 1rem;
}

.activeColor {
    border: 1px solid black;
}

.btn-header {
    text-decoration: none;

    display: flex;
    align-items: center;
    height: 2rem;

    font-weight: 500;
    font-size: 1rem;

    padding: 0 1em;
    margin-bottom: 3px;
    color: #767676;
}

.btn-header:hover {
    color: #484848;
}

.btn-header + .active {
    /*//background-color: paleturquoise;*/
    border-bottom: 3px solid paleturquoise;
    color: #484848;
    margin-bottom: 0;
}

.group-item {
    display: flex;
    align-items: center;
    /*align-self: center;*/
    text-decoration: none;
    /*text-overflow: ;*/
    margin: 0.5rem;
    /*height: 20px;*/
    line-height: 20px;
    /*padding: 1px 14px;*/
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    background: #fff;
    color: #6772e5;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    transition: all 0.15s ease;
    cursor: pointer;
}

.label {
    padding: 0 2px;
    text-decoration: underline;
}

a {
    text-decoration: none;

    display: flex;
    align-items: center;

    height: 35px;

    font-weight: bold;
    padding: 0 1em;
    margin-bottom: 5px;
    color: #767676;
}

a:hover {
    color: #484848;
}

.router-link-exact-active {
    /*//background-color: paleturquoise;*/
    border-bottom: 5px solid paleturquoise;
    color: #484848;
    margin-bottom: 0;
}

/*
    Custom scrollbar style
    */
/* width */
::-webkit-scrollbar {
    width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
    background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
