<template>
    <div>
        <div class="imgArea" :class="{activePositiv: selectPositives}" @click="toggleActive(true)">
            <div class="image" v-for="(n, i) in positives" :key="i">
                <img
                    :src="n.icon.src"
                    alt=""
                    @click="removePositives(i)"
                >
            </div>
        </div>
        <div class="imgArea" :class="{activeNegativ: !selectPositives}" @click="toggleActive(false)">
            <div class="image" v-for="(n, i) in negatives" :key="i">
                <img
                    :src="n.icon.src"
                    alt=""
                    @click="removeNegatives(i)"
                >
            </div>
        </div>
        <div class="row">
            <div class="btn">train</div>
            <div class="btn">stop</div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'Svm',
    props: ['node'],
    data: () => ({
        positives: [],
        negatives: [],
        selectPositives: true,
        loading: false,
    }),
    watch: {
        node(n) {
            console.log('in SVM');
            console.log(n);
            if (n && this.positives.indexOf(n) === -1 && this.negatives.indexOf(n) === -1) {
                if (this.selectPositives) this.positives.push(n);
                else this.negatives.push(n);
            }
        },
    },

    methods: {
        toggleActive(v) {
            this.selectPositives = v;
        },
        removePositives(i) {
            this.positives.splice(i, 1);
        },
        removeNegatives(i) {
            this.negatives.splice(i, 1);
        },
    },

};
</script>

<style scoped>
    .imgArea {
        min-height: 4rem;
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
        display: flex;
        align-items: center;
        flex-flow: wrap;
        flex-direction: row;
        margin-bottom: 1rem;
    }

    .activePositiv {
        box-shadow: 0 7px 14px rgba(10, 255, 0, 0.2), 0 3px 6px rgba(0,0,0,.2);
    }

    .activeNegativ {
        box-shadow: 0 7px 14px rgba(255, 0, 66, 0.2), 0 3px 6px rgba(0,0,0,.2);
    }

    img {
        height: 100%;
        width: 100%;

        object-fit: scale-down;
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
</style>
