<template>
    <div class="area">
        <div class="title">Categories</div>
        <div :key="ii" v-for="(category, ii) in labels">
            <div class="option-title">{{ category.name }}</div>
            <div :key="label.name" class="row" v-for="(label, i) in category.labels">
                <div
                    :class="{ active: selectedLabel === label.name }"
                    @click="toogleLabel(label.name, ii)"
                    class="btn"
                >
                    {{ label.name }}
                </div>
                <div class="btn" v-on:click.stop="addLabeledToGroup(label.name)">
                    <grid></grid>
                </div>
                <div
                    :class="{ active: !label.show }"
                    class="btn"
                    v-on:click.stop="toogleShowLabel(i)"
                >
                    <slash></slash>
                </div>
                <div class="btn">
                    <input
                        :style="{
                            backgroundColor: `rgb(${label.color[0]},${label.color[1]},${
                                label.color[2]
                            })`,
                        }"
                        :value="rgbToHex(label.color[0], label.color[1], label.color[2])"
                        class="color-box"
                        type="color"
                        v-on:change.prevent="changeLabelColor(i, $event)"
                    />
                </div>
            </div>
        </div>
        <div class="row wrap">
            <div
                :class="{ active: selectedCategory === i }"
                :key="i"
                @click="selectedCategory = i"
                class="btn"
                v-for="(cat, i) in labels"
            >
                {{ cat.name }}
            </div>
            <div @click="showAddCategory = !showAddCategory" class="btn">
                +
            </div>
        </div>

        <div class="row" v-if="showAddCategory">
            <input type="text" v-model="category" />
            <div @click="addCategory" class="btn">add</div>
        </div>

        <div class="imgArea">
            <div :key="i" class="image" v-for="(n, i) in selectedNodes">
                <img :alt="n.name" :src="n.image.src" @click="removeNode(i)" v-if="n.hasImage" />
            </div>
        </div>

        <div class="row">
            <input @blur="handleBlur" @focus="handleFocus" type="text" v-model="label" />
            <div
                @mouseenter="mouseOver = true"
                @mouseleave="mouseOver = false"
                class="dropdown"
                v-if="showLabelOptions"
            >
                <div
                    :key="label.name"
                    @click="chooseLabel(label.name)"
                    class="item"
                    v-for="label in labelsFiltered"
                >
                    {{ label.name }}
                </div>
            </div>
            <div @click="addLabel" class="btn">
                add
                <hash></hash>
            </div>
            <div @click="clear" class="btn">
                clear
                <x></x>
            </div>
        </div>
        <div @click="update" class="btn">update labels</div>
    </div>
</template>

<script>
import Hash from '../icons/Hash';
import X from '../icons/X';
import Slash from '../icons/Slash';
import Grid from '../icons/Grid';
import { hexToB, hexToG, hexToR, rgbToHex } from '../util/colourConverter';
import { apiUrl } from '../config/apiUrl';

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
            // return if the user clicks button with enter a text
            if (!this.category.length) return;
            const newKey = Object.keys(this.labels).length;
            this.labels[newKey] = { name: this.category, labels: [] };

            this.category = ''; // clear input
            this.showAddCategory = false; // remove input
        },
        addLabel() {
            console.log('addLabel clicked');
            // console.log(this.label);

            // check if label is in list of labels allready?
            if (!this.labels[this.selectedCategory].labels.some(e => e.name === this.label)) {
                this.labels[this.selectedCategory].labels.push({
                    name: this.label,
                    show: true,
                    color: [0, 0, 140],
                });
            }

            // ad label to nodes after checking that is npot allready used at node
            this.selectedNodes.forEach(node => {
                node.labels[this.selectedCategory] = this.label;
            });

            // reset input/label
            this.label = '';

            this.showLabelOptions = false;
            this.getStore().triggerDraw();
        },
        handleFocus() {
            console.log('input focus');
            this.showLabelOptions = true;
        },
        handleBlur() {
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
                userId: this.$parent.userId,
            });
            const data = await fetch(`${apiUrl}/api/v1/updateLabels`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body,
            })
                .then(res => res.text())
                .catch(e => {
                    // TODO Errorhandling after loading is implemented
                    // this.loading = false;
                    console.error(e);
                });
            // console.log(data);
        },
        clear() {
            this.selectedNodes = [];
            this.label = '';
        },

        changeLabelColor(i, e) {
            console.log('changeLabelColor');
            // e.stopPropagation()
            this.labels[this.selectedCategory].labels[i].color[0] = hexToR(e.target.value);
            this.labels[this.selectedCategory].labels[i].color[1] = hexToG(e.target.value);
            this.labels[this.selectedCategory].labels[i].color[2] = hexToB(e.target.value);
            this.getStore().triggerDraw();
        },

        toogleLabel(label, category) {
            this.selectedLabel = this.selectedLabel === label ? null : label;
            this.getStore().selectedLabel = this.selectedLabel;
            this.getStore().selectedCategory = category;
            this.getStore().triggerDraw();
        },
        addLabeledToGroup(label) {
            this.getStore().addLabeledToGroup(label);
        },

        toogleShowLabel(i) {
            this.labels[this.selectedCategory].labels[i].show = !this.labels[this.selectedCategory]
                .labels[i].show;
            this.getStore().triggerDraw();
        },
    },
    computed: {
        labelsFiltered() {
            return this.labels[this.selectedCategory].labels.filter(label =>
                label.name.includes(this.label)
            );
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
