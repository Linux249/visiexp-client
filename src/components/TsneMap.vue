<template>
    <div class="tsne-map">
        <div class="mode-header">
            <div class="row">
                <!--<div
                    class="btn"
                    :class="{ active: clusterMode }"
                    @click="toggleClusterMode"
                >
                    cluster
                </div>
                <div
                    class="btn"
                    :class="{ active: oldClusterMode }"
                    @click="toggleOldClusterMode"
                >
                    old cluster
                </div>-->
                <!--<div
                    class="btn"
                    :class="{ active: neighbourMode }"
                    @click="toggleNeighbourMode"
                >
                    neighbour
                </div>-->
            </div>
            <div class="row">
                <!--<div># {{nodesCount}}</div>-->
                <!--<div>connected: {{connectedToSocket}}</div>-->
                <!--<div class="btn">{{scale}}</div>-->
                <!--<div class="btn">{{scale2}}</div>-->
                <!--<div class="btn">{{zoomStage}}</div>-->
                <!--<div class="btn">{{translateX}}</div>
                <div class="btn">{{translateY}}</div>-->
                <!--<div class="btn" @click="draw2">draw2</div>
                <div class="btn" @click="doubleNodes">doubleNodes</div>-->
                <!--<div class="btn" :class="{ active: sorted }" @click="sortNodes">sort</div>-->
                <!--<div class="dropdownArea"></div>-->

                <!-- <div @click="toggleShowNavMap" :class="{ active: showNavMap }" class="btn">
                     <navmap></navmap>
                 </div>-->

                <div @click="toggleShowOptions" class="btn" :class="{ active: showOptions }">
                    Options
                </div>
                <div @click="sendData" class="btn" :class="{ active: loadingNodes }">
                    Update
                    <send v-if="!loadingNodes"></send>
                    <div v-if="loadingNodes" class="loader" ></div>
                </div>
                <div
                    @click="toggleUpdateEmbedding"
                    :class="{ active: autoUpdateEmbedding }"
                    class="btn"
                >
                    {{autoUpdateEmbedding ? 'stop' : 'start'}}
                    <play v-if="!autoUpdateEmbedding"></play>
                    <stop v-if="autoUpdateEmbedding"></stop>
                </div>
            </div>
        </div>

        <div class="row stack">
            <div class="explorer">
                <canvas ref="canvas" id="canvas" class="canvas" tabindex="0" ></canvas>
                <div class="box top right">
                    <div class="row">
                        <div @click="selectTarget" :class="{ active: target }" class="btn">
                            <target></target>
                        </div>
                        <div @click="selectScissors" :class="{ active: scissors }" class="btn">
                            <scissors></scissors>
                        </div>
                        <div @click="clearGroup" class="btn">
                            <x></x>
                        </div>
                    </div>
                    <div class="row-end">
                        <div @click="toggleShowHeatmap" :class="{ active: showHeatmap }" class="btn">
                            <navmap></navmap>
                        </div>
                        <div @click="toggleShowNavHeatmap" :class="{ active: showNavHeatmap }" class="btn">
                            <navmap></navmap>
                        </div>
                    </div>
                </div>
                <div class="box top left"><div class="btn" :if="nodesTotal">{{nodesRecived + "/" + nodesTotal}}</div></div>
                <div class="box bottom left"><div :class="{ hide: !showHeatmap }">
                    <canvas
                        id="heatmap"
                        class="canvas"
                        style="margin: 0.5rem; border-radius: 4px"
                        tabindex="0"
                    ></canvas>
                </div>
                    <div class="navMap" :class="{ hide: !showNavHeatmap }">
                        <canvas id="navHeatmap" class="canvas" style="margin: 0.5rem; border-radius: 4px" tabindex="0" ></canvas>
                        <canvas id="navHeatmapRect" style="margin: 0.5rem; border-radius: 4px" tabindex="0" ></canvas>
                    </div>
                </div>
                <div class="box bottom right">
                    <div class="row">
                        <div @click="changeScaleDown()" class="btn"><minimize></minimize></div>
                        <div @click="changeScaleUp()" class="btn"><maximize></maximize></div>
                    </div>
                    <div class="row">
                        <div @click="changeImgSize(-1)" class="btn"><img-size-down></img-size-down></div>
                        <div @click="changeImgSize(1)" class="btn"><img-size-up></img-size-up></div>
                    </div>
                </div>
            </div>

            <div class="details">
                <div v-if="showOptions" class="area">
                    <div class="title">Options</div>

                    <div class="option-title">Cluster</div>
                    <div class="row-btn">
                        <div>Cluster: radius: {{clusterRadius}}</div>
                        <div class="row">
                            <div @click="changeClusterRadius(-1)" class="btn"><minus></minus></div>
                            <div @click="changeClusterRadius(1)" class="btn"><plus></plus></div>
                            <div @click="superCluster()" class="btn">update</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Cluster: tile: {{clusterTile}}</div>
                        <div class="row">
                            <div @click="changeClusterTile(-1)" class="btn"><minus></minus></div>
                            <div @click="changeClusterTile(1)" class="btn"><plus></plus></div>
                        </div>
                    </div>


                    <div class="option-title">Old cluster</div>
                    <div class="row-btn">
                        <div>Cluster: {{Math.round(cluster)}}</div>
                        <div class="row">
                            <div @click="changeCluster(-10)" class="btn">-10</div>
                            <div @click="changeCluster(-100)" class="btn">-100</div>
                            <div @click="changeCluster(100)" class="btn">+100</div>
                            <div @click="changeCluster(10)" class="btn">+10</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Cluster: growth: {{clusterGrowth}}</div>
                        <div class="row">
                            <div @click="changeClusterGrowth(-0.01)" class="btn">-0.1</div>
                            <div @click="changeClusterGrowth(0.01)" class="btn">+0.1</div>
                        </div>
                    </div>
                    <div class="option-title">Image</div>
                    <div class="row-btn">
                        <div>Alpha (base): {{alphaBase}}</div>
                        <div class="row">
                            <div @click="changeAlphaBase(-10)" class="btn">-10</div>
                            <div @click="changeAlphaBase(10)" class="btn">+10</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Aplha (increase): {{alphaIncrease}}</div>
                        <div class="row">
                            <div @click="changeAlphaIncrease(-10)" class="btn">-10</div>
                            <div @click="changeAlphaIncrease(10)" class="btn">+10</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Represent: size: {{representImgSize}}</div>
                        <div class="row">
                            <div @click="changeRepresentImgSize(-1)" class="btn"><img-size-down></img-size-down></div>
                            <div @click="changeRepresentImgSize(1)" class="btn"><img-size-up></img-size-up></div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Represent: alpha</div>
                        <div
                            @click="toggleRepresentWithAlpha"
                            class="btn"
                            :class="{active: representWithAlpha}"
                        >
                            {{representWithAlpha ? "On" : "Off"}}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Represent: sort</div>
                        <div
                            @click="toogleRepsMode"
                            class="btn"
                            :class="{active: repsMode}"
                        >
                            {{repsMode === 0 ? "normal" : repsMode === 1 ? 'before' : 'behind'}}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Neighbours: size: {{neighbourImgSize}}</div>
                        <div class="row">
                            <div @click="changeNeighbourImgSize(-1)" class="btn"><img-size-down></img-size-down></div>
                            <div @click="changeNeighbourImgSize(1)" class="btn"><img-size-up></img-size-up></div>
                        </div>
                    </div>

                    <div class="option-title">Other</div>
                    <div class="row-btn">
                        <div>zoomStage: {{zoomStage}}</div>
                        <div class="row">
                            <div @click="changeZoomStage(-1)" class="btn"><minus></minus></div>
                            <div @click="changeZoomStage(1)" class="btn"><plus></plus></div>
                        </div>
                    </div>
                    <!--
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
                    </div> -->

                    <!--<div class="row-btn">
                        <div>MinOpacity: {{heatmapMinOpacity}}</div>
                        <div class="row">
                            <div @click="changeHeatmapMinOpacity(-0.01)" class="btn">-0.01</div>
                            <div @click="changeHeatmapMinOpacity(0.01)" class="btn">+0.01</div>
                        </div>
                    </div>-->
                    <!--<div class="row-btn">
                        <div>NavMapAlpha: {{navMapAlpha}}</div>
                        <div class="row">
                            <div @click="changeNavMapAlpha(-0.1)" class="btn">-0.1</div>
                            <div @click="changeNavMapAlpha(0.1)" class="btn">+0.1</div>
                        </div>
                    </div>-->
                    <div class="option-title">Ranked</div>
                    <div class="row-btn">
                        <div>Sort</div>
                        <div
                            @click="sortNodes"
                            class="btn"
                            :class="{active: sorted}"
                        >
                            {{sorted ? "On" : "Off"}}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Size</div>
                        <div
                            class="btn"
                            :class="{ active: sizeRankedMode }"
                            @click="toggleSizeRankedMode"
                        >
                            {{sizeRankedMode ? "On" : "Off"}}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Size range: {{sizeRange}}</div>
                        <div class="row">
                            <div @click="changeSizeRange(-1)" class="btn"><minus></minus></div>
                            <div @click="changeSizeRange(1)" class="btn"><plus></plus></div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Border</div>
                        <div
                            class="btn"
                            :class="{ active: boarderRankedMode }"
                            @click="toggleBoarderRankedMode"
                        >
                            {{boarderRankedMode ? "On" : "Off"}}
                        </div>
                    </div>
                    <div class="row-btn">
                        <div
                            class="color"
                            :class="{activeColor: selectedGradient === i}"
                            v-for="(color, i) in gradient"
                            :key="i"
                            v-bind:style="{ backgroundColor:
                                 `rgb(${color[0]},${color[1]},${color[2]})`}"
                            @click="changeGradientColor(i)"
                        >
                            {{i}}
                        </div>
                    </div>
                    <slider-picker v-model="colors" @input="changeColor"/>

                    <!--<div class="row-btn">
                        <div>{{range}}}</div>
                        <range-slider v-model="cluster" type="range" min="0" max="800" step="10" />
                    </div>-->

                    <div class="option-title">Heatmap</div>
                    <div class="row-btn">
                        <div>Radius: {{heatmapRadius}}</div>
                        <div class="row">
                            <div @click="changeHeatmapRadius(-1)" class="btn"><minus></minus></div>
                            <div @click="changeHeatmapRadius(1)" class="btn"><plus></plus></div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Blur: {{heatmapBlur}}</div>
                        <div class="row">
                            <div @click="changeHeatmapBlur(-1)" class="btn"><minus></minus></div>
                            <div @click="changeHeatmapBlur(1)" class="btn"><plus></plus></div>
                        </div>
                    </div>

                </div>

                <!--<groups v-if="showGroups"
                    :setActiveGroup="setActiveGroup"
                    :activeGroup="activeGroup"
                    :getStore="getStore"
                    :toggleNeighbourMode="toggleNeighbourMode"
                    :neighbourMode="neighbourMode"
                />-->
                <div class="area">
                    <div class="title">Save/load groups</div>
                    <div v-if="this.savedGroups.length" class="group-list">
                        <div class="group-item row-between"
                             v-for="(group, i) in savedGroups"
                             :key="i"
                        >
                            <div
                                class="btn"
                                :class="{active: group.groupId === activeGroupId}"
                                @click="selectGroup(i)"
                            >
                                {{`${group.name}`}}
                            </div>
                            <div>{{`#${group.count}`}}</div>
                            <select
                                class="btn"
                                :style="{width: '3rem', backgroundColor: `rgb(${groupColours[group.colorId][0]},${groupColours[group.colorId][1]},${groupColours[group.colorId][2]})`}"
                                @change="changeGroupColor($event, i)"
                            >
                                <option
                                    v-for="(color, id) in groupColours"
                                    :selected="group.colorId == id"
                                    :id="group.colorId"
                                    :value="id"
                                    :key="id"
                                    :style="{backgroundColor: `rgb(${color[0]},${color[1]},${color[2]})`}"
                                >
                                </option>
                            </select>
                            <div
                                class="btn"
                                :class="{active: neighbourMode && group.groupId === activeGroupId}"
                                @click="handleNeighbourMode(i)"
                            >
                                <repeat></repeat>
                            </div>
                            <div class="btn" @click="deleteGroup(i)"><trash></trash></div>
                        </div>
                    </div>
                    <div class="row v-center">
                        <input class="input" type="text" v-model="groupName"/>
                        <div @click="saveGroup" class="btn">save group</div>
                    </div>
                </div>

                <neighbours
                    v-if="neighbourMode"
                    :getStore="getStore"
                    :activeGroupId="activeGroupId"
                    :changeNeighboursThreshold="changeNeighboursThreshold"
                    :neighboursThreshold="neighboursThreshold"
                />

                <router-view
                    :nodes="cuttedNodes"
                    :labels="labels"
                    :node="clickedNode"
                    :getNode="getNode"
                    :changeActiveNode="changeActiveNode"
                    :getStore="getStore"
                    :dataset="dataset"
                    :handleChangeDataset="handleChangeDataset"
                />


                <div class="area"  v-if="activeNode">
                    <img
                        class="active-img"
                        v-if="activeNode.hasImage"
                        :src="activeNode.image.src"
                    />
                    <div>Name: {{activeNode.name}}</div>
                    <div>Label: {{activeNode.label}}</div>
                    <div class="row">Labels:
                        <div class="label" v-for="label in activeNode.labels">
                            {{label}}
                        </div>
                    </div>
                    <div>Links #: {{Object.keys(activeNode.links).length}}</div>
                </div>
                <logs :getStore="getStore"/>
            </div>
        </div>

        <!--<triplets :node="activeNode"/>-->
    </div>
</template>

<script>
import io from 'socket.io-client';
import simpleheat from 'simpleheat';
import { Slider } from 'vue-color';
import Node from '../util/Node';
import ExplorerState from '../util/ExplorerState';
import groupColors from '../config/groupColors';
// import Groups from './Groups';
import Neighbours from './Neighbours';
import Scissors from '../icons/Scissors';
import X from '../icons/X';
import Play from '../icons/Play';
import Send from '../icons/Send';
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
import Repeat from '../icons/Repeat';
// import TestWorker from '../worker/test.worker';

export default {
    store: null,
    name: 'TsneMap',
    components: {
        Repeat,
        Scissors,
        X,
        Play,
        Send,
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
        items: [],
        // positives: [],
        // negatives: [],
        // store: null,
        socket: null,
        connectedToSocket: false,
        loadingNodes: false,
        nodesTotal: 0,
        nodesRecived: 0,
        scale: 0,
        // scale2: 0,
        labels: [],
        selectedLabel: null, // save the selected label
        selectedCategory: null,
        showLabels: false, // show the labels in a dropdown
        clickedNode: null,
        labelColor: '#6057ff',
        showKLabels: false,
        scissors: false,
        target: false,
        width: 0,
        height: 0,
        activeNode: null,
        cluster: 5, // default - set on mount from CanvasStore class
        clusterRadius: 0, // default - set on mount from CanvasStore class
        clusterTile: 0, // default - set on mount from CanvasStore class
        imgSize: 0, // default - set on mount from CanvasStore class
        representImgSize: 0, // default - set on mount from CanvasStore class
        neighbourImgSize: 0, // default - set on mount from CanvasStore class
        // borderWidth: 0, // default - set on mount from CanvasStore class
        alphaBase: 50,
        alphaIncrease: 50,
        range: 0,
        cuttedNodes: [], // selected nodes through scissor
        showOptions: false, // show options menu
        // scrollGrowth: 0,
        // scrollImgGrowth: 0,
        clusterGrowth: 0,
        translateX: 0,
        translateY: 0,
        // heatmap: {}, // this object should not be controlled by
        showHeatmap: false,
        heatmapRadius: 1,
        heatmapBlur: 5,
        // heatmapMinOpacity: 0.05,
        // showNavMap: false,
        // navMapAlpha: 0.1,
        showNavHeatmap: false,
        sizeRankedMode: false,
        boarderRankedMode: false,
        clusterMode: false,
        oldClusterMode: false,
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
        autoUpdateEmbedding: false,
        socketId: '',
        dataset: '001', // defualt value is 001
        neighboursThreshold: 0.2,
        activeGroupId: 0,
        representWithAlpha: false,
        savedGroups: [],
        groupName: '',
        groupCounter: 0, // 0 is no group, counter inc for first use
        groupColours: groupColors,
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
            console.log(this.store.nodes);
            const nodes = this.store.getNodes();
            console.log(nodes);
            // this.store.resetStore();
            this.loadingNodes = true;
            this.socket.emit('updateNodes', { nodes });
            // this.reset();
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
            console.log(target.v);
            this.neighboursThreshold = target.value;
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
            this.store.createSuperCluster();
        },

        /* toggleOldClusterMode() {
            this.oldClusterMode = !this.oldClusterMode;
            this.store.triggerDraw();
        }, */

        changeImgSize(v) {
            this.store.imgSize += v;
            this.imgSize = this.store.imgSize;
            this.store.triggerDraw();
        },

        toggleShowOptions() {
            this.showOptions = !this.showOptions;
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
        /* changeNavMapAlpha(v) {
            this.navMapAlpha += v;
            this.drawNavMap();
        }, */

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

        toggleRepresentWithAlpha() {
            this.representWithAlpha = !this.representWithAlpha;
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

        changeGradientColor(i) {
            console.log('changeGradientColor');
            // console.log(this.gradient);
            // console.log(i);
            // console.log(this.gradient[i]);
            // console.log(this.colors);
            // console.log(this.colors.rgba);
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

        async toggleUpdateEmbedding() {
            this.autoUpdateEmbedding = !this.autoUpdateEmbedding;
            if (this.autoUpdateEmbedding) {
                console.log('startUpdateEmbedding');
                console.log(this.socketId);

                try {
                    const body = JSON.stringify({
                        nodes: this.store.getNodesSimple(),
                        socketId: this.socketId,
                    });
                    await fetch('/api/v1/startUpdateEmbedding', {
                        method: 'POST',
                        headers: { 'Content-type': 'application/json' },
                        body,
                    }).then(res => res.text());
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.log('stopUpdateEmbedding');
                // console.log()
            }
        },

        handleChangeDataset(dataset) {
            this.dataset = dataset;
            // TODO trigger reload of datas
        },

        superCluster() {
            this.store.createSuperCluster();
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
            this.neighbourMode = !this.neighbourMode;
            this.store.triggerDraw();
        },
        /* drawNavMap() {
            console.time('drawNavMap');
            const ctx = this.navMap.getContext('2d');

            const w = this.navMap.width;

            const h = this.navMap.height;

            // clean the canvas first
            ctx.clearRect(0, 0, w, h);

            ctx.lineWidth = 0.05;

            for (const i in this.store.nodes) {
                const node = this.store.nodes[i];
                const x = node.x * 5 + w / 2; // 5 = initscale (20) / 4 (25%)
                const y = node.y * 5 + h / 2;

                const c = this.gradient[node.rank * 10];
                const color = this.boarderRanked ? `rgb(${c[0]},${c[1]},${c[2]})` : 'grey';
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.globalAlpha = this.navMapAlpha;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.stroke();
            }
            requestAnimationFrame(() => console.timeEnd('drawNavMap'));
        }, */

        /* drawNavMapRect() {
            console.time('drawNavMapRect');
            const ctx = this.navMapRect.getContext('2d');
            const scale = 20 / this.store.scale;
            const tx = this.store.translateX / 4;
            const ty = this.store.translateY / 4;

            const w = this.navMapRect.width;
            const h = this.navMapRect.height;

            // const x = tx + w/2 ;
            const x = w / 2 - tx * scale;
            // const y = ty + h/2;
            const y = h / 2 - ty * scale;

            ctx.clearRect(0, 0, this.navMapRect.width, this.navMapRect.height);
            ctx.strokeRect(x, y, w * scale, h * scale);
            requestAnimationFrame(() => console.timeEnd('drawNavMapRect'));
        }, */

        /* toggleShowNavMap() {
            this.showNavMap = !this.showNavMap;
            if (this.showNavMap) requestAnimationFrame(this.drawNavMap);
            if (this.showNavMap) requestAnimationFrame(this.drawNavMapRect);
        }, */

        /* toggleToggle() {
            this.toggle = !this.toggle;
            this.store.draw2();
        }, */

        /*
        activeImgWidthMore() {
            this.store.activeImgScale += 1; // update explorerState
            this.activeImgWidth = this.store.activeImgScale; // update ui
        },
        activeImgWidthLess() {
            this.store.activeImgScale -= 1; // update explorerState
            this.activeImgWidth = this.store.activeImgScale; // update ui
        },

        borderWidthMore() {
            this.store.borderWidth += 1; // update explorerState
            this.borderWidth = this.store.borderWidth; // update ui
        },
        borderWidthLess() {
            this.store.borderWidth -= 1; // update explorerState
            this.borderWidth = this.store.borderWidth; // update ui
        },
        doubleNodes() {
            this.store.doubleNodes();
            // Update count nodes in UI
            this.nodesTotal *= 2;
            this.nodesRecived *= 2;
        },


        addNodeToClassify(node) {
            console.log('addNodeToClassify');
            console.log(node);
            if (this.cuttedNodes.indexOf(node) === -1) this.cuttedNodes.push(node);
        },
        */

        /* changeScrollGrowth(v) {
            this.store.scrollGrowth = Math.round((this.store.scrollGrowth + v) * 100) / 100;
            this.scrollGrowth = this.store.scrollGrowth;
        },
        changeScrollImgGrowth(v) {
            this.store.scrollImgGrowth = Math.round((this.store.scrollImgGrowth + v) * 100) / 100;
            this.scrollImgGrowth = this.store.scrollImgGrowth;
        }, */

        /* changeHeatmapMinOpacity(v) {
            this.heatmapMinOpacity += v;
            this.drawHeatmap();
        }, */

        /* toggleShowKLabels() {
            this.showKLabels = !this.showKLabels;
            this.store.showKLabels = this.showKLabels;
            this.store.valid = false;
            console.log(this.showKLabels);
        }, */
    },
    watch: {
        cluster(value) {
            // console.log('change cluster');
            this.store.cluster = value;
        },
        colors(value) {
            console.log('watch color');
            console.log(value);
            console.log(this.colors);
            // const { b, g, r } = this.colors.rgba;
        },
        $route() {
            // initial draw trigger when switching to neigbhours mode
            // TODO remove if mode is encapsulated from routes
            this.store.triggerDraw();
        },
    },
    /* computed: {
        /!* selectedNode() {
            return this.store && this.store.selection && this.store.selection.name;
        }, *!/
        selectedNodeNeighboursCount() {
            return this.activeNode.links && Object.keys(this.activeNode.links).length;
        },
        /!* imageScale() {
            return this.store && this.store.selection && this.store.selection.imageScale;
        }, *!/
    }, */
    mounted() {
        // const worker = new TestWorker();

        // worker.postMessage({ a: 1 });

        /* worker.onmessage = function (event) {
            console.log('worker post a message');
            console.log(event.type);
            console.log(event.data);
        };
        */

        const socketIp = process.env.NODE_ENV === 'production' ? 'localhost' : 'localhost';

        // init socket connection
        const socket = io.connect(
            `http://${socketIp}:3000`,
            {
                transports: ['websocket'],
                reconnectionDelay: 100,
                reconnectionDelayMax: 1000,
            },
        );
        const canvas = document.getElementById('canvas');
        const parantWidth = canvas.parentNode.clientWidth; //* 0.8;
        const parantHeight = canvas.parentNode.clientHeight; // 700; //
        canvas.width = parantWidth;
        canvas.height = parantHeight;

        // this.width = parantWidth;
        // this.height = parantHeight;

        const hitCanvas = document.createElement('canvas');
        hitCanvas.width = parantWidth;
        hitCanvas.height = parantHeight;

        const heatmapCanvas = document.getElementById('heatmap');
        heatmapCanvas.width = parantWidth / 4;
        heatmapCanvas.height = parantHeight / 4;
        this.heatmap = simpleheat(heatmapCanvas);

        /* const navMap = document.getElementById('navMap');
        navMap.width = parantWidth / 4;
        navMap.height = parantHeight / 4;
        this.navMap = navMap;

        const navMapRect = document.getElementById('navMapRect');
        navMapRect.width = parantWidth / 4;
        navMapRect.height = parantHeight / 4;
        navMapRect.getContext('2d').strokeStyle = '#3882ff';
        navMapRect.getContext('2d').lineWidth = 1.5;
        this.navMapRect = navMapRect; */

        const navHeatmapCanvas = document.getElementById('navHeatmap');
        navHeatmapCanvas.width = parantWidth / 4;
        navHeatmapCanvas.height = parantHeight / 4;
        this.navHeatmap = simpleheat(navHeatmapCanvas); // todo why is it grey/unused?

        const navHeatmapRect = document.getElementById('navHeatmapRect');
        navHeatmapRect.width = parantWidth / 4;
        navHeatmapRect.height = parantHeight / 4;
        navHeatmapRect.getContext('2d').strokeStyle = '#3882ff';
        navHeatmapRect.getContext('2d').lineWidth = 1.5;
        this.navHeatmapRect = navHeatmapRect;

        // const ctx = canvas.getContext('2d');
        const s = new ExplorerState(canvas, hitCanvas, socket, this);

        this.store = s;

        // sync values from UI to store
        s.labelColor = this.labelColor;

        // set init value in UI
        this.cluster = s.cluster;
        this.clusterRadius = s.clusterRadius;
        this.clusterTile = s.clusterTile;
        this.representImgSize = s.representImgSize;
        this.neighbourImgSize = s.neighbourImgSize;
        this.zoomStage = s.zoomStage;
        this.sizeRange = s.sizeRange;
        this.scale = s.scale;
        // this.borderWidth = s.borderWidth;
        // this.scrollGrowth = s.scrollGrowth;
        // this.scrollImgGrowth = s.scrollImgGrowth;

        // save socket to ui
        this.socket = socket;

        socket.on('connect', () => {
            this.connectedToSocket = true;
            console.log('conected'); // das wirft immer unde
            console.log(`Socket id: ${socket.id}`); // das wirft immer unde
            console.log(socket);
            this.socketId = socket.id;
            // if there is allready data then this is just a reconnect
            const nodes = this.store.getNodes();
            console.log('nodes in store while connect (its maybe just a reconnect)');
            console.log(nodes);
            if (!Object.keys(nodes).length && !this.loadingNodes) {
                socket.emit('getNodes', { nodes: {} });
                this.reset();
            }
            // s.clear() // maybe there is something inside?
        });

        socket.on('disconnect', (reason) => {
            this.connectedToSocket = false;
            console.log(`disconnect: ${reason}`); // das wirft immer unde
            console.log(socket);
            // s.clear() // maybe there is something inside?
        });

        socket.on('node', (data) => {
            if (data.index % 100 === 0) {
                console.log(`receive node ${data.index}`);
                console.log(data);
            }
            // start time measure
            if (this.nodesRecived === 0) console.time('loadAllNodes');
            this.nodesRecived += 1;
            s.addNode(new Node(data));
            s.triggerDraw();
        });

        socket.on('receiveImage', (data) => {
            // console.log('receive image data');
            // console.log(data);
            const node = s.nodes[data.index];
            // console.log(node);
            node.image.src = `data:image/jpeg;base64,${data.buffer}`;
            node.hasImage = true;
        });

        socket.on('totalNodesCount', (data) => {
            console.log('totalNodesCount');
            console.log(data);
            this.nodesTotal = data;
        });

        socket.on('allNodesSend', () => {
            console.log('allNodesSend');
            this.loadingNodes = false;
            this.activateClusterMode();
            console.timeEnd('loadAllNodes');

            // TODO test super cluster
        });

        /* socket.on('nodesCount', (nodesCount) => {
            console.log(`nodesCount: ${nodesCount}`);
            this.nodesCount = nodesCount;
        }); */

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

        socket.on('updateEmbedding', (data, cb) => {
            console.log('updateEmbedding');
            console.log(data);
            console.log(this.loadingNodes);
            this.loadingNodes = false;
            console.log(this.loadingNodes);
            cb({ stopped: this.autoUpdateEmbedding });
            this.store.updateNodes(data.nodes);
            this.store.createSuperCluster();
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
        // clearInterval(this.store.timerId);
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

.stack {
    height: 100%;
}

.explorer {
    position: relative;
    margin: 0.5rem;
    height: calc(100% - 1rem); /* -double margin */
    width: calc(100% - 25rem); /* -details width */
}

.details {
    width: 25rem;
    margin: 0.5rem 0.5rem 0 0;
    background-color: white;
}

.canvas {
    background-color: white;
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
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
    padding: 1px 14px;
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
</style>
