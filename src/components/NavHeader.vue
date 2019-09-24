<template>
    <div class="header">
        <div class="left-header">
            <div class="title-header"></div>
            <router-link class="title-header" to="/explorer">
                Visual Similarity Explorer
            </router-link>
            <!--            <div class="btn" @click="toggleWasmMode" :class="{ active: wasmMode }">-->
            <!--                wasm-->
            <!--            </div>-->
        </div>

        <div class="right-header">
            <!--<router-link to="/svm">SVM</router-link>-->
            <!--<router-link v-if="isAuth && explorer" to="/explorer/classifier">Classifier</router-link>-->
            <!--            <div-->
            <!--                v-if="explorer"-->
            <!--                :class="{ active: loading }"-->
            <!--                @click="updateEmbedding"-->
            <!--                v-tooltip="'update Embedding'"-->
            <!--                class="icon"-->
            <!--            >-->
            <!--                <send v-if="!loading"></send>-->
            <!--                <div class="loader" v-if="loading"></div>-->
            <!--            </div>-->
            <!--            <router-link v-if="isAuth" to="/dataset">Dataset</router-link>-->
            <div v-if="explorer" class="dataset-name">{{ name }}</div>
            <div v-if="explorer" @click="handleDataset" class="icon" v-tooltip="'switch dataset'">
                <database></database>
            </div>
            <div
                v-if="explorer"
                :class="{ active: showSettings }"
                @click="toggleSettings"
                class="icon"
                v-tooltip="'settings'"
            >
                <settings></settings>
            </div>
            <div
                v-if="explorer"
                :class="{ active: help }"
                @click="toggleHelp"
                class="icon"
                v-tooltip="help ? 'close help' : 'show help'"
            >
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
            <!--            <router-link v-if="!isAuth" to="/login">Login</router-link>-->
            <router-link v-if="isAuth" to="/logout" v-tooltip="'logout'">
                <logout></logout
            ></router-link>
        </div>
    </div>
</template>
<script>
import Send from '../icons/Send';
import Help from '../icons/Help';
import Logout from '../icons/Logout';
import Database from '../icons/Database';
import Settings from '../icons/Settings';
import { DATASET } from '../util/modes';

export default {
    name: 'NavHeader',
    components: {
        Send,
        Help,
        Logout,
        Settings,
        Database,
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
        showSettings: false,
    }),
    methods: {
        updateEmbedding() {
            console.log('updateEmbedding');
            console.log(this.$root.explorer);
            this.$modal.show('dialog', {
                title: 'Update embedding?',
                text: 'It will take a while until the embedding has been updated.',
                buttons: [
                    {
                        title: 'Ok',
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
        toggleSettings() {
            console.log('toggleHelp');
            this.showSettings = this.$root.explorer.showSettings = !this.$root.explorer
                .showSettings;
        },
        handleDataset() {
            this.$modal.show('dialog', {
                title: 'Back to dataset selection?',
                text: 'You will lose your defined groups and your spatial arrangement of images',
                buttons: [
                    {
                        title: 'Ok',
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

.active {
    color: #6772e5;
}

.dataset-name {
    display: flex;
    align-items: center;

    color: #767676;
    /*font-size: 1.3rem;*/
    font-weight: 500;
}
</style>
