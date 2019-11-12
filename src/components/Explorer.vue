<template>
    <div class="row body">
        <div class="explorer">
            <canvas class="" id="canvas" ref="canvas" tabindex="0"></canvas>
            <div class="box top left">
                <div class="row-end">
                    <div @click="changeScaleDown()" class="btn" v-tooltip="'scale down positions'">
                        <minimize></minimize>
                    </div>
                    <div @click="changeScaleUp()" class="btn" v-tooltip="'scale up positions'">
                        <maximize></maximize>
                    </div>
                </div>
                <div class="row-end">
                    <div @click="changeImgSize(-1)" class="btn" v-tooltip="'decrease image size'">
                        <img-size-down></img-size-down>
                    </div>
                    <div @click="changeImgSize(1)" class="btn" v-tooltip="'increase image size'">
                        <img-size-up></img-size-up>
                    </div>
                </div>
            </div>

            <div class="box top right">
                <div class="row">
                    <div
                        class="btn"
                        :class="{ active: updateNodes }"
                        @click="handleUpdateEmbedding"
                        v-tooltip="'update embedding'"
                    >
                        update embedding
                        <!--                        <send v-if="!loading"></send>-->
                        <!--                        <div class="loader" v-if="updateNodes"></div>-->
                    </div>
                </div>
                <div class="row">
                    <div
                        :class="{ active: scissors }"
                        @click="selectScissors"
                        class="btn"
                        v-tooltip="'select many images'"
                    >
                        <scissors></scissors>
                    </div>
                    <div
                        :class="{ active: target }"
                        @click="selectTarget"
                        class="btn"
                        v-tooltip="'double click to move selected images'"
                    >
                        <flag></flag>
                    </div>
                    <div @click="clearGroup" class="btn" v-tooltip="'reset'">
                        <x></x>
                    </div>
                </div>
            </div>

            <div class="box bottom left">
                <div
                    :class="{ active: showNavHeatmap }"
                    @click="toggleShowNavHeatmap"
                    class="btn"
                    v-if="!showNavHeatmap"
                >
                    <navmap></navmap>
                </div>
                <div :class="{ hide: !showNavHeatmap }" class="navMap">
                    <canvas class="" id="navHeatmap" tabindex="0"></canvas>
                    <canvas id="navHeatmapRect" tabindex="0"></canvas>
                    <div class="box top right">
                        <div class="btn small" @click="toggleShowNavHeatmap">x</div>
                    </div>
                    <div class="box bottom right">
                        <div class="row">
                            <div class="btn small" @click="scaleHeatMapUp">+</div>
                            <div class="btn small" @click="scaleHeatMapDown">-</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="box bottom right">
                <div :if="nodesTotal" class="btn dummy">{{ nodesRecived + '/' + nodesTotal }}</div>
            </div>
        </div>

        <div class="details">
            <div class="area help-box" v-if="showHelp && !neighbourMode">
                <!--                <div class="title2">Create groups for learning own embedding</div>-->
                <div class="title2">Help: General usage</div>
                <div class="">
                    1. Create groups with
                    <span class="btn dummy">new</span>
                    to learn own embedding
                </div>
                <div class="row v-center">
                    2. Add images to groups with
                    <div class="btn dummy">Click</div>
                    /
                    <scissors class="btn dummy"></scissors>
                </div>
                <div class="">
                    3. Get proposals with
                    <span class="btn dummy">
                        <plus-circle></plus-circle>
                    </span>
                    to extend groups automatically
                </div>
                <!--                <div class="row v-center">4. Repeat with different groups</div>-->
                <div class="">
                    4.
                    <span class="btn dummy">Update embedding</span>
                    based on marked groups
                </div>
            </div>
            <div class="area help-box" v-if="showHelp && neighbourMode">
                <div class="title2">Help: Extend groups automatically</div>
                <div class="row v-center">
                    1. Add proposal with
                    <div class="btn dummy">Click</div>
                    /
                    <scissors class="btn dummy"></scissors>
                    to group
                </div>
                <div class="row v-center">
                    2.
                    <div class="btn dummy">
                        Update
                        <repeat></repeat>
                    </div>
                    to get new proposals
                </div>
                <div class="row v-center">
                    3. Stop with
                    <span class="btn dummy">
                        <x></x>
                    </span>
                    anytime
                </div>
            </div>

            <div class="area" v-if="showSettings">
                <div class="title">Settings</div>
                <div class="row-btn">
                    <div>Screenshot:</div>
                    <div class="row">
                        <div @click="saveCanvas" class="btn">
                            <save></save>
                        </div>
                    </div>
                </div>

                <div class="option-title">Cluster</div>
                <div class="row-btn">
                    <div>Recalculate clustering</div>
                    <div
                        :class="{ active: recalcClustering }"
                        @click="toggleRecalcClustering"
                        class="btn"
                    >
                        {{ recalcClustering ? 'On' : 'Off' }}
                    </div>
                </div>
                <div class="row-btn">
                    <div>Radius: {{ clusterRadius }}</div>
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

                <div class="option-title">Image</div>
                <div class="row-btn">
                    <div>Transparency (base): {{ alphaBase }}</div>
                    <div class="row">
                        <div @click="changeAlphaBase(-10)" class="btn">-10</div>
                        <div @click="changeAlphaBase(10)" class="btn">+10</div>
                    </div>
                </div>
                <div class="row-btn">
                    <div>Transparency (lapping): {{ alphaIncrease }}</div>
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
                    <div>Represent: transparency</div>
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

                <div class="option-title">Heatmap</div>
                <div class="row-btn">
                    <div>Radius: {{ heatmapRadius }}</div>
                    <div class="row">
                        <div @click="changeHeatmapRadius(-0.1)" class="btn">
                            <minus></minus>
                        </div>
                        <div @click="changeHeatmapRadius(0.1)" class="btn">
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
                <div class="padding">
                    <slider-picker @input="changeColor" style="width: inherit;" v-model="colors" />
                </div>

                <div class="option-title">Performance</div>
                <div class="row-btn">
                    <div>Monitor</div>
                    <div :class="{ active: showLogs }" @click="toggleShowLogs" class="btn">
                        {{ showLogs ? 'On' : 'Off' }}
                    </div>
                </div>
                <div class="row-btn">
                    <div>Double Nodes</div>
                    <div @click="doubleNodes" class="btn">double</div>
                </div>
                <div class="row-btn">
                    <div>Log draw time</div>
                    <div @click="testPerformance" class="btn">100x</div>
                </div>
                <div class="row-btn">
                    <div>Show Hitmap</div>
                    <div :class="{ active: toggle }" @click="toggleShowHitmap" class="btn">
                        {{ toggle ? 'On' : 'Off' }}
                    </div>
                </div>

                <div class="option-title">Classifier</div>
                <classifier
                    :getStore="getStore"
                    :labels="labels"
                    :node="clickedNode"
                    :nodes="cuttedNodes"
                >
                </classifier>

                <!--<div class="row-btn">-->
                <!--<div>Cluster: tile: {{ clusterTile }}</div>-->
                <!--<div class="row">-->
                <!--<div @click="changeClusterTile(-1)" class="btn"><minus></minus></div>-->
                <!--<div @click="changeClusterTile(1)" class="btn"><plus></plus></div>-->
                <!--</div>-->
                <!--</div>-->
            </div>

            <div class="area">
                <div class="row-between">
                    <div class="title">Groups</div>
                    <div
                        v-if="!neighbourMode"
                        class="btn"
                        :class="{ active: groupBorderAllActive }"
                        @click="toggleGroupBorderAllActive"
                    >
                        view all
                    </div>
                </div>
                <div class="group-list" v-if="this.savedGroups.length">
                    <div :key="i" v-for="(group, i) in savedGroups">
                        <div class="group-item row-between">
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
                                <plus-circle></plus-circle>
                            </div>
                            <div @click="deleteGroup(i)" class="btn">
                                <trash></trash>
                            </div>
                        </div>
                        <neighbours
                            v-if="neighbourMode && group.groupId === activeGroupId"
                            :activeGroupId="activeGroupId"
                            :changeNeighboursThreshold="changeNeighboursThreshold"
                            :getStore="getStore"
                            :neighboursThreshold="neighboursThreshold"
                            :stop="stopNeighbourMode"
                        />
                    </div>
                </div>
                <div class="row v-center" v-if="!neighbourMode">
                    <input class="input" type="text" v-model="groupName" />
                    <div @click="saveGroup" class="btn">new</div>
                </div>
            </div>

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

            <logs :getStore="getStore" v-if="showLogs" />
        </div>
        <modal name="updateDialog" :resizable="true" height="auto" width="450px">
            <div class="vue-dialog">
                <div class="dialog-content">
                    <div class="dialog-c-title">
                        Update embedding?
                    </div>
                    <div class="dialog-c-text">
                        Specify to which degree the previous embedding should be preserved:
                        <range-slider
                            :min="0.1"
                            :max="1"
                            :step="0.1"
                            :value="embeddingDegree"
                            :change="changeEmbeddingDegree"
                        ></range-slider> {{embeddingDegree}}
                        <div class="description-small">It will take a while until the embedding has been updated.</div>
                    </div>
                </div>
                <div class="vue-dialog-buttons">
                    <button class="vue-dialog-button button" @click="sendData">Ok</button>
                    <button class="vue-dialog-button button" @click="closeUpdateDialog">Cancel</button>
                </div>
            </div>
        </modal>
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
import PlusCircle from '../icons/PlusCircle';
import Repeat from '../icons/Repeat';
import Stop from '../icons/Stop';
import Save from '../icons/Save';
import Send from '../icons/Send';
import Help from '../icons/Help';
import Navmap from '../icons/Map';
import Flag from '../icons/Flag';
import Maximize from '../icons/Maximize';
import Minimize from '../icons/Minimize';
import ImageSizeUp from '../icons/ImageSizeUp';
import ImageSizeDown from '../icons/ImageSizeDown';
import Plus from '../icons/Plus';
import Minus from '../icons/Minus';
import Trash from '../icons/Trash';
import Classifier from './Classifier';
import Logs from './Logs';
import RangeSlider from './RangeSlider';
import { apiUrl } from '../config/apiUrl';
import wasm from '../assets/wasm/optimized.wasm';
import { logYellow } from '../util/logging';

export default {
    store: null,
    name: 'TsneMap',
    props: {
        dataset: String,
        switchDataset: Function,
        userId: Number,
        selectedImgCount: Number,
        wasmMode: Boolean,
        isAuth: Boolean,
        groupsFromSnapshot: Array,
        nodesFromSnapshot: Object,
    },
    components: {
        Scissors,
        X,
        PlusCircle,
        Stop,
        Save,
        Send,
        Help,
        Navmap,
        Flag,
        // Groups,
        Neighbours,
        Logs,
        Classifier,
        'slider-picker': Slider,
        Maximize,
        Minimize,
        'img-size-up': ImageSizeUp,
        'img-size-down': ImageSizeDown,
        Plus,
        Minus,
        Trash,
        Repeat,
        RangeSlider,
    },
    data: () => ({
        // store: null,
        socket: null,
        connectedToSocket: false,
        showSettings: false,
        updateNodes: false,
        loadingImgs: false,
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
        clusterRadius: 0, // default - set on mount from CanvasStore class
        recalcClustering: true, // default - set on mount from CanvasStore class
        clusterTile: 0, // default - set on mount from CanvasStore class
        representImgSize: 0, // default - set on mount from CanvasStore class
        neighbourImgSize: 0, // default - set on mount from CanvasStore class
        alphaBase: 150,
        alphaIncrease: 20,
        range: 0,
        cuttedNodes: [], // selected nodes through scissor
        // showOptions: false, // show options menu
        clusterGrowth: 0,
        showNavHeatmap: false,
        heatmapRadius: 1.5,
        heatmapBlur: 5,
        navMapScale: 0.75,
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
        showHelp: true,
        wasm: undefined,
        memory: undefined,
        explorerCtx: undefined,
        offset: 0, // save actual memory position
        explorerPixelStart: 0,
        explorerPixelSize: 0,
        hitMapPixelStart: 0,
        memoryView: undefined,
        explorerPixel: undefined,
        hitMapPixel: undefined,
        canvasW: 0,
        canvasH: 0,
        cachedNodes: undefined, // cache the nodes if 'updateEmbedding is faster than loading nodes
        groupBorderAllActive: false,
        embeddingDegree: 0.5,
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
            console.log(this.$route);
            this.$modal.hide('updateDialog');
            // console.log(this.store.nodes);
            // console.log(nodes);
            if (!this.updateNodes && this.initPython) {
                const count = this.savedGroups.reduce((a, c) => a + c.count, 0);
                if (!count) {
                    // there must be at least one group with a member
                    return this.$notify({
                        group: 'default',
                        title: 'Group missing',
                        type: 'error',
                        text: 'Create a non-empty group first',
                    });
                }

                const nodes = this.store.getNodes();
                // this.store.resetStore();
                this.updateNodes = true;
                this.socket.emit('updateEmbedding', {
                    nodes,
                    datasetId: this.dataset,
                    userId: this.userId,
                    count: this.selectedImgCount,
                    embeddingDegree: this.embeddingDegree,
                });
                return this.$notify({
                    group: 'default',
                    title: 'Update embedding',
                });
                // this.reset();
            }
            this.$notify({
                group: 'default',
                title: 'update embedding still in progress',
                type: 'error',
            });
            return 10;
        },

        handleUpdateEmbedding() {
            this.$modal.show('updateDialog', {
                // title: 'Update embedding?',
                // text: 'It will take a while until the embedding has been updated.',
                // buttons: [
                //     {
                //         title: 'Ok',
                //         handler: () => {
                //             this.sendData();
                //             this.$modal.hide('updateDialog');
                //         },
                //     },
                //     {
                //         title: 'Cancel',
                //         default: true, // Will be triggered by default if 'Enter' pressed.
                //         // handler: () => {}, // Button click handler
                //     },
                // ],
            });
        },

        // called from socket.on('updateEmbedding')
        updateEmbedding(data) {
            logYellow('Socket: updateEmbedding');
            console.log(data);
            // not every handler sends a cb
            // if (cb) cb({ stopped: this.autoUpdateEmbedding });
            if (!this.loadingImgs) {
                this.store.updateNodes(data.nodes);
                // todo check if necessary after have a good solution for best place for init clustering
                this.store.createCluster();
                this.updateNodes = false;
                this.$notify({
                    group: 'default',
                    title: 'Embedding updated', // todo add time maybe
                    type: 'success',
                    text: `Update took ${data.time} seconds`,
                });
            } else {
                logYellow('Cache nodes');
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

        /**
         * reset the most used ui buttons, active groups + neighbourmode
         */
        clearGroup() {
            this.store.clearGroup();
            this.activeGroupId = 0;
            this.neighbourMode = false;
            this.target = false;
            this.store.moveGroupToMousePosition = false;
            this.scissors = false;
            this.store.scissors = false;
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

        changeClusterRadius(v) {
            this.store.clusterRadius += v; // update ui
            this.clusterRadius = this.store.clusterRadius;
        },

        // changeClusterTile(v) {
        //     this.store.clusterTile += v; // update ui
        //     this.clusterTile = this.store.clusterTile;
        // },

        toggleRecalcClustering() {
            this.recalcClustering = !this.recalcClustering;
            if (this.recalcClustering) this.store.createCluster();
        },

        sortNodes() {
            this.store.sortNodes();
            this.sorted = this.store.sorted;
        },

        toggleGroupBorderAllActive() {
            this.groupBorderAllActive = !this.groupBorderAllActive;
            this.store.triggerDraw();
        },

        // drawHeatmap() {
        //     console.time('drawHeatmap');
        //     const { heatmap } = this;
        //
        //     // data in form of [[x,y,v], [x,y,v], ...]
        //     const data = Object.values(this.store.getNodes()).map((node) => {
        //         const x = (node.x * this.store.scale + this.store.translateX) / 4;
        //         const y = (node.y * this.store.scale + this.store.translateY) / 4;
        //         return [x, y, 1];
        //     });
        //
        //     // refresh radius before drawing
        //     heatmap.radius(this.heatmapRadius, this.heatmapBlur);
        //
        //     // add data
        //     heatmap.data(data); // setting data clear the old one
        //
        //     // draw heatmap
        //     heatmap.draw(/* this.heatmapMinOpacity */);
        //     console.timeEnd('drawHeatmap');
        // },

        /*
         *  HEAT MAP
         */

        drawNavHeatmap() {
            console.time('drawNavHeatmap');
            const { navHeatmap } = this;
            const w = this.navHeatmapRect.width;
            const h = this.navHeatmapRect.height;

            // todo es sollte eigentlich besser skaliert werden mit
            // data in form of [[x,y,v], [x,y,v], ...]
            const data = Object.values(this.store.nodes).map((node) => {
                const x = node.x * 5 * this.navMapScale + w / 2;
                const y = node.y * 5 * this.navMapScale + h / 2;
                return [x, y, 1];
            });

            // refresh radius before drawing
            navHeatmap.radius(this.heatmapRadius, this.heatmapBlur);

            // add data
            navHeatmap.data(data); // setting data clear the old one

            // draw heatmap
            navHeatmap.draw(/* this.heatmapMinOpacity */);
            console.timeEnd('drawNavHeatmap');
        },

        drawNavHeatmapRect() {
            // console.time('drawNavHeatmapRect');
            const ctx = this.navHeatmapRect.getContext('2d');
            const scale = (20 / this.store.scale) * this.navMapScale;
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
            // console.timeEnd('drawNavHeatmapRect');
        },

        toggleShowNavHeatmap() {
            this.showNavHeatmap = !this.showNavHeatmap;
            if (this.showNavHeatmap) requestAnimationFrame(this.drawNavHeatmap);
            if (this.showNavHeatmap) requestAnimationFrame(this.drawNavHeatmapRect);
        },

        scaleHeatMapUp() {
            if (this.navMapScale < 8) {
                this.navMapScale *= 2;
                requestAnimationFrame(this.drawNavHeatmap);
                requestAnimationFrame(this.drawNavHeatmapRect);
            }
        },

        scaleHeatMapDown() {
            if (this.navMapScale > 0.125) {
                this.navMapScale /= 2;
                requestAnimationFrame(this.drawNavHeatmap);
                requestAnimationFrame(this.drawNavHeatmapRect);
            }
        },

        // toggleShowHeatmap() {
        //     this.showHeatmap = !this.showHeatmap;
        //     if (this.showHeatmap) requestAnimationFrame(this.drawHeatmap);
        // },

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
            this.store.zoomStage += v;
            this.store.triggerDraw();
        },

        // toggleShowOptions() {
        //     this.showOptions = !this.showOptions;
        // },

        doubleNodes() {
            this.store.doubleNodes();
        },

        // changeClusterGrowth(v) {
        //     this.store.clusterGrowth = Math.round((this.store.clusterGrowth + v) * 100) / 100;
        //     // this.clusterGrowth = this.store.clusterGrowth;
        // },

        // changeZoomStage(v) {
        //     this.store.zoomStage += v;
        //     // this.zoomStage = this.store.zoomStage;
        //     this.store.triggerDraw();
        // },

        changeScaleUp() {
            const canvas = document.getElementById('canvas');
            this.store.zoomStage -= 0.2; // undoing image resize
            const event = {
                deltaY: -1,
                offsetX: Math.round(canvas.width / 2),
                offsetY: Math.round(canvas.height / 2),
            };
            this.store.zoom(event);
            // this.store.changeScaleUp();
            // this.store.triggerDraw();
        },

        changeScaleDown() {
            this.store.zoomStage += 0.2; // undoing image resize
            const event = {
                deltaY: 1,
                offsetX: Math.round(this.canvasW / 2),
                offsetY: Math.round(this.canvasH / 2),
            };
            this.store.zoom(event);
            // this.store.changeScaleDown();
            // this.store.triggerDraw();
        },

        changeHeatmapRadius(v) {
            this.heatmapRadius = Math.round((this.heatmapRadius + v) * 10) / 10;
            // this.drawHeatmap();
            this.drawNavHeatmap();
        },

        changeHeatmapBlur(v) {
            this.heatmapBlur += v;
            // this.drawHeatmap();
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
            // this.loadingNodes = true;
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
            logYellow('saveGroup');
            // save the actually group
            this.groupCounter += 1;
            const groupId = this.groupCounter;

            // get the name
            const name = this.groupName || `Group ${groupId}`;
            const colorId = groupId % Object.keys(this.groupColours).length;
            // get the ids of the groupd nodes
            this.savedGroups.push({
                groupId,
                name,
                count: 0,
                colorId,
            });
            if (this.wasmMode) {
                const [r, g, b] = this.groupColours[colorId];
                this.wasm.stateSetGroupColor(groupId, r, g, b);
            }

            this.activeGroupId = groupId;
            this.store.saveGroup(groupId);
            this.store.triggerDraw();
            this.groupName = '';
        },

        selectGroup(i) {
            const { groupId } = this.savedGroups[i];
            if (groupId === this.activeGroupId) {
                // unselect active group
                this.setActiveGroup(0);
                this.store.clearGroup();
            } else {
                console.log('select');
                this.store.selectGroupByGroupId(groupId);
                this.setActiveGroup(groupId);
            }
        },

        changeGroupColor(e, i) {
            logYellow('changeGroupColor');
            const group = this.savedGroups[i];
            console.log(e.target.value, i, group);
            group.colorId = e.target.value;
            console.log(this.savedGroups[i]);
            if (this.wasmMode) {
                const [r, g, b] = this.groupColours[e.target.value];
                this.wasm.stateSetGroupColor(group.groupId, r, g, b);
            }
            this.store.triggerDraw();
        },

        deleteGroup(i) {
            const { groupId } = this.savedGroups[i];
            this.savedGroups.splice(i, 1);
            this.store.deleteGroup(groupId);
        },

        handleNeighbourMode(i) {
            // set group to active if not already set
            const { groupId, count } = this.savedGroups[i];
            // the button is accessibly even if the group is not active
            if (count !== 0) {
                if (groupId === this.activeGroupId) {
                    // toggle similarity mode on/off
                    this.neighbourMode = !this.neighbourMode;
                } else {
                    // switch group and go in similarity mode
                    this.selectGroup(i);
                    this.neighbourMode = true;
                }
                this.store.triggerDraw();
            } else {
                this.$notify({
                    group: 'default',
                    title: 'Group empty',
                    type: 'error',
                    text: 'Please select some images before',
                });
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
            this.store.triggerDraw();
            if (this.showNavHeatmap) requestAnimationFrame(this.drawNavHeatmap);
        },

        addNode(node) {
            // console.warn(node);
            if ((node.nodeId % 50) === 0) console.warn(`Add Node ${node.index}:`, node);
            const addNode1 = this.wasm.addNode(
                node.x,
                node.y,
                node.index,
                node.colorKey[0],
                node.colorKey[1],
                node.colorKey[2],
            );
            // console.log(addNode1, this.offset);
            // console.log(this.offset);
            let secondOffset = 0;

            // console.log(node.imageData)
            /** create for each node an extra view because the main view is changing somehow */
            const totalLength = Object.values(node.imageData).reduce((a, e) => a + e.data.byteLength, 0);
            const buffer = new Uint8Array(this.wasm.memory.buffer, this.offset, totalLength);
            // console.log(totalLength, buffer)

            /** recreate main view if's changed somehow */
            if (!this.wasm.memory.buffer.byteLength) this.createPixelViews();
            for (let i = 0; i < 10; i += 1) {
                const img = node.imageData[i];

                // add img buffer to memory: Crete a view over the buffer and set use the viewer to set the data
                buffer.set(img.data, secondOffset, img.data.buffer.length);
                this.wasm.addPic(node.index, img.width, img.height, this.offset);

                // update offset for the next pic data
                this.offset += img.data.byteLength;
                secondOffset += img.data.byteLength;

                // remove image data to free memory
                node.imageData[i] = undefined;
            }
        },

        draw2() {
            try {
                // console.warn('DRAW2');
                console.log(this.explorerPixel);
                if (!this.explorerPixel.data.length) {
                    console.error('explorerPixel removed!');
                    this.createPixelViews();
                }
                this.wasm.draw();
                this.explorerCtx.putImageData(this.explorerPixel, 0, 0);
            } catch (e) {
                console.error(e);
            }
            return 0;
        },

        allocNewMemory(size) {
            // alloc the request memory
            // console.log(this.wasm);
            // console.log(this.wasm.memory);
            console.log('allocNewMemory for size: ', size);
            const ptr = this.wasm.__alloc(size, 2);
            console.log('total - offset ', ptr);

            this.createPixelViews();

            // return pointer where new memory starts
            return ptr;
        },

        createPixelViews() {
            // this.wasm.U8 = new Uint8Array(this.wasm.memory.buffer);
            // console.log(this.wasm.U8);

            // create new view on buffer cause buffer changes everytime
            this.explorerPixel = new ImageData(
                new Uint8ClampedArray(
                    this.wasm.memory.buffer,
                    this.explorerPixelStart,
                    this.explorerPixelSize,
                ),
                this.canvasW,
                this.canvasH,
            );
            this.hitMapPixel = new ImageData(
                new Uint8ClampedArray(
                    this.wasm.memory.buffer,
                    this.hitMapPixelStart,
                    this.explorerPixelSize,
                ),
                this.canvasW,
                this.canvasH,
            );
        },

        changeEmbeddingDegree(e) {
            // console.log('changeEmbeddingDegree')
            this.embeddingDegree = +e.target.value;
        },

        closeUpdateDialog() {
            this.$modal.hide('updateDialog');
        },

        checkSumExplorer() {
            const checksum = 0;
            for (
                let i = this.explorerPixelStart,
                    size = this.explorerPixelStart + this.explorerPixelSize;
                i < size;
                i++
            ) {
                // checksum += this.wasm.U8[i];
            }
            console.log('checkSumExplorer: ', checksum);
        },

        checkSumHitMap() {
            const checksum = 0;
            for (
                let i = this.hitMapPixelStart,
                    size = this.hitMapPixelStart + this.explorerPixelSize;
                i < size;
                i++
            ) {
                // checksum += this.wasm.U8[i];
            }
            console.log('checkSumHitMap: ', checksum);
        },

        updateCanvasSize() {
            // update explorer
            const canvas = document.getElementById('canvas');
            const parantWidth = canvas.parentNode.clientWidth;
            const parantHeight = canvas.parentNode.clientHeight;

            // update canvas
            canvas.width = parantWidth;
            canvas.height = parantHeight;

            // update state
            this.canvasW = parantWidth;
            this.canvasH = parantWidth;

            // update store
            this.store.width = parantWidth;
            this.store.height = parantHeight;

            // update heatmapRect
            this.navHeatmapRect.width = parantWidth / 4;
            this.navHeatmapRect.height = parantHeight / 4;

            // update heatmap
            const navHeatmap = document.getElementById('navHeatmap');
            navHeatmap.width = parantWidth / 4;
            navHeatmap.height = parantHeight / 4;
        },

        async saveSnapshot() {
            console.log('saveSnapshot');
            const nodes = this.store.getNodes();
            const groups = this.savedGroups;
            const { dataset } = this;
            const count = this.selectedImgCount;
            const userid = this.userId;
            console.log(nodes, groups);
            // dont save if there not all nodes loaded
            if (!Object.keys(nodes).length || this.loadingImgs) {
                return this.$notify({
                    group: 'default',
                    title: 'Cannot save before finish loading',
                    type: 'error',
                    text: 'Please wait until all images are loaded',
                });
            }

            const data = await fetch(`${apiUrl}/api/v1/snapshots/`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    nodes, groups, dataset, count, userid,
                }),
            })
                .then(res => res.json())
                .catch((e) => {
                    this.$notify({
                        group: 'default',
                        title: 'Error saving snapshot',
                        type: 'error',
                        text: e.message,
                    });
                });
            this.$notify({
                group: 'default',
                title: 'Snapshot saved',
                type: 'success',
                text: data.message,
            });
        },
    },

    watch: {
        updateNodes(bool) {
            this.updateNodes = bool;
            // update nav
            this.$root.navheader.loading = bool;
        },
        activeGroupId(id) {
            if (this.wasmMode) this.wasm.stateSetActiveGroup(id);
        },
    },

    async mounted() {
        console.error('Mounted Explorer');
        console.log(this.nodesFromSnapshot, this.groupsFromSnapshot);
        if (!this.isAuth) return console.error('EXPLORER WITHOUT AUTH');
        // set resize event handler
        window.addEventListener('resize', this.handleResize);

        // store state global
        this.$root.explorer = this;
        // update state in navheader that shows explorer is online
        this.$root.navheader.explorer = true;

        // set width/height responsive
        const canvas = document.getElementById('canvas');
        const parantWidth = canvas.parentNode.clientWidth;
        const parantHeight = canvas.parentNode.clientHeight;
        canvas.width = parantWidth;
        canvas.height = parantHeight;

        this.explorerCtx = canvas.getContext('2d');
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

                // reserve static memory for images (aka init later?)

                this.wasm = Module;
                this.memory = memory;
                console.log(memory);
                console.log(this);

                // gearbeitet von 15:00 - 16:00 ++

                console.warn('INIT');
                this.explorerPixelSize = this.canvasH * this.canvasW * 4;

                // get memory for both canvas
                this.explorerPixelStart = this.allocNewMemory(this.explorerPixelSize);
                this.hitMapPixelStart = this.allocNewMemory(this.explorerPixelSize);

                console.log({
                    canvasW: this.canvasW,
                    canvasH: this.canvasH,
                    explorerPixelSize: this.explorerPixelSize,
                    offset: this.explorerPixelStart,
                });

                // init wasm state
                const init = this.wasm.init(
                    0,
                    this.canvasW,
                    this.canvasH,
                    this.explorerPixelStart,
                    this.hitMapPixelStart,
                );
                console.log({ init });
                console.log(this.wasm.__rtti_base.value);
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

        // const heatmapCanvas = document.getElementById('heatmap');
        // heatmapCanvas.width = parantWidth / 4;
        // heatmapCanvas.height = parantHeight / 4;
        // this.heatmap = simpleheat(heatmapCanvas); // todo why is it grey/unused?

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
            if (!Object.keys(nodes).length && !this.updateNodes) {
                socket.emit('getNodes', {
                    datasetId: this.dataset,
                    userId: this.userId,
                    count: this.selectedImgCount,
                    init: this.nodesFromSnapshot ? 'resume' : 'new',
                    nodesFromSnapshot: this.nodesFromSnapshot,
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
            if (
                process.env.NODE_ENV !== 'development'
                || data.message !== 'Error loading full image'
            ) {
                this.$notify({
                    group: 'default',
                    title: 'Error from server',
                    type: 'error',
                    text: data.message,
                });
            }
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

        socket.on('sendAllNodes', async ({ nodes, time }) => {
            logYellow('Socket: sendAllNodes');
            this.$notify({
                group: 'default',
                title: 'Finish loading data',
                type: 'success',
                text: 'Start loading images',
            });
            console.log({ nodes, time });
            const state = this;

            async function consume(reader) {
                console.error('CONSUM');
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
                                if (nodeId % 20 === 0) state.nodesRecived += 20;
                                const node = new Node(nodes[nodeId], state.wasm);

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

            this.loadingImgs = true;
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
                    if (this.wasmMode) {
                        // get full memory for all imgs data
                        this.offset = this.allocNewMemory(+contentLength);
                    }
                    await consume(res.body.getReader());

                    // show heatmap
                    this.toggleShowNavHeatmap();
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
                    console.log(this);
                    if (this.nodesFromSnapshot) {
                        // override the current groups with saved groups to
                        logYellow('set groups from snapshot')
                        this.snapshots = this.groupsFromSnapshot;
                    }
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
                    console.log(this.wasm);
                    console.log(this);
                });

            this.updateNodes = false;
            this.loadingImgs = false;
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
                    text: this.updateNodes
                        ? 'Please wait updating embedding until loading finished '
                        : 'You can now update the embedding',
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
        // EventBus.$off('update', this.sendData);
        this.$root.navheader.explorer = false;
        this.$root.explorer = null;
    },
};
</script>

<style>
.explorer {
    position: relative;
    margin: 5px;
    height: calc(100% - 10px);
    width: calc(100% - 25rem); /* -details width */
}

.details {
    width: 25rem;
    /*margin-right: 0.5rem;*/
    padding: 3px;
    margin: 2px;
    background-color: white;
    height: calc(100% - 18px);
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
    margin: 0.5rem;
}

#navHeatmap {
    background-color: white;
    z-index: 10;
    /*border: 1px solid #7776e7;*/
    box-shadow: 0 2px 2px rgba(50, 50, 93, 0.28), 0 1px 3px rgba(0, 0, 0, 0.18);
}

#navHeatmapRect {
    position: absolute;
    bottom: 4px;
    left: 0;
    z-index: 20;
    /*padding: 0.5rem;*/
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

.padding {
    padding: 0 0.5rem;
}

.help-box {
    padding: 0.5rem;
    background-color: #1f03ff0d;
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
    margin-left: 7px;
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
    margin: 0 0.5rem;
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

/**
 *   Custom scrollbar style
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
