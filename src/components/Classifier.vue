<template>
    <div class="classifier">
        <div class="imgArea">
            <div class="image" v-for="(n, i) in nodes">
                <img
                    :key="i"
                    :src="n.icon.src"
                    alt=""
                    @click="removeNode(i)"
                >
            </div>
        </div>
        <div class="row">
            <input type="text" v-model="label" @focus="handleFocus" @blur="handleBlur"/>
            <div v-if="showLabels" class="dropdown" >
                <div class="item" v-for="label in labelsFiltered" :key="label" @click="chooseLabel(label)">{{label}}}</div>
            </div>
            <div @click="addLabel" class="btn">add label</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'classifier',
    props: ['nodes'],
    data: () => ({
        label: '',
        showLabels: false,
        labels: ['test1', 'test2']
    }),
    methods: {
        removeNode(i) {
            console.log(`remove node ${i} clicked`);
            console.log(this.nodes);
            this.nodes.splice(i, 1);
        },
        addLabel(e) {
            console.log('addLabel clicked');
            console.log(e);
            console.log(this.label)

            // TODO add label to choosen pictures if they not have this label allready
            // TODO add label to a global list of labels witch will be generated while reciving nodes from backend
            this.showLabels = false
        },
        handleFocus(e) {
            console.log("input focus")
            this.showLabels = true
        },
        handleBlur(e) {
            console.log("input blur")
            //this.focus = false
        },
        chooseLabel(label) {
            this.label = label
            this.showLabels = false
        },
    },
    computed: {
        labelsFiltered: function() {
            return this.labels.filter(label => label.includes(this.label))
        }
    }
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

        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
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
