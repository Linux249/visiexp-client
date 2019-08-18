<template>
    <div class="header">
        <div class="left-header">
            <router-link to="/explorer">Explorer</router-link>
            <router-link to="/dataset">Dataset</router-link>
            <!--<router-link to="/svm">SVM</router-link>-->
            <router-link to="/explorer/classifier">Classifier</router-link>
            <router-link to="/explorer/settings">Settings</router-link>
        </div>
        <div class="right-header" v-if="explorer">
            <div class="btn" @click="toggleWasmMode" :class="{ active: wasmMode }">
                wasm
            </div>
            <div :class="{ active: loading }" @click="updateEmbedding" class="btn">
                Update embedding
                <send v-if="!loading"></send>
                <div class="loader" v-if="loading"></div>
            </div>
            <div :class="{ active: help }" @click="toggleHelp" class="btn">
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
</template>
<script>
import Send from '../icons/Send';
import Help from '../icons/Help';

export default {
    name: 'NavHeader',
    components: { Send, Help },
    props: {
        wasmMode: Boolean,
        toggleWasmMode: Function,
    },
    data: () => ({
        loading: false,
        explorer: false,
        help: true,
    }),
    methods: {
        updateEmbedding() {
            console.log('updateEmbedding');
            console.log(this.$root.explorer);
            this.$root.explorer.sendData();
        },
        toggleHelp() {
            console.log('toggleHelp');
            this.help = this.$root.explorer.showHelp = !this.$root.explorer.showHelp;
        },
    },
    mounted() {
        // save here for global accesse
        this.$root.navheader = this;
    },
};
</script>

<style scoped>
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
</style>
