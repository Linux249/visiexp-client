<template>
    <div>
        <div>SELECT A DATASET</div>
        <div
            class="areas"
            v-for="set in datasets"
            :key="set.id"
            @click="handleChangeDataset(set.id)"
        >
            <div class="btn"  :class="{active: dataset === set.id}">{{set.name}}</div>
            <div class="description">#{{set.count}}</div>
            <div class="description">{{set.description}}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Dataset',
    props: ['dataset', 'handleChangeDataset'],
    data: () => ({
        datasets: [],
        loading: false,
    }),
    async mounted() {
        try {
            this.loading = true;
            const datasets = await fetch('/api/v1/dataset/all').then(res => res.json());
            console.log(datasets);
            this.datasets = datasets;
            this.loading = false;
        } catch (e) {
            this.loading = false;
            console.error(e);
        }
    },
};
</script>

<style scoped>
    .areas {
        min-height: 4rem;
        max-height: 15rem;
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
        margin-bottom: 1rem;
        overflow: auto;
    }

    .description {
        padding: 2px 14px;
        background: #fff;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: .025em;
        transition: all .15s ease;
    }
</style>
