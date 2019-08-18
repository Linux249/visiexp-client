<template>
    <div class="area">
        <div class="title">Data set: {{dataset && dataset.name}}</div>
        <div class="loading">
            <div class="loader" v-if="loading"></div>
        </div>
        <div :key="set.id" @click="selectDataset(set.id)" v-for="set in datasets">
            <div class="row v-center">
                <div :class="{ active: selectedDataset === set.id }" class="btn">
                    {{ `${set.name}` }}
                </div>
            </div>
            <div class="description-small">{{ `Size: ${set.size}` }}</div>
            <div class="description">
                {{ set.exists ? set.description : 'Dataset file does not exists' }}
            </div>
        </div>
        <div v-if="!loading">
            <div class="title">No. of images</div>
            <div class="between">
                <range-slider
                    :change="changeImgCount"
                    :max="10000"
                    :min="500"
                    :step="500"
                    :value="imgCount"
                ></range-slider>
                <div class="btn">{{ `${imgCount}#` }}</div>
            </div>
            <div class="flex">
                <div @click="triggerChangeDataset(false)" class="btn">start new</div>
                <div @click="triggerChangeDataset(true)" class="btn">load old</div>
            </div>
            <div class="description-small">You can load your trained features or start with new</div>
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
        selectedImgCount: Number,
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
            imgCount: this.selectedImgCount,
            selectedDataset: this.dataset,
        };
    },
    async mounted() {
        this.loading = true;
        try {
            console.log('load dataset after mounting');
            const res = await fetch(`${apiUrl}/api/v1/dataset/all`);
            if (!res.ok) throw Error(res.statusText);
            this.datasets = await res.json();
        } catch (e) {
            console.error(e);
            this.$notify({
                group: 'default',
                title: 'Error loading all datasets',
                type: 'error',
                text: e.message,
            });
        }
        this.loading = false;
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
        triggerChangeDataset(old) {
            this.error = '';
            this.handleChangeDataset(this.selectedDataset, this.imgCount, old);
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

.loading {
    display: flex;
    justify-content: center;
}
</style>
