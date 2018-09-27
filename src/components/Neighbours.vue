<template>
    <div>
        <div class="btn" @click="getGroupNeighbours">Update Neighbours</div>
        {{groupNeighboursThreshold}}<range-slider :value="groupNeighboursThreshold" :change="changeNeighboursThreshold"></range-slider>

    </div>
</template>

<script>
import RangeSlider from './RangeSlider';

export default {
    name: 'Neighbours',
    props: ['getStore', 'groupNeighboursThreshold', 'changeNeighboursThreshold'],
    components: {
        RangeSlider,
    },
    data: () => ({
        loading: false,
        neighbours: [],
    }),
    mounted() {
        this.getStore().triggerDraw()
    },
    methods: {
        async getGroupNeighbours() {
            try {
                this.loading = true;
                const store = this.getStore()
                const body = {
                    group: store.getGroupeIds(),
                };
                const groupNeighbours = store.groupNeighbours
                // add neighbours to body depending on existing neighbours to show init getNeighbours or update
                if (Object.keys(groupNeighbours).length) body.neighbours = [];
                Object.keys(groupNeighbours).forEach(key => body.neighbours.push(key))

                const data = await fetch('/api/v1/getGroupNeighbours', {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(body),
                }).then(res => res.json()).catch((e) => {
                    // TODO Errorhandling after loading is implemented
                    // this.loading = false;
                    console.error(e);
                });
                const { neighbours, group } = data;
                store.updateGroupNeighbours(neighbours);
                console.log({ neighbours, group });
                this.loading = false;
            } catch (e) {
                this.loading = false;
                console.error(e);
            }
        },
    },
};
</script>

<style scoped>

</style>
