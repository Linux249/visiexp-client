<template>
    <div class="area">
        <div v-if="loading" class="loading"><div class="loading-wheel"></div></div>
        <div class="imgArea" :class="{activePositiv: selectPositives}" @click="toggleActive(true)">
            <div class="image" v-for="(n, i) in positives" :key="i" @mouseover="handleMouseOver(n)">
                <img
                    :src="n.icon.src"
                    alt=""
                    @click="removePositives(i)"
                >
            </div>
        </div>
        <div class="imgArea" :class="{activeNegativ: !selectPositives}" @click="toggleActive(false)">
            <div class="image" v-for="(n, i) in negatives" :key="i" @mouseover="handleMouseOver(n)">
                <img
                    :src="n.icon.src"
                    alt=""
                    @click="removeNegatives(i)"
                >
            </div>
        </div>
        <div class="row">
            <div class="btn" @click="trainSvm">train</div>
            <div class="btn">stop</div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'Svm',
    props: ['node', 'nodes', 'getNode', 'changeActiveNode'],
    data: () => ({
        positives: [],
        positivesAll: [],
        negatives: [],
        negativesAll: [],
        selectPositives: true,
        loading: false,
    }),
    watch: {
        node(n) {
            this.addNode(n);
        },
        nodes(nodes) {
            if (nodes) nodes.forEach(n => this.addNode(n));
        },
    },

    methods: {
        addNode(n) {
            if (n && this.positives.indexOf(n) === -1 && this.negatives.indexOf(n) === -1) {
                if (this.selectPositives) this.positives.push(n);
                else this.negatives.push(n);
            }
        },
        toggleActive(v) {
            this.selectPositives = v;
        },
        removePositives(i) {
            this.negatives.push(this.positives[i]);
            this.positives.splice(i, 1);
        },
        removeNegatives(i) {
            this.positives.push(this.negatives[i]);
            this.negatives.splice(i, 1);
        },
        async trainSvm() {
            console.log('trainSvm clicked');
            this.loading = true

            this.positives.forEach(n => this.positivesAll.indexOf(n) === -1 && this.positivesAll.push(n))
            this.negatives.forEach(n => this.negativesAll.indexOf(n) === -1 && this.negativesAll.push(n))

            const body = JSON.stringify({
                p: this.positivesAll,
                n: this.negativesAll,
            });
            const data = await fetch('/api/v1/updateSvm', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body,
            }).then(res => res.json()).catch(e => console.error(e));

            this.positives = [];    // reset
            data.p.forEach(i => this.positives.push(this.getNode(i)));
            this.negatives = [];    // reset
            data.n.forEach(i => this.negatives.push(this.getNode(i)));
            this.loading = false
        },
        async stopSvm() {
            console.log('stopSvm clicked');
            this.loading = true

            const data = await fetch('/api/v1/updateSvm', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
            }).then(res => res.json()).catch(e => console.error(e));

            this.positives = [];    // reset
            data.p.forEach(i => this.positives.push(this.getNode(i)));
            this.negatives = [];    // reset
            data.n.forEach(i => this.negatives.push(this.getNode(i)));
            this.loading = false
        },
        handleMouseOver(n) {
            this.changeActiveNode(n)
        }
    },

};
</script>

<style scoped>
    .area {
        position: relative;

        padding: 0.1rem;
    }

    .loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.1);
    }

    .loading-wheel {
        width: 10px;
        height: 10px;
        margin-top: -20px;
        margin-left: -20px;

        position: absolute;
        top: 50%;
        left: 50%;

        border-width: 20px;
        border-radius: 50%;
        -webkit-animation: spin 1s linear infinite;

        border-style: double;
        border-color: #ccc transparent;
    }
    /*http://jsfiddle.net/8k2NV/2/*/

    @-webkit-keyframes spin {
        0% {
            -webkit-transform: rotate(0);
        }
        100% {
            -webkit-transform: rotate(-360deg);
        }
    }

    .imgArea {
        min-height: 4rem;
        max-height: 15rem;
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
        display: flex;
        align-items: center;
        flex-flow: wrap;
        flex-direction: row;
        margin-bottom: 1rem;

        overflow:auto;
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
        width: 3.5rem;
        height: 3.5rem;
        display: flex;
        justify-content: center;
        align-content: center;
        padding: 0.1rem;
    }
</style>
