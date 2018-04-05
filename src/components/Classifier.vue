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
            <input type="text" value="" onchange="" />
            <div @click="addLabel" class="btn">add label</div>

        </div>
    </div>
</template>

<script>
export default {
    name: 'classifier',
    props: ['nodes'],
    methods: {
        removeNode(i) {
            console.log(`remove node ${i} clicked`);
            console.log(this.nodes);
            this.nodes.splice(i, 1);
        },
        addLabel(e) {
            console.log('addLabel clicked');
            console.log(e);
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
</style>
