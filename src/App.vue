<template>
    <div id="app">
        <nav-header />
        <tsne-map
            :dataset="dataset"
            :key="dataset + selectedImgCount + wasmMode + loadOldDataset"
            :selectedImgCount="selectedImgCount"
            :switchDataset="switchDataset"
            :userId="userId"
            :wasmMode="wasmMode"
            :toggleWasmMode="toggleWasmMode"
            :loadOldDataset="loadOldDataset"
            v-if="isAuth"
        />
        <login :setAuth="setAuth" v-if="!isAuth" />
        <notifications :duration="5000" group="default" position="bottom right"></notifications>
    </div>
</template>

<script>
import NavHeader from './components/NavHeader';
import TsneMap from './components/TsneMap';
import Login from './components/Login';

export default {
    name: 'App',
    components: { NavHeader, TsneMap, Login },
    // maybe here is a good place to reset component...
    data: () => ({
        dataset: '001', // todo reset to 001
        userId: null,
        isAuth: false, // todo reset to false
        selectedImgCount: 500, // default
        wasmMode: false,
        loadOldDataset: false,
    }),
    // TODO add key to TSNEMAP for changing all!
    methods: {
        switchDataset(newDataset, count, old) {
            console.log('switchDataset');
            console.log(newDataset, count);
            this.dataset = newDataset;
            this.loadOldDataset = old;
            this.selectedImgCount = count;
            this.$router.push('/');
        },
        setAuth(userId) {
            this.isAuth = true;
            this.userId = userId;
        },
        toggleWasmMode() {
            this.wasmMode = !this.wasmMode;
        },
    },
};
</script>

<style>
input {
    outline: none;
    background-color: transparent !important;
    border: 0 solid;
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    font: inherit;
}

#app {
    font-family: Camphor, Open Sans, Segoe UI, sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 100%;
    width: 100%;
    margin: 0;
}

.row {
    display: flex;
    align-items: flex-start;
}

.row-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
}

.row-end {
    display: flex;
    justify-content: flex-end;
}

.wrap {
    flex-wrap: wrap;
}

.button {
    margin: 10px;
    height: 40px;
    line-height: 40px;
    padding: 0 14px;
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

.btn {
    display: flex;
    align-items: center;
    /*align-self: center;*/
    text-decoration: none;
    /*text-overflow: ;*/
    margin: 0.3rem 0.5rem;
    /*height: 20px;*/
    line-height: 20px;
    padding: 1px 14px;
    box-shadow: 0 2px 2px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
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

.btn.active {
    color: #fff;
    background: #6772e5;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.btn.dummy:hover {
    transform: none;
    box-shadow: 0 2px 2px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.title {
    width: 100%;
    font-weight: bold;
    color: #767676;
    padding: 0.5rem 0.5rem 0.2rem;
}

.title2 {
    font-weight: bold;
    color: #767676;
    padding: 0.5rem 10px;
    margin: -8px -8px 0;
    background-color: #d1d6ff;
}

.area {
    background-color: white;
    outline: none;
    margin-bottom: 0.5rem;
    /*box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);*/
    box-shadow: 0 2px 4px rgba(50, 50, 93, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08);
    /*z-index: 0;*/
}

.between {
    display: flex;
    justify-content: space-between;
}

.v-center {
    display: flex;
    align-items: center;
}

.input {
    margin-left: 0.5rem;
}

.color-box {
    /*width: 30px;*/
    /*height: 20px;*/
    border: 0;
    padding: 0;
}

.padding {
    padding: 0.5rem;
}

.flex {
    display: flex;
}
.tooltip {
    display: block !important;
    z-index: 10000;
}

.tooltip .tooltip-inner {
    background: rgba(97, 97, 97, 0.9);
    color: #FFFFFF;
    border-radius: 4px;
    padding: 5px 10px 4px;
}

.tooltip .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: rgba(97, 97, 97, 0.9);
    z-index: 1;
}

.tooltip[x-placement^="top"] {
    margin-bottom: 5px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
    border-width: 5px 5px 0 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    bottom: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
    margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
    border-width: 0 5px 5px 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-top-color: transparent !important;
    top: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
    margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
    border-width: 5px 5px 5px 0;
    border-left-color: transparent !important;
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
    left: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
}

.tooltip[x-placement^="left"] {
    margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
    border-width: 5px 0 5px 5px;
    border-top-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    right: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
}

.tooltip.popover .popover-inner {
    background: #f9f9f9;
    color: black;
    padding: 24px;
    border-radius: 5px;
    box-shadow: 0 5px 30px rgba(black, .1);
}

.tooltip.popover .popover-arrow {
    border-color: #f9f9f9;
}

.tooltip[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
}
</style>
