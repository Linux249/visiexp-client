<template>
    <div class="classifier">
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
                    :key="label"
                    @click="chooseLabel(label)"
                >{{label}}</div>
            </div>
            <div @click="addLabel" class="btn">add</div>
            <div @click="clear" class="btn">clear</div>
        </div>
        <div @click="update" class="btn">update labels</div>
    </div>
</template>

<script>
export default {
    name: 'classifier',
    props: ['nodes', 'node', 'labels', 'triggerDraw', 'getStore'],
    data: () => ({
        label: '',
        showLabelOptions: false,
        selectedNodes: [],
        mouseOver: false,
        selectedCategory: '0',
        showAddCategory: false,
        category: '',

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
            if (this.labels[this.selectedCategory].labels.indexOf(this.label) === -1) this.labels[this.selectedCategory].labels.push(this.label);

            // ad label to nodes after checking that is npot allready used at node
            this.selectedNodes.forEach((node) => {
                node.labels[this.selectedCategory] = this.label;
            });

            // reset input/label
            this.label = '';

            this.showLabelOptions = false;
            this.triggerDraw();
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
            console.log("update")
            const nodes = this.getStore().getNodes()

            const body = JSON.stringify({
                nodes,
            });
            const data = await fetch('/api/v1/updateLabels', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body,
            }).then(res => res.text()).catch((e) => {
                // TODO Errorhandling after loading is implemented
                //this.loading = false;
                console.error(e);
            });

            console.log(data);
        },
        clear() {
            this.selectedNodes = [];
        },
    },
    computed: {
        labelsFiltered() {
            return this.labels[this.selectedCategory].labels.filter(label => label.includes(this.label));
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

        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
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

        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
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
