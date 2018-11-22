<template>
    <div class="area">
        <div class="title">categories</div>
        <div
            v-for="(category, i) in labels"
            :key="i"
        >
            <div class="option-title">{{ category.name }}</div>
            <div class="row" v-for="(label, i) in category.labels">
                <div
                    class="btn"
                    :class="{ active: selectedLabel === label.name }"
                    @click="toogleLabel(label.name)"
                    :key="label.name"
                >
                    {{label.name}}
                </div>
                <div
                    v-on:click.stop="addLabeledToGroup(label.name)"
                    class="btn"
                >
                    <grid></grid>
                </div>
                <div
                    v-on:click.stop="toogleShowLabel(i)"
                    class="btn"
                    :class="{ active: !label.show }"
                >
                    <slash></slash>
                </div>
                <div
                    class="btn"
                >
                    <input
                        class="color-box"
                        type="color"
                        v-on:change.prevent="changeLabelColor(i, $event)"
                        :value="rgbToHex(label.color[0], label.color[1], label.color[2])"
                        :style="{backgroundColor: `rgb(${label.color[0]},${label.color[1]},${label.color[2]})`}"
                    />
                </div>
            </div>
    </div>
        <div class="row wrap">
            <div
                class="btn"
                v-for="(cat, i) in labels"
                :key="i"
                :class="{active: selectedCategory === i}"
                @click="selectedCategory = i"
            >
                {{cat.name}}
            </div>
            <div class="btn" @click="showAddCategory = !showAddCategory">
                +
            </div>
        </div>

        <div class="row" v-if="showAddCategory">
            <input type="text" v-model="category"/>
            <div @click="addCategory" class="btn">add</div>
        </div>

        <div class="imgArea">
            <div class="image" v-for="(n, i) in selectedNodes" :key="i">
                <img
                    :src="n.icon"
                    alt=""
                    @click="removeNode(i)"
                >
            </div>
        </div>

        <div class="row">
            <input type="text" v-model="label" @focus="handleFocus" @blur="handleBlur"/>
            <div v-if="showLabelOptions" class="dropdown" @mouseenter="mouseOver = true" @mouseleave="mouseOver = false">
                <div
                    class="item"
                    v-for="label in labelsFiltered"
                    :key="label.name"
                    @click="chooseLabel(label.name)"
                >{{label.name}}</div>
            </div>
            <div @click="addLabel" class="btn">add<hash></hash></div>
            <div @click="clear" class="btn">clear<x></x></div>
        </div>
        <div @click="update" class="btn">update labels</div>
    </div>
</template>

<script>
import Hash from '../icons/Hash';
import X from '../icons/X';
import Slash from '../icons/Slash';
import Grid from '../icons/Grid';

function toHex(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return '00';
    n = Math.max(0, Math.min(n, 255));
    return '0123456789ABCDEF'.charAt((n - (n % 16)) / 16) + '0123456789ABCDEF'.charAt(n % 16);
}

function rgbToHex(R, G, B) {
    return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

function cutHex(h) {
    return h.charAt(0) === '#' ? h.substring(1, 7) : h;
}
function hexToR(h) {
    return parseInt(cutHex(h).substring(0, 2), 16);
}
function hexToG(h) {
    return parseInt(cutHex(h).substring(2, 4), 16);
}
function hexToB(h) {
    return parseInt(cutHex(h).substring(4, 6), 16);
}

export default {
    name: 'classifier',
    props: ['nodes', 'node', 'labels', 'getStore'],
    components: {
        Hash,
        X,
        Slash,
        Grid,
    },
    data: () => ({
        label: '',
        showLabelOptions: false,
        selectedNodes: [],
        mouseOver: false,
        selectedCategory: '0',
        selectedLabel: '0',
        showAddCategory: false,
        category: '',
        rgbToHex,
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
            if (n && this.selectedNodes.indexOf(n) === -1) this.selectedNodes.push(n);
        },
        removeNode(i) {
            this.selectedNodes.splice(i, 1);
        },
        addCategory() {
            console.log('addLabel clicked');
            console.log(this.category);
            const newKey = Object.keys(this.labels).length;
            this.labels[newKey] = { name: this.category, labels: [] };

            this.category = ''; // clear input
            this.showAddCategory = false; // remove input
        },
        addLabel() {
            console.log('addLabel clicked');
            console.log(this.label);

            // check if label is in list of labels allready?
            if (!this.labels[this.selectedCategory].labels.some(e => e.name === this.label)) this.labels[this.selectedCategory].labels.push({ name: this.label, show: true });

            // ad label to nodes after checking that is npot allready used at node
            this.selectedNodes.forEach((node) => {
                node.labels[this.selectedCategory] = this.label;
            });

            // reset input/label
            this.label = '';

            this.showLabelOptions = false;
            this.getStore().triggerDraw();
        },
        handleFocus(e) {
            console.log('input focus');
            this.showLabelOptions = true;
        },
        handleBlur(e) {
            console.log('input blur');
            if (!this.mouseOver) this.showLabelOptions = false;
        },
        chooseLabel(label) {
            console.log('chooselabel');
            this.label = label;
            this.showLabelOptions = false;
        },
        async update() {
            console.log('update');
            const nodes = this.getStore().getNodes();

            const body = JSON.stringify({
                nodes,
            });
            const data = await fetch('/api/v1/updateLabels', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body,
            })
                .then(res => res.text())
                .catch((e) => {
                    // TODO Errorhandling after loading is implemented
                    // this.loading = false;
                    console.error(e);
                });

            console.log(data);
        },
        clear() {
            this.selectedNodes = [];
        },

        changeLabelColor(i, e) {
            console.log('changeLabelColor');
            // e.stopPropagation()
            this.labels[this.selectedCategory].labels[i].color[0] = hexToR(e.target.value);
            this.labels[this.selectedCategory].labels[i].color[1] = hexToG(e.target.value);
            this.labels[this.selectedCategory].labels[i].color[2] = hexToB(e.target.value);
            this.store.triggerDraw();
        },
        toogleShowCategory(i) {
            this.labels[i].show = !this.labels[i].show;
            this.labels[i].labels.forEach(label => (label.show = this.labels[i].show));
            this.store.triggerDraw();
        },
        toogleCategory(cat) {
            if (this.selectedCategory === cat) this.selectedCategory = null;
            else this.selectedCategory = cat;
            this.store.selectedCategory = this.selectedCategory;
            this.store.triggerDraw();
        },

        toogleLabel(label) {
            if (this.selectedLabel === label) this.selectedLabel = null;
            else this.selectedLabel = label;
            this.store.selectedLabel = this.selectedLabel;
            this.store.triggerDraw();
        },
        addLabeledToGroup(label) {
            this.store.addLabeledToGroup(label);
        },

        toogleShowLabel(i) {
            this.labels[this.selectedCategory].labels[i].show = !this.labels[this.selectedCategory]
                .labels[i].show;
            this.store.triggerDraw();
        },
    },
    computed: {
        labelsFiltered() {
            return this.labels[this.selectedCategory].labels.filter(label => label.name.includes(this.label));
        },
    },
};
</script>

<style scoped>
.classifier {
    width: 100%;
}

.row {
    display: flex;
    position: relative;
}

.imgArea {
    min-height: 4rem;
    max-height: 15rem;
    overflow: auto;

    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    /*justify-content: center;*/
    align-items: center;
    flex-flow: wrap;
    flex-direction: row;
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

.dropdown {
    display: block;
    position: absolute;
    left: 0;
    width: auto;

    background-color: #fff;
    border: 1px solid #c6c6c6;
    border-radius: 3px;

    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
    top: 100%;
    z-index: 1;
}

.item {
    padding: 3px;
}

.item:hover {
    background-color: #5cb9ff;
}
</style>
