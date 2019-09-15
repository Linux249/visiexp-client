<template>
    <div class="area neighbours">
        <div class="row-between">
            <div class="title">Proposals</div>
            <div :class="{ active: loading }" @click="stop" class="btn">
                <x></x>
            </div>
        </div>
        <div class="between">
            <range-slider
                :change="changeNeighboursThreshold"
                :value="neighboursThreshold"
            ></range-slider>
            <div class="btn dummy">{{ `${neighboursThreshold}#` }}</div>
        </div>
        <div class="row hint"># proposals in next iteration</div>
        <div class="row">
            <div :class="{ active: loading }" @click="getGroupNeighbours" class="btn">
                Update proposals
                <repeat v-if="!loading"></repeat>
                <div class="loader" v-if="loading"></div>
            </div>
        </div>
    </div>
</template>

<script>
import RangeSlider from './RangeSlider';
import Repeat from '../icons/Repeat';
import X from '../icons/X';
import { apiUrl } from '../config/apiUrl';

export default {
    name: 'Neighbours',
    props: [
        'getStore',
        'neighboursThreshold',
        'changeNeighboursThreshold',
        'activeGroupId',
        'stop',
    ],
    components: {
        RangeSlider,
        Repeat,
        X,
    },
    data: () => ({
        loading: false,
    }),
    mounted() {
        this.$nextTick(this.getGroupNeighbours);
    },
    beforeDestroy() {
        this.resetNeighbours();
    },
    methods: {
        async getGroupNeighbours() {
            if (this.loading) {
                return this.$notify({
                    group: 'default',
                    title: 'Cannot load proposals',
                    type: 'error',
                    text: 'wait until finish loading',
                });
            }
            try {
                console.log('getGroupNeighbours');
                console.log(this.$parent.userId);
                this.loading = true;
                const store = this.getStore();
                store.resetScaleTranslate();

                const body = {
                    positives: store.getNodeIdsByGroupId(this.activeGroupId),
                    threshold: this.neighboursThreshold,
                    groupId: this.activeGroupId,
                    userId: this.$parent.userId,
                };

                // both objects are empty on init
                if (
                    Object.keys(store.proposals).length
                    || Object.keys(store.removedProposals).length
                ) {
                    body.negatives = Object.keys(store.proposals).map(key => +key);
                }

                const res = await fetch(`${apiUrl}/api/v1/getGroupNeighbours`, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (!res.ok) throw Error(res.statusText);
                const { neighbours, group } = await res.json();
                store.updateGroupProposals(neighbours);
                store.addNodesToActiveGroup(group);
                console.log({ neighbours, group });
                this.loading = false;
            } catch (e) {
                this.loading = false;
                console.error(e);
                this.$notify({
                    group: 'default',
                    title: 'Error loading proposals',
                    type: 'error',
                    text: e.message,
                });
            }
            return null;
        },

        resetNeighbours() {
            this.getStore().resetGroupNeighbours();
        },
    },
};
</script>

<style scoped>
.neighbours {
    margin: 0.5rem;
}

.hint {
    font-size: small;
    font-style: italic;
    padding-left: 0.5rem;
    padding-top: -0.5rem;
    margin-bottom: 0.5rem;
}
</style>
