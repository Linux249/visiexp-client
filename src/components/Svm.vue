<template>
    <div class="areas">
        <div class="loading" v-if="loading">
            <div class="loading-wheel"></div>
        </div>
        <div
            :class="{ activePositiv: selectPositives }"
            @click="toggleActive(true)"
            class="imgArea"
        >
            <div
                :key="i"
                @mouseover="handleMouseOver(node)"
                class="image"
                v-for="(node, i) in positives"
            >
                <img
                    :alt="node.name"
                    :src="node.image.src"
                    @click="switchPositivs(i)"
                    @contextmenu.prevent="removePositives(i)"
                    v-if="node.hasImage"
                />
            </div>
        </div>
        <div
            :class="{ activeNegativ: !selectPositives }"
            @click="toggleActive(false)"
            class="imgArea"
        >
            <div
                :key="i"
                @mouseover="handleMouseOver(node)"
                class="image"
                v-for="(node, i) in negatives"
            >
                <img
                    :alt="node.name"
                    :src="node.image.src"
                    @click="switchNegatives(i)"
                    @contextmenu.prevent="removeNegatives(i)"
                    v-if="node.hasImage"
                />
            </div>
        </div>
        <div class="imgArea">
            <div :key="i" class="image" v-for="(n, i) in topScored">
                <img :alt="node.name" :src="node.image.src" v-if="node.hasImage" />
            </div>
        </div>
        <div class="row">
            <div @click="trainSvm" class="btn">train</div>
            <div @click="stopSvm" class="btn">stop</div>
            <div @click="clearSvm" class="btn">clear</div>
            <div @click="clearSvm" class="btn">{{ count }}</div>
        </div>
    </div>
</template>

<script>
import { apiUrl } from '../config/apiUrl';

export default {
    name: 'Svm',
    props: ['node', 'nodes', 'getNode', 'changeActiveNode'],

    data: () => ({
        positives: [],
        positivesAll: [],
        negatives: [],
        negativesAll: [],
        topScored: [],
        selectPositives: true,
        loading: false,
        count: 0,
    }),

    watch: {
        // TODO: Implemnachanges coming from outside so its maybe a
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
            // switching between positiv and negativ mode
            this.selectPositives = v;
        },
        switchPositivs(i) {
            this.negatives.push(this.positives[i]);
            this.positives.splice(i, 1);
        },
        switchNegatives(i) {
            this.positives.push(this.negatives[i]);
            this.negatives.splice(i, 1);
        },
        removePositives(i) {
            this.positives.splice(i, 1);
        },
        removeNegatives(i) {
            this.negatives.splice(i, 1);
        },
        async trainSvm() {
            console.log('trainSvm clicked');
            this.loading = true;

            // save nodes
            this.positives.forEach(
                n => this.positivesAll.indexOf(n) === -1 && this.positivesAll.push(n),
            );
            this.negatives.forEach(
                n => this.negativesAll.indexOf(n) === -1 && this.negativesAll.push(n),
            );

            const body = JSON.stringify({
                p: this.positivesAll.map(node => node.index),
                n: this.negativesAll.map(node => node.index),
                count: this.count,
                userId: this.$parent.userId,
            });
            const data = await fetch(`${apiUrl}/api/v1/svm/train`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body,
            })
                .then(res => res.json())
                .catch((e) => {
                    this.loading = false;
                    console.error(e);
                });

            console.log(data);
            this.count += 1;

            this.positives = []; // reset
            data.p.forEach((i) => {
                const node = this.getNode(i);
                if (node) this.positives.push(node);
                else {
                    console.log(
                        new Error(
                            'der zurückgegebene Index in trainSvm ist nicht als Knoten vorhanden',
                        ),
                    );
                }
            });
            this.negatives = []; // reset
            data.n.forEach((i) => {
                const node = this.getNode(i);
                if (node) this.negatives.push(node);
                else {
                    console.log(
                        new Error(
                            'der zurückgegebene Index in trainSvm ist nicht als Knoten vorhanden',
                        ),
                    );
                }
            });
            this.topScored = []; // reset
            data.t.forEach((i) => {
                const node = this.getNode(i);
                if (node) this.topScored.push(node);
                else {
                    console.log(
                        new Error(
                            'der zurückgegebene Index in trainSvm ist nicht als Knoten vorhanden',
                        ),
                    );
                }
            });
            this.loading = false;
            console.log('done');
        },
        async stopSvm() {
            console.log('stopSvm clicked');
            this.loading = true;

            await fetch(`${apiUrl}/api/v1/svm/stop`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ userId: this.$parent.userId }),
            })
                .then(res => res.json())
                .catch(e => console.error(e));

            // this.groupNodesByIds(group);

            this.loading = false;
            // this.triggerDraw();
        },

        clearSvm() {
            // reset hole process (same like reload page/component)
            this.count = 0;
            this.positives = []; // reset
            this.positivesAll = []; // reset
            this.negatives = []; // reset
            this.negativesAll = []; // reset
            // this.groupNodesByIds([]);
        },
        handleMouseOver(n) {
            this.changeActiveNode(n);
        },
    },
};
</script>

<style scoped>
.areas {
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
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    flex-flow: wrap;
    flex-direction: row;
    margin-bottom: 1rem;

    overflow: auto;
}

.activePositiv {
    box-shadow: 0 7px 14px rgba(10, 255, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.2);
}

.activeNegativ {
    box-shadow: 0 7px 14px rgba(255, 0, 66, 0.2), 0 3px 6px rgba(0, 0, 0, 0.2);
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
