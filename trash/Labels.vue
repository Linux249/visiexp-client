<!--
<template>
    <div class="">
        <div class="area">
            <div class="title">Neighbours</div>
            <div class="btn between">
                {{neighboursThreshold}}
                <range-slider :value="neighboursThreshold" :change="changeNeighboursThreshold"></range-slider>
            </div>
            <div class="row">
                <div class="btn" @click="getGroupNeighbours">Update</div>
                <div class="btn" @click="resetNeighbours">Reset</div>
            </div>
            &lt;!&ndash; <div class="row">
                <div class="btn" @click="resetGroup">reset group</div>
            </div>&ndash;&gt;
        </div>

       &lt;!&ndash; <div class="area">
            <div class="title">Select a Label or add a new one</div>
            <div
                class="btn between "
                v-for="label in labels2"
                :key="label"
                @click="selectLabel(label)"
                :class="{ active: selectedLabel === label }"
            >
                {{label}}
                <div class="btn">
                    <label>
                        <input class="color-box" type="color" />
                    </label>
                </div>
            </div>
            <div class="row v-center">
                <input class="input" type="text" v-model="label2"/>
                <div @click="addLabel" class="btn">new label</div>
            </div>
        </div>&ndash;&gt;
    </div>

</template>

<script>
import RangeSlider from '../components/RangeSlider';

export default {
    name: 'Labels',
    props: ['getStore', 'neighboursThreshold', 'changeNeighboursThreshold'],
    components: {
        RangeSlider,
    },
    data: () => ({
        label2: '',
        labels2: [],
        selectedLabel: '',
        loading: false,
        neighbours: [],
    }),

    watch: {
        nodes(nodes) {
            if (nodes) nodes.forEach(n => this.addNode(n));
        },
    },
    mounted() {
        this.$nextTick(this.getGroupNeighbours);
    },
    methods: {
        /* addLabel() {
            console.log('addLabel clicked');
            console.log(this.label2);
            this.labels2.push(this.label2);
            this.label2 = '';
        },
        selectLabel(id) {
            console.log('selectLabel');
            console.log(id);
            this.selectedLabel = id === this.selectedLabel ? null : id;
        }, */
        async getGroupNeighbours() {
            try {
                this.loading = true;
                const store = this.getStore();
                const body = {
                    group: store.getGroupedNodeIds(),
                    threshold: this.neighboursThreshold,
                };
                const { groupNeighbours, removedGroupNeighbours } = store;
                // add neighbours to body depending on existing neighbours to show init getNeighbours or update
                if (Object.keys(groupNeighbours).length) {
                    body.neighbours = groupNeighbours;
                    if (Object.keys(removedGroupNeighbours).length) {
                        body.removedNeighbours = removedGroupNeighbours;
                    }
                }

                const data = await fetch('http://localhost:3000/api/v1/getGroupNeighbours', {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(body),
                })
                    .then(res => res.json())
                    .catch((e) => {
                        // TODO Errorhandling after loading is implemented
                        // this.loading = false;
                        console.error(e);
                    });
                const { neighbours, group } = data;
                store.updateGroupNeighbours(neighbours);
                // TODO GROUP update groups
                // store.groupNodesByIds(group);
                console.log({ neighbours, group });
                this.loading = false;
            } catch (e) {
                this.loading = false;
                console.error(e);
            }
        },

        resetNeighbours() {
            this.getStore().resetGroupNeighbours();
        },
    },
};
</script>

<style scoped>
</style>
-->
