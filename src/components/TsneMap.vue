<template>
    <div class="body">
        <div class="sub-header">
            <div class="btn" :if="nodesTotal">{{nodesRecived + "/" + nodesTotal}}</div>


            <div>
                <div class="row">
                    <!--<div># {{nodesCount}}</div>-->
                    <!--<div>connected: {{connectedToSocket}}</div>-->
                    <div class="btn"> {{scale}}</div>
                    <!--<div class="btn">{{scale2}}</div>-->
                    <div class="btn">{{zoomLvl}}</div>
                    <div class="btn">{{translateX}}</div>
                    <div class="btn">{{translateY}}</div>
                    <!--<div class="btn" @click="draw2">draw2</div>-->
                    <div class="btn" @click="doubleNodes">doubleNodes</div>
                </div>
            </div>
            <div class="row">
                <div class="dropdownArea"></div>
                <div class="btn" :class="{ active: sorted }" @click="sortNodes">sort</div>
                <div class="btn" :class="{ active: boarderRanked }" @click="toggleBoarderRanked">boarderRanked</div>
                <div class="btn" :class="{ active: sizeRanked }" @click="toggleSizeRanked">sizeRanked</div>
                <div class="btn" :class="{ active: showHeatmap }" @click="toggleShowHeatmap">heatmap</div>
                <div class="btn" :class="{ active: showNavMap }" @click="toggleShowNavMap">NavMap</div>
                <div class="btn" :class="{ active: showNavHeatmap }" @click="toggleShowNavHeatmap">NavHeatmap</div>


                <div class="categoriesArea" @mouseenter="showLabels = true" @mouseleave="showLabels = false">
                    <div class="btn">categories</div>
                    <div class="categories" v-if="showLabels">
                        <div
                            v-for="(category, i) in labels"
                            :key="i"
                        >
                            <div
                                class="btn"
                                :class="{ active: selectedCategory === i }"
                                @click="toogleCategory(i)"
                            >
                                {{ category.name }}
                            </div>
                            <div  v-if="selectedCategory === i">
                                <div
                                    class="btn"
                                    v-for="label in category.labels"
                                    :class="{ active: selectedLabel === label }"
                                    @click="toogleLabel(label)"
                                    :key="label"
                                >
                                    {{label}}
                                </div>
                            </div>
                        </div>
                        <!--<div
                            class="btn"
                            :class="{ active: showKLabels }"
                            @click="toggleShowKLabels"
                        >
                            K-Label
                        </div>-->
                    </div>
                </div>

                <div @click="toggleShowOptions" class="btn" :class="{ active: showOptions }">Options</div>
                <div @click="sendData" class="btn" >Update Data<send></send></div>
                <div @click="toggleUpdateEmbedding" class="btn" >
                    <play v-if="!autoUpdateEmbedding"></play>
                    <stop v-if="autoUpdateEmbedding"></stop>
                </div>
                <div class="tool-box row">
                    <div v-if="loadingNodes" class="loader" ></div>
                    <scissors :active="scissors" :clickHandler="selectScissors">a</scissors>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="stack">
                <canvas ref="canvas" id="canvas" class="canvas" tabindex="0" ></canvas>
                <div class="maps">
                    <canvas id="heatmap" class="canvas" :class="{ hide: !showHeatmap }" tabindex="0" ></canvas>
                    <div class="navMap" :class="{ hide: !showNavMap }">
                        <canvas id="navMap" class="canvas" tabindex="0" ></canvas>
                        <canvas id="navMapRect" tabindex="0" ></canvas>
                    </div>
                    <div class="navMap" :class="{ hide: !showNavHeatmap }">
                        <canvas id="navHeatmap" class="canvas" tabindex="0" ></canvas>
                        <canvas id="navHeatmapRect" tabindex="0" ></canvas>
                    </div>
                </div>
            </div>

            <div class="details">
                <div v-if="showOptions" class="options info-box">
                    <div class="">
                        <div>Cluster: {{Math.round(cluster)}}</div>
                        <div class="row">
                            <div @click="changeCluster(-100)" class="btn">-100</div>
                            <div @click="changeCluster(-1000)" class="btn">-1000</div>
                            <div @click="changeCluster(100)" class="btn">+100</div>
                            <div @click="changeCluster(1000)" class="btn">+1000</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>ImageSize: {{imgSize}}</div>
                        <div class="row">
                            <div @click="changeImgSize(-1)" class="btn">-1</div>
                            <div @click="changeImgSize(1)" class="btn">+1</div>
                        </div>
                    </div>
                    <!--
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
                    </div> -->
                    <div class="row-btn">
                        <div>zoomStage: {{zoomStage}}</div>
                        <div class="row">
                            <div @click="changeZoomStage(-1)" class="btn">-1</div>
                            <div @click="changeZoomStage(1)" class="btn">+1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>ClusterGrowth: {{clusterGrowth}}</div>
                        <div class="row">
                            <div @click="changeClusterGrowth(-0.01)" class="btn">-0.1</div>
                            <div @click="changeClusterGrowth(0.01)" class="btn">+0.1</div>
                        </div>
                    </div>
                    <div class="option-title">Heatmap</div>
                    <div class="row-btn">
                        <div>Radius: {{heatmapRadius}}</div>
                        <div class="row">
                            <div @click="changeHeatmapRadius(-1)" class="btn">+1</div>
                            <div @click="changeHeatmapRadius(1)" class="btn">+1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>Blur: {{heatmapBlur}}</div>
                        <div class="row">
                            <div @click="changeHeatmapBlur(-1)" class="btn">-1</div>
                            <div @click="changeHeatmapBlur(1)" class="btn">+1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div>sizeRange: {{sizeRange}}</div>
                        <div class="row">
                            <div @click="changeSizeRange(-1)" class="btn">-1</div>
                            <div @click="changeSizeRange(1)" class="btn">+1</div>
                        </div>
                    </div>
<!--                    <div class="row-btn">
                        <div>MinOpacity: {{heatmapMinOpacity}}</div>
                        <div class="row">
                            <div @click="changeHeatmapMinOpacity(-0.01)" class="btn">-0.01</div>
                            <div @click="changeHeatmapMinOpacity(0.01)" class="btn">+0.01</div>
                        </div>
                    </div>-->
                    <div class="option-title">Navmap</div>
                    <div class="row-btn">
                        <div>NavMapAlpha: {{navMapAlpha}}</div>
                        <div class="row">
                            <div @click="changeNavMapAlpha(-0.1)" class="btn">-0.1</div>
                            <div @click="changeNavMapAlpha(0.1)" class="btn">+0.1</div>
                        </div>
                    </div>
                    <div class="row-btn">
                        <div
                            class="color"
                            :class="{activeColor: selectedGradient === i}"
                            v-for="(color, i) in gradient"
                            :key="i"
                            v-bind:style="{ backgroundColor: `rgb(${color[0]},${color[1]},${color[2]})`}"
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
                </div>

                <groups v-if="this.showGroups"
                    :groupNodesByIds="groupNodesByIds"
                    :getGroupeIds="getGroupeIds"
                />

                <router-view
                    :nodes="cuttedNodes"
                    :labels="labels"
                    :node="clickedNode"
                    :getNode="getNode"
                    :triggerDraw="triggerDraw"
                    :changeActiveNode="changeActiveNode"
                    :groupNodesByIds="groupNodesByIds"
                    :getGroupeIds="getGroupeIds"
                    :getStore="getStore"
                />


                <div class="info-box"  v-if="activeNode">
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
import simpleheat from 'simpleheat';
import { Slider } from 'vue-color';
import Node from '../util/Node';
import CanvasState from '../util/CanvasState';
import RangeSlider from './RangeSlider';
import Triplets from './Triplets';
import Classifier from './Classifier';
import Groups from './Groups';
import Scissors from '../icons/Scissors';
import Play from '../icons/Play';
import Stop from '../icons/Stop';
import Send from '../icons/Send';
import TestWorker from '../worker/test.worker';


export default {
    store: null,
    name: 'TsneMap',
    components: {
        Scissors,
        Play,
        Stop,
        Send,
        RangeSlider,
        Triplets,
        Classifier,
        Groups,
        'slider-picker': Slider,
    },
    data: () => ({
        items: [],
        positives: [],
        negatives: [],
        // store: null,
        socket: null,
        connectedToSocket: false,
        loadingNodes: false,
        nodesTotal: 0,
        nodesRecived: 0,
        scale: 0,
        // scale2: 0,
        zoomLvl: 0,
        labels: [],
        selectedLabel: null, // save the selected label
        selectedCategory: null,
        showLabels: false, // show the labels in a dropdown
        clickedNode: null,
        labelColor: '#6057ff',
        showKLabels: false,
        scissors: false,
        width: 0,
        height: 0,
        activeNode: {},
        cluster: 5, // default - set on mount from CanvasStore class
        imgSize: 0, // default - set on mount from CanvasStore class
        activeImgWidth: 0, // default - set on mount from CanvasStore class
        borderWidth: 0, // default - set on mount from CanvasStore class
        range: 0,
        cuttedNodes: [], // selected nodes through scissor
        showOptions: false, // show options menu
        scrollGrowth: 0,
        scrollImgGrowth: 0,
        clusterGrowth: 0,
        translateX: 0,
        translateY: 0,
        // heatmap: {}, // this object should not be controlled by
        showHeatmap: false,
        heatmapRadius: 1,
        heatmapBlur: 5,
        // heatmapMinOpacity: 0.05,
        showNavMap: false,
        navMapAlpha: 0.1,
        showNavHeatmap: false,
        boarderRanked: false,
        sizeRanked: false,
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
        sizeRange: 5,
        showColorPicker: false,
        colors: {
            hex: '#194d33',
            hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
            hsv: { h: 150, s: 0.66, v: 0.30, a: 1 },
            rgba: { r: 25, g: 77, b: 51, a: 1 },
            a: 1,
        },
        selectedGradient: 0, // default is the first
        autoUpdateEmbedding: false,
        socketId: '',
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
            this.store.resetStore();
            this.socket.emit('updateNodes', { nodes });
            this.reset();
        },

        changeActiveNode(n) {
            this.activeNode = n;
            return null;
        },

        groupNodesByIds(ids) {
            this.store.groupNodesByIds(ids);
        },

        getGroupeIds(ids) {
            return this.store.getGroupeIds(ids);
        },


        changeCluster(v) {
            // console.log("cluster more clicked")
            this.store.cluster += v; // update canvasState
            this.cluster = this.store.cluster; // update ui
        },

        triggerDraw() {
            this.store.triggerDraw();
        },

        sortNodes() {
            this.store.sortNodes();
            this.sorted = this.store.sorted;
        },

        drawHeatmap() {
            console.time('drawHeatmap');
            const heatmap = this.heatmap;

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

        drawNavMap() {
            console.time('drawNavMap');
            const ctx = this.navMap.getContext('2d'),
                w = this.navMap.width,
                h = this.navMap.height;

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
        },

        drawNavMapRect() {
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
        },

        drawNavHeatmap() {
            console.time('drawNavHeatmap');
            const navHeatmap = this.navHeatmap;
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

            const w = this.navMapRect.width;
            const h = this.navMapRect.height;

            // const x = tx + w/2 ;
            const x = w / 2 - tx * scale;
            // const y = ty + h/2;
            const y = h / 2 - ty * scale;

            ctx.clearRect(0, 0, this.navHeatmapRect.width, this.navHeatmapRect.height);
            ctx.strokeRect(x, y, w * scale, h * scale);
            requestAnimationFrame(() => console.timeEnd('drawNavHeatmapRect'));
        },


        toggleShowNavMap() {
            this.showNavMap = !this.showNavMap;
            if (this.showNavMap) requestAnimationFrame(this.drawNavMap);
            if (this.showNavMap) requestAnimationFrame(this.drawNavMapRect);
        },

        toggleShowNavHeatmap() {
            this.showNavHeatmap = !this.showNavHeatmap;
            if (this.showNavHeatmap) requestAnimationFrame(this.drawNavHeatmap);
            if (this.showNavHeatmap) requestAnimationFrame(this.drawNavHeatmapRect);
        },

        toggleShowHeatmap() {
            this.showHeatmap = !this.showHeatmap;
            if (this.showHeatmap) requestAnimationFrame(this.drawHeatmap);
        },

        toggleSizeRanked() {
            this.sizeRanked = !this.sizeRanked;
            this.store.draw2();
        },

        toggleBoarderRanked() {
            this.boarderRanked = !this.boarderRanked;
            this.store.draw2();
        },

        toggleToggle() {
            this.toggle = !this.toggle;
            this.store.draw2();
        },

        changeImgSize(v) {
            this.store.imgSize += v; // update canvasState
            this.imgSize = this.store.imgSize; // update ui
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
        doubleNodes() {
            this.store.doubleNodes();
        },

        /*
        addNodeToClassify(node) {
            console.log('addNodeToClassify');
            console.log(node);
            if (this.cuttedNodes.indexOf(node) === -1) this.cuttedNodes.push(node);
        },
        */
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
        changeZoomStage(v) {
            this.store.zoomStage += v;
            this.zoomStage = this.store.zoomStage;
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
        /* changeHeatmapMinOpacity(v) {
            this.heatmapMinOpacity += v;
            this.drawHeatmap()
        }, */
        changeSizeRange(v) {
            this.store.sizeRange += v;
            this.sizeRange = this.store.sizeRange;
        },
        changeNavMapAlpha(v) {
            this.navMapAlpha += v;
            this.drawNavMap();
        },
        toggleShowKLabels() {
            this.showKLabels = !this.showKLabels;
            this.store.showKLabels = this.showKLabels;
            this.store.valid = false;
            console.log(this.showKLabels);
        },

        toogleCategory(cat) {
            if (this.selectedCategory === cat) this.selectedCategory = null;
            else this.selectedCategory = cat;
            this.store.selectedCategory = this.selectedCategory;
            this.store.triggerDraw();
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
        reset() {
            this.loadingNodes = true;
            this.nodesRecived = 0;
            this.nodesTotal = 0;
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
            const { b, g, r } = this.colors.rgba;
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
        const worker = new TestWorker();

        worker.postMessage({ a: 1 });


        worker.onmessage = function (event) {
            console.log('worker post a message');
            console.log(event.type);
            console.log(event.data);
        };

        const socket = io.connect('http://localhost:3000', {
            transports: ['websocket'],
            reconnectionDelay: 100,
            reconnectionDelayMax: 1000,
        });
        const canvas = document.getElementById('canvas');
        const parantWidth = canvas.parentNode.clientWidth; //* 0.8;
        const parantHeight = canvas.parentNode.clientHeight; // 700; // canvas.parentNode.clientHeight //* 0.8
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

        const navMap = document.getElementById('navMap');
        navMap.width = parantWidth / 4;
        navMap.height = parantHeight / 4;
        this.navMap = navMap;

        const navMapRect = document.getElementById('navMapRect');
        navMapRect.width = parantWidth / 4;
        navMapRect.height = parantHeight / 4;
        navMapRect.getContext('2d').strokeStyle = '#3882ff';
        navMapRect.getContext('2d').lineWidth = 1.5;
        this.navMapRect = navMapRect;

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


        // const ctx = canvas.getContext('2d');
        const s = new CanvasState(canvas, hitCanvas, socket, this);

        this.store = s;


        // sync values from UI to store
        s.labelColor = this.labelColor;

        // set init value in UI
        this.cluster = s.cluster;
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
            this.socketId = socket.id;
            // if there is allready data then this is just a reconnect
            const nodes = this.store.getNodes();
            console.log('nodes in store while connect (its maybe just a reconnect)');
            console.log(nodes);
            if (!Object.keys(nodes).length && !this.loadingNodes) {
                socket.emit('updateNodes', { nodes: {} });
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
            if (!this.nodesRecived) console.time('loadAllNodes');
            this.nodesRecived += 1;
            s.addNode(new Node(data, s.ctx, s.hitCtx));
            s.triggerDraw();
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

        socket.on('totalNodesCount', (data) => {
            console.log('totalNodesCount');
            console.log(data);
            this.nodesTotal = data;
        });

        socket.on('allNodesSend', () => {
            console.log('allNodesSend');
            this.loadingNodes = false;
            console.timeEnd('loadAllNodes');
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

        socket.on('updateEmbedding', (data) => {
            console.log('updateEmbedding');
            console.log(data);
            this.store.updateNodes(data.nodes)
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
    .stack {
        display: flex;
        position: relative;
        height: 700px;
        width: calc(100% - 25rem);
        margin: 0.5rem;
    }

    .canvas {
        background-color: white;
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
        /*margin: 0.5rem;*/
        outline: none;
    }

    .maps {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        margin: 0.5rem;
    }

    .navMap {
        position: relative;
    }

    #heatmap {
        z-index: 10;
    }

    #navMap, #navHeatmap {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 10;
    }

    #navMapRect, #navHeatmapRect {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 20;
        margin: 0.5rem;
        outline: none;
    }

    .hide {
        display: none;
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
        width: 25rem;
        height: 100%;
        padding: 0.5rem;
        background-color: white;
    }

    .row-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info-box {
        /*padding: 0.5rem;*/
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

    .categoriesArea {
        position: relative;
        z-index: 1;
    }

    .categories {
        /*position: absolute;*/
        top: 25px;
        width: 100%;
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
</style>
