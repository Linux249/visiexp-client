<template>
    <div class="triblet-area">

        <div class="negatives area" :class="{redActive}" @click="toogleRed">
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
        <div class="node">
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
        }
    },
};
</script>

<style scoped>

    .triblet-area{
        width: 100%;
        height: 10rem;

        display: flex;
        background-color: black;
    }

    .node {
        border: 1px solid white;
        width: 5rem;
        margin: 2px;
    }

    img {
        width: 100%;
    }

    .redActive, .greenActive {
        //border-width: 3px !important;
        //margin: 0 !important;
    }
    .area {
        display: flex;
        flex: 1;
        margin: 2px;
    }

    .positives {
        border: 1px solid green;
    }

    .negatives {
        border: 1px solid red;
    }

    .image {
        max-width: 5rem;
    }


</style>
