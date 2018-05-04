
<template>
    <div id="app">
        <nav-header />
        <tsne-map />
    </div>
</template>

<script>
import NavHeader from './components/NavHeader';
import TsneMap from './components/TsneMap';

export default {
    name: 'App',
    components: { NavHeader, TsneMap },
};
</script>

<style>
    body {
        margin: 0 !important;
    }

    input {
        outline: none;
        background-color: transparent !important;
        border: 0 solid;
        border-bottom: 1px solid rgba(0,0,0,0.25);
        font: inherit;
    }

    #app {
        font-family: Camphor, Open Sans, Segoe UI, sans-serif;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin: 0;
    }

    .row {
        display: flex;
    }

    .button {
        margin: 10px;
        height: 40px;
        line-height: 40px;
        padding: 0 14px;
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        background: #fff;
        color: #6772e5;
        border-radius: 4px;
        font-size: 15px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .025em;
        transition: all .15s ease;
        cursor: pointer;
    }

    .btn {
        align-self: center;
        text-decoration: none;
        /*text-overflow: ;*/
        margin: 0.5rem;
        height: 20px;
        line-height: 20px;
        padding: 0 14px;
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        background: #fff;
        color: #6772e5;
        border-radius: 4px;
        font-size: 15px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .025em;
        transition: all .15s ease;
        cursor: pointer;
    }

    .btn.active {
        color: #fff;
        background: #6772e5;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
    }


</style>
