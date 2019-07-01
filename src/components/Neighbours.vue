<template>
    <div class="area">
        <div class="title">Similars</div>
        <div class="between">
            <range-slider
                :value="neighboursThreshold"
                :change="changeNeighboursThreshold"
            ></range-slider>
            <div class="btn">{{`${neighboursThreshold}#`}}</div>
        </div>
        <div class="row hint"># proposals in next iteration</div>
        <div class="row">
            <div class="btn" @click="getGroupNeighbours" :class="{ active: loading }">Update<repeat></repeat></div>
            <div class="btn" @click="stop" :class="{ active: loading }">Stop<stop></stop></div>
            <!--<div class="btn" @click="resetNeighbours">Reset<trash></trash></div>-->
        </div>
    </div>
</template>

<script>
import RangeSlider from './RangeSlider';
import Repeat from '../icons/Repeat';
import Stop from '../icons/Stop';
import { apiUrl } from '../config/apiUrl';

export default {
    name: 'Neighbours',
    props: ['getStore', 'neighboursThreshold', 'changeNeighboursThreshold', 'activeGroupId', 'stop'],
    components: {
        RangeSlider,
        Repeat,
        Stop,
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
                console.log('getGroupNeighbours')
                console.log(this.$parent.userId)
                this.loading = true;
                const store = this.getStore();
                const body = {
                    group: store.getGroupIdsByGroupId(this.activeGroupId),
                    threshold: this.neighboursThreshold,
                    groupId: this.activeGroupId,
                    userId: this.$parent.userId,
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
.hint {
    font-size: small;
    font-style: italic;
    padding-left: 0.5rem;
    padding-top: -0.5rem;
    margin-bottom: 0.5rem;
}
</style>
