<template>
    <div class="classifier">
        <div class="imgArea">
            <div class="image" v-for="(n, i) in selectedNodes" :key="i">
                <img
                    :src="n.icon.src"
                    alt=""
                    @click="removeNode(i)"
                >
            </div>
        </div>
        <div class="row">
            <input type="text" v-model="label" @focus="handleFocus" @blur="handleBlur"/>
            <div v-if="showLabels" class="dropdown" >
                <div class="item" v-for="label in labelsFiltered" :key="label" @click="chooseLabel(label)">{{label}}</div>
            </div>
            <div @click="addLabel" class="btn">add label</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'classifier',
    props: ['nodes', 'node', 'labels'],
    data: () => ({
        label: '',
        showLabels: false,
        selectedNodes: [],
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
            if (n && this.selectedNodes.indexOf(n) === -1) this.selectedNodes.push(n)
        },
        removeNode(i) {
            this.selectedNodes.splice(i, 1);
        },
        addLabel({ target }) {
            console.log('addLabel clicked');
            console.log(this.label);

            // check if label is in list of labels allready?
            if (this.labels.indexOf(this.label) === -1) this.labels.push(this.label);

            // ad label to nodes after checking that is npot allready used at node
            this.selectedNodes.forEach((node) => {
                if (node.labels.indexOf(this.label) === -1) node.labels.push(this.label);
            });

            // reset input/label
            this.label = '';

            this.showLabels = false;
        },
        handleFocus(e) {
            console.log('input focus');
            this.showLabels = true;
        },
        handleBlur(e) {
            console.log('input blur');
            // this.focus = false
        },
        chooseLabel(label) {
            this.label = label;
            this.showLabels = false;
        },
    },
    computed: {
        labelsFiltered() {
            return this.labels.filter(label => label.includes(this.label));
        },
    },
};
</script>

<style scoped>
    .classifier {
        width: 100%;
        /*height: 5rem;*/

        /*border: 1px solid red;*/

    }

    .row {
        display: flex;
        position: relative;
    }

    .imgArea {
        /*height: 10rem;*/
        /*border: 1px solid rgba(0, 255, 10, 0.5);*/
        /*border-radius: 15px;*/
        /*background-color: rgba(0, 255, 10, 0.1);*/
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
        width: 4rem;
        height: 4rem;
        display: flex;
        justify-content: center;
        align-content: center;
        /*border: 1px solid red;*/

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
