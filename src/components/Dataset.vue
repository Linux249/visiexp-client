<template>
    <div class="flex-center">
        <div class="middle body">
            <div class="">
                <div class="header">1. Select dataset: {{ dataset && dataset.name }}</div>
                <div class="loading">
                    <div class="loader" v-if="loading"></div>
                </div>
                <div class="items">
                    <div
                        class="btn btn-item"
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
                            <div class="description-small">{{ `Dataset size: ${set.size}` }}</div>
                            <div class="description">
                                {{ set.exists ? set.description : 'Dataset file does not exists' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="">
                <div class="header">2. Select subset or load all images</div>

                <div class="row">
                    <range-slider
                        :change="changeImgCount"
                        :max="10000"
                        :min="500"
                        :step="500"
                        :value="imgCount"
                    ></range-slider>
                    <div class="description">{{ `${imgCount}/${maxCount}#` }}</div>
                    <!--                        <div class="btn">all</div>-->
                </div>
            </div>
            <div>
                <div class="header">
                    3. Resume last session or start new one
                </div>
                <div class="flex">
                    <div @click="triggerChangeDataset(false)" class="btn">new</div>
                    <div @click="triggerChangeDataset(true)" class="btn">resume</div>
                    <div class="btn" @click="toggleWasmMode" :class="{ active: wasmMode }">
                        wasm
                    </div>
                </div>
                <div class="description-small">
                    If there is no saved session a new one will be created automatically by clicking "resume"
                </div>
                <!--                    </div>-->
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
        toggleWasmMode: Function,
        wasmMode: Boolean,
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
            maxCount: 0,
            selectedDataset: this.dataset,
            name: '',
        };
    },
    async mounted() {
        this.loading = true;
        try {
            console.log('load dataset after mounting');
            const res = await fetch(`${apiUrl}/api/v1/dataset/all`);
            console.log(res);
            if (!res.ok) {
                this.$notify({
                    group: 'default',
                    title: 'Error loading all datasets',
                    type: 'error',
                    text: res.statusText,
                });
            } else {
                this.datasets = await res.json();
                this.name = this.datasets[0] && this.datasets[0].name;
                this.maxCount = this.datasets[0] && this.datasets[0].size;
            }
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
            const { size, name } = this.datasets.find(e => e.id === this.selectedDataset);
            this.name = name;
            this.maxCount = size;
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
            this.handleChangeDataset(this.selectedDataset, this.name, this.imgCount, old);
        },
    },
};
</script>

<style scoped>
.btn-item {
    padding: 0 8px;
    margin: 0.3rem;
}

.middle {
    width: 1000px;
    max-width: 1000px;
}

.header {
    font-size: 1.3rem;
    font-weight: 600;
    color: #767676;
    padding: 10px 0 4px 8px;
}

.items {
    flex-grow: 1;
    margin: 3px;
    display: flex;
    flex-wrap: wrap;
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
    /*padding: 2px;*/
    font-size: 11px;
    font-style: italic;
    font-weight: 400;
}

.loading {
    display: flex;
    justify-content: center;
}
</style>
