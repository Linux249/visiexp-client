
<template>
    <div id="app">
        <NavHeader > </NavHEader>

        <router-view/>
    </div>
</template>

<script>
import NavHeader from './components/NavHeader';

export default {
    name: 'App',
    components: { NavHeader },
};
</script>

<style>

    #app {
        font-family: Camphor, Open Sans, Segoe UI, sans-serif;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
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


</style>
