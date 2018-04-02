<template>
    <div class="triblet-area">

        <div class="negatives-area" :class="{redActive}" @click="toogleRed">
            <template v-if="node.negatives">
                <img v-for="(n, i) in node.negatives" :key="i" :src="n.icon.src" alt="">
            </template>
        </div>
        <div class="node">
            <template v-if="node.icon">
                <img :src="node.icon.src" alt="">
            </template>
        </div>

        <div v-if="node.positives" class="positives-area" :class="{greenActive}" @click="toogleBlue">
            <template v-if="node.positives">
                <img v-for="(n, i) in node.positives" :key="i" :src="n.icon.src" alt="">
            </template>
        </div>
    </div>
</template>

<script>

    /*
            user clicks on area and can then add items
            TODO: if the user click somewhere else toogle all to false

     */

    export default {
        name: "triblets",
        props: ['node', 'positives', 'negatives'],
        data: () => ({
            redActive: false,
            greenActive: false
        }),
        methods: {
            toogleRed() {
                if (!this.redActive && this.greenActive) this.greenActive = false
                this.redActive = !this.redActive
            },
            toogleBlue() {
                if (!this.greenActive && this.redActive) this.redActive  = false
                this.greenActive = !this.greenActive
            }
        }
    }
</script>

<style scoped>

    .triblet-area{
        width: 100%;
        height: auto;
        display: flex;
        background-color: black;
    }

    .node {
        border: 1px solid white;
    }


    .redActive, .greenActive {
        border-width: 3px !important;
    }

    .positives-area {
        border: 1px solid green;
        flex: 1;
    }

    .negatives-area {
        border: 1px solid red;
        flex: 1;
    }


</style>
