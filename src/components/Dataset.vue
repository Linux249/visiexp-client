<template>
    <div class="flex-center">
        <div class="middle body">
            <div class="title">Data set: {{ dataset && dataset.name }}</div>
            <div class="loading">
                <div class="loader" v-if="loading"></div>
            </div>
            <div class="flex" v-if="!loading">
                <div class="item area">
                    <div
                        class="btn"
                        :class="{ active: selectedDataset === set.id }"
                        :key="set.id"
                        @click="selectDataset(set.id)"
                        v-for="set in datasets"
                    >
                        <div>
                            <div class="row v-center">
                                <div class="title-dataset">
                                    {{ `${set.name}` }}
                                </div>
                            </div>
                            <div class="description-small">{{ `Size: ${set.size}` }}</div>
                            <div class="description">
                                {{ set.exists ? set.description : 'Dataset file does not exists' }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="area">

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
                        <div class="description-small">
                            You can load your trained features or start with new
                        </div>
                </div>
                    </div>
            </div>
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
.middle {
    /*display: flex;*/
    /*justify-content: center;*/
    /*flex-flow: column;*/
    /*align-self: center;*/
    width: 1000px;
    max-width: 1000px;

}


.item {
    flex-grow: 1;
    margin: 3px;
    /*padding: 2px;*/
}

.title-dataset {
    margin-top: 0.7rem;
    font-weight: 800;
}

.description {
    margin-bottom: 0.3rem;
    font-weight: 400;
}

.description-small {
    padding: 2px;
    font-size: 11px;
    font-style: italic;
    font-weight: 400;
}

.loading {
    display: flex;
    justify-content: center;
}
</style>
