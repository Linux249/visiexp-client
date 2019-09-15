<template>
    <div class="header">
        <div class="left-header">
            <div class="title-header"></div>
            <router-link class="title-header" to="/explorer">
                Visual Similarity Explorer
            </router-link>
            <div>{{ name }}</div>
            <div class="btn" @click="toggleWasmMode" :class="{ active: wasmMode }">
                wasm
            </div>
        </div>
        <div class="right-header" v-if="explorer">
            <!--<router-link to="/svm">SVM</router-link>-->
            <!--<router-link v-if="isAuth && explorer" to="/explorer/classifier">Classifier</router-link>-->
            <div :class="{ active: loading }" @click="updateEmbedding" class="icon">
                <send v-if="!loading"></send>
                <div class="loader" v-if="loading"></div>
            </div>
            <!--            <router-link v-if="isAuth" to="/dataset">Dataset</router-link>-->
            <div @click="handleDataset" class="icon">
                Dataset
            </div>
            <router-link
                v-if="isAuth && explorer"
                :class="{ active: $route.params.setup === 'settings' }"
                to="/explorer/settings"
                ><settings></settings
            ></router-link>
            <div :class="{ active: help }" @click="toggleHelp" class="icon">
                <help></help>
            </div>
            <router-link v-if="isAuth" to="/logout"><logout></logout></router-link>
            <router-link v-if="!isAuth" to="/login">Login</router-link>
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
import Logout from '../icons/Logout';
import Settings from '../icons/Settings';
import { DATASET } from '../util/modes';

export default {
    name: 'NavHeader',
    components: {
        Send,
        Help,
        Logout,
        Settings,
    },
    props: {
        wasmMode: Boolean,
        toggleWasmMode: Function,
        isAuth: Boolean,
        name: String,
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
            this.$modal.show('dialog', {
                title: 'Are you sure?',
                text: 'It will take a while until the embedding has been updated.',
                buttons: [
                    {
                        title: 'Update embedding',
                        handler: () => {
                            this.$root.explorer.sendData();
                            this.$modal.hide('dialog');
                        },
                    },
                    {
                        title: 'Cancel',
                        default: true, // Will be triggered by default if 'Enter' pressed.
                        // handler: () => {}, // Button click handler
                    },
                ],
            });
        },
        toggleHelp() {
            console.log('toggleHelp');
            this.help = this.$root.explorer.showHelp = !this.$root.explorer.showHelp;
        },
        handleDataset() {
            this.$modal.show('dialog', {
                title: 'Are you sure?',
                text: 'You will lose your current groups and the movement of your images',
                buttons: [
                    {
                        title: 'Choose new Dataset',
                        handler: () => {
                            this.$modal.hide('dialog');
                            this.$router.push({ name: DATASET });
                        },
                    },
                    {
                        title: 'Cancel',
                        default: true, // Will be triggered by default if 'Enter' pressed.
                    },
                ],
            });
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

.title-header {
    padding-left: 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;

    border-bottom: none;
}

.left-header,
.right-header {
    display: flex;
    align-items: center;
}

/*used for header nav links*/
a,
.icon {
    text-decoration: none;
    cursor: pointer;

    display: flex;
    align-items: center;

    height: 30px;

    font-weight: bold;
    padding: 0 0.7rem;
    margin: 5px 0;
    color: #767676;
}

a:hover {
    color: #484848;
}

icon:hover {
    color: #484848;
}

.active {
    /*//background-color: paleturquoise;*/
    border-bottom: 5px solid paleturquoise;
    color: #484848;
    margin-bottom: 0;
}

/*.icon {*/
/*    font-family: Camphor, Open Sans, Segoe UI, sans-serif;*/
/*    text-rendering: optimizeLegibility;*/
/*    -webkit-font-smoothing: antialiased;*/
/*    text-decoration: none;*/
/*    display: flex;*/
/*    -webkit-box-align: center;*/
/*    align-items: center;*/
/*    height: 35px;*/
/*    font-weight: bold;*/
/*    padding: 0 1em;*/
/*    margin-bottom: 5px;*/
/*    color: #767676;*/
/*}*/

.active {
    color: #6772e5;
}
</style>
