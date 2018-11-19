<template>
    <div class="area">
        <div class="btn" @click="calcChartData">calc</div>
        <trend
            :data="drawData"
            :gradient="['#6fa8dc', '#42b983', '#2c3e50']"
            auto-draw
        >
        </trend>
        {{maxDrawTime()}}
        <trend
            :data="hitMapData"
            :gradient="['#6fa8dc', '#42b983', '#2c3e50']"
            auto-draw
        >
        </trend>
        {{maxHitMapTime()}}
    </div>
</template>

<script>
import Vue from 'vue';
import Trend from 'vuetrend';

Vue.use(Trend);
export default {
    name: 'Logs',
    props: ['getStore'],
    data: () => ({
        drawData: [],
        hitMapData: [],
    }),
    computed: {

    },
    methods: {
        calcChartData() {
            const store = this.getStore();
            this.drawData = store.perfLogs.draw;
            // this.maxDrawTime = store.maxDrawTime;
            this.hitMapData = store.perfLogs.hitmap;
            // this.maxHitMapTime = store.maxHitMapTime;
        },
        maxDrawTime() {
            const store = this.getStore();
            // console.warn('inside compute');
            // console.warn(store);
            return store ? store.maxDrawTime : 0;
        },
        maxHitMapTime() {
            const store = this.getStore();
            return store ? store.maxHitMapTime : 0;
        },
    },
};
</script>

<style scoped>
</style>
