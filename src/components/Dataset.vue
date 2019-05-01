<template>
    <div class="area">
        <div class="title">Data sets</div>
        <div v-for="set in datasets" :key="set.id" @click="handleChangeDataset(set.id)">
            <div class="row v-center">
                <div class="btn" :class="{ active: dataset === set.id }">{{ set.name }}</div>
                <div class="description">#{{ set.count }}</div>
            </div>
            <div class="description">{{ set.exists ? set.description : 'Dataset file does not exists'}}</div>
        </div>
    </div>
</template>

<script>
import { apiUrl } from '../config/apiUrl';

export default {
    name: 'Dataset',
    props: ['dataset', 'handleChangeDataset', 'getStore'],
    data: () => ({
        datasets: [],
        loading: false,
    }),
    async mounted() {
        try {
            this.loading = true;
            console.time('500 pics');
            const store = this.getStore();
            const datasets = await fetch(`${apiUrl}/api/v1/dataset/all`).then(res => res.json());


            // res.json()
            /*

                const oReq = new XMLHttpRequest();
                oReq.open('GET', `${apiUrl}/api/v1/dataset/001`, true);
                oReq.responseType = 'arraybuffer';
                oReq.onprogress = (e) => {
                    console.log(e);
                    console.log(e.target.response);
                    console.log(e.target.response.byteLength);
                };

                oReq.onloades = function (oEvent) {
                    const buffer = new Uint8Array(oReq.response); // Note: not oReq.responseText
                    console.log(buffer);
                    const nodes2 = {};

                    let len;
                    for (let n = 0; n < 5; n += 1) {
                        nodes2[n] = {};
                        const pics = {};
                        for (let s = 10; s <= 150; s += 10) {
                            console.log(buffer[w], buffer[h]);
                            pics[s] = {};
                            pics[s].w = buffer[w];
                            pics[s].h = buffer[h];
                            console.log(pics);
                            len = buffer[w] * buffer[h] * 4;
                            pics[s].data = buffer.slice(w + 1, w + 1 + len);

                            store.nodes[n].imageData[s / 10] = new ImageData(
                                new Uint8ClampedArray(pics[s].data),
                                pics[s].w,
                                pics[s].h,
                            );


                            w += 2 + len; //
                            h += 2 + len;

                            nodes2[n].pics = pics;
                        }
                        store.triggerDraw();
                        // console.log(pics);
                    }
                    console.timeEnd('500 pics');

                    console.log(nodes2);
                    if (false) {
                        const byteArray = new Uint8Array(buffer);
                        console.log(byteArray);
                        for (let i = 0; i < byteArray.byteLength; i++) {
                            // do something with each byte in the array
                        }
                    }
                };

                oReq.send(null); */

            console.log(datasets);
            this.datasets = datasets;
            this.loading = false;
        } catch (e) {
            this.loading = false;
            // TODO bedder error handling!
            console.error(e);
        }
    },
};
</script>

<style scoped>
.areas {
    min-height: 4rem;
    max-height: 15rem;
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    margin-bottom: 1rem;
    //overflow: auto;
}

.description {
    width: auto;
    word-spacing: -1px;
    padding: 0 0.7rem;
    background: #fff;
    font-size: 15px;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0.025em;
    transition: all 0.15s ease;
    margin-bottom: 0.5rem;
}
</style>
