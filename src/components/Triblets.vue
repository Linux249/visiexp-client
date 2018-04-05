<template>
    <div class="triblet-area">

        <div v-if="node.negatives" class="negatives area" :class="{redActive}" @click="toogleRed">
            <template v-if="node.negatives">
                <div class="image" v-for="(n, i) in node.negatives">
                    <img
                        :key="i"
                        :src="n.icon.src"
                        alt=""
                        @click="removeNegativ(i)"
                    >
                </div>
            </template>
        </div>
        <div v-if="node.icon" class="node">
            <template v-if="node.icon">
                <img :src="node.icon.src" alt="">
            </template>
        </div>

        <div v-if="node.positives" class="positives area" :class="{greenActive}" @click="toogleBlue">
            <template v-if="node.positives">
                <div class="image" v-for="(n, i) in node.positives">
                    <img
                        :key="i"
                        :src="n.icon.src"
                        alt=""
                        @click="removePositiv(i)"
                    >
                </div>
            </template>
        </div>
    </div>
</template>

<script>

/*
    user clicks on area and can then add items
    TODO: if the user click somewhere else toogle all to false
    TODO: delete selection in trible
    TODO: sizing images in triple


 */

export default {
    name: 'triblets',
    props: ['node', 'positives', 'negatives'],
    data: () => ({
        redActive: false,
        greenActive: false,
    }),
    methods: {
        toogleRed() {
            if (!this.redActive && this.greenActive) this.greenActive = false;
            this.redActive = !this.redActive;
        },
        toogleBlue() {
            if (!this.greenActive && this.redActive) this.redActive = false;
            this.greenActive = !this.greenActive;
        },
        removePositiv(i) {
            this.node.positives.splice(i, 1);
        },
        removeNegativ(i) {
            this.node.negatives.splice(i, 1);
        },
    },
};
</script>

<style scoped>

    .triblet-area{
        /*width: 100%;*/
        height: 10rem;

        display: flex;
        background-color: white;

        padding: 5px;
    }

    .node {
        /*width: 5rem;*/
        margin: 0 5px;
        flex: 1;

        border: 1px solid rgba(146, 144, 142, 0.5);
        border-radius: 15px;
        background-color: rgba(91, 88, 82, 0.1);
    }

    img {
        height: 100%;
        width: 100%;

        object-fit: scale-down;
    }

    .redActive, .greenActive {
        //border-width: 3px !important;
        //margin: 0 !important;
    }
    .area {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: wrap;
        flex-direction: row;
        flex: 5;
        /*margin: 2px;*/
    }

    .positives {
        border: 1px solid rgba(0, 255, 10, 0.5);
        border-radius: 15px;
        background-color: rgba(0, 255, 10, 0.1);
    }

    .negatives {
        border: 1px solid rgba(255, 59, 20, 0.5);
        border-radius: 15px;
        background-color: rgba(255, 59, 20, 0.1);
    }

    .image {
        width: 4rem;
        height: 4rem;
        display: flex;
        justify-content: center;
        align-content: center;
        /*border: 1px solid red;*/

        padding: 0.1rem;
    }

    .image :hover {
        /*//width: 7rem;*/
    }


</style>
