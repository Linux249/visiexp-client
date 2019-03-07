<template>
    <div class="area">
        <div class="title">Similars</div>
        <div class="btn between">
            {{neighboursThreshold}}
            <range-slider
                :value="neighboursThreshold"
                :change="changeNeighboursThreshold"
            ></range-slider>
        </div>
        <div class="row">
            <div class="btn" @click="getGroupNeighbours">Update<repeat></repeat></div>
            <div class="btn" @click="resetNeighbours">Reset<trash></trash></div>
        </div>
    </div>
</template>

<script>
import RangeSlider from './RangeSlider';
import Repeat from '../icons/Repeat';
import Trash from '../icons/Trash';
import { apiUrl } from '../config/apiUrl';

export default {
    name: 'Neighbours',
    props: ['getStore', 'neighboursThreshold', 'changeNeighboursThreshold', 'activeGroupId'],
    components: {
        RangeSlider,
        Repeat,
        Trash,
    },
    data: () => ({
        loading: false,
        neighbours: [],
    }),
    mounted() {
        this.$nextTick(this.getGroupNeighbours);
    },
    beforeDestroy() {
        this.resetNeighbours();
    },
    methods: {
        async getGroupNeighbours() {
            try {
                this.loading = true;
                const store = this.getStore();
                const body = {
                    group: store.getGroupIdsByGroupId(this.activeGroupId),
                    threshold: this.neighboursThreshold,
                    groupId: this.activeGroupId,
                };
                const { groupNeighbours, removedGroupNeighbours } = store;
                // add neighbours to body depending on existing
                // neighbours to show init getNeighbours or update
                if (Object.keys(groupNeighbours).length) {
                    body.removedNeighbours = removedGroupNeighbours;
                    body.neighbours = groupNeighbours;
                }

                const data = await fetch(`${apiUrl}/api/v1/getGroupNeighbours`, {
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
                store.addNodesToActiveGroup(group);
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
