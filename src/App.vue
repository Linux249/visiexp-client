<template>
    <div id="app">
        <nav-header />
        <tsne-map v-if="isAuth" :userId="userId" :dataset="dataset" :key="dataset" :switchDataset="switchDataset" />
        <login v-if="!isAuth" :setAuth="setAuth"/>
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
        dataset: '001',
        userId: null,
        isAuth: false,
    }),
    // TODO add key to TSNEMAP for changing all!
    methods: {
        switchDataset(newDataset) {
            console.log('handleChangeDataset');
            console.error(newDataset);
            this.dataset = newDataset;
        },
        setAuth(userId) {
            this.isAuth = true;
            this.userId = userId;
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

.btn.active {
    color: #fff;
    background: #6772e5;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.title {
    width: 100%;
    font-weight: bold;
    color: #767676;
    padding: 0.5rem 0.5rem 0.2rem;
}

.area {
    background-color: white;
    outline: none;
    margin-bottom: 0.5rem;
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
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
</style>
