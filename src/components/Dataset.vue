<template>
    <div class="area">
        <div class="title">Data sets</div>
        <div v-for="set in datasets" :key="set.id" @click="selectDataset(set.id)">
            <div class="row v-center">
                <div class="btn" :class="{ active: selectedDataset === set.id }">{{ `${set.name}` }}</div>
            </div>
            <div class="description-small">{{ `Size: ${set.size}` }}</div>
            <div class="description">{{ set.exists ? set.description : 'Dataset file does not exists'}}</div>
        </div>
        <div class="title">Amount</div>
        <div class="between">
            <range-slider
                :value="imgCount"
                :change="changeImgCount"
                :step="500"
                :min="500"
                :max="10000"
            ></range-slider>
            <div class="btn">{{`${imgCount}#`}}</div>
        </div>
        <div class="flex">
            <div class="btn" @click="triggerChangeDataset">load Dataset</div>
        </div>
    </div>
</template>

<script>
import { apiUrl } from '../config/apiUrl';
import RangeSlider from './RangeSlider';

export default {
    name: 'Dataset',
    props: {
        dataset: String,
        handleChangeDataset: Function,
        // getStore: Function,
    },
    components: {
        RangeSlider,
    },
    data() {
        return {
            datasets: [],
            loading: false,
            // imgCount: process.env
            imgCount: 500,
            selectedDataset: this.dataset,
        };
    },
    async mounted() {
        try {
            console.log('load dataset after mounting');
            this.loading = true;
            const datasets = await fetch(`${apiUrl}/api/v1/dataset/all`).then(res => res.json());
            console.log({ datasets });
            this.datasets = datasets;
            this.loading = false;
        } catch (e) {
            this.loading = false;
            // TODO bedder error handling!
            console.error(e);
        }
    },
    methods: {
        selectDataset(id) {
            this.selectedDataset = id;
            const { size } = this.datasets.find(e => e.id === this.selectedDataset);
            this.imgCount = size < 500 ? size : 500;
        },
        changeImgCount({ target }) {
            console.log('changeImgCount');
            const { size } = this.datasets.find(e => e.id === this.selectedDataset);
            // console.log(target.value);
            // console.log(size, this.selectedDataset);
            this.imgCount = +target.value <= size ? +target.value : size; // < 500 ? 500 : +target.value;
        },
        triggerChangeDataset() {
            this.error = '';
            this.handleChangeDataset(this.selectedDataset, this.imgCount);
        },
    },
};
</script>

<style scoped>
.description {
    width: auto;
    word-spacing: -1px;
    padding: 0 0.7rem;
    background: #fff;
    font-size: 15px;
    /*font-style: italic;*/
    font-weight: 400;
    letter-spacing: 0.025em;
    transition: all 0.15s ease;
    margin-bottom: 0.3rem;
}
.description-small {
    width: auto;
    word-spacing: -1px;
    padding: 0 0.7rem;
    margin-top: -0.1rem;
    background: #fff;
    font-size: 12px;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0.025em;
    transition: all 0.15s ease;
    margin-bottom: 0.2rem;
}
</style>
