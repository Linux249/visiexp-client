import Vue from 'vue';
import Router from 'vue-router';
import Welcome from '@/components/Welcome';
import Svm from '@/components/Svm';
import Classifier from '../components/Classifier';
import Dataset from '../components/Dataset';
import Neighbours from '../components/Neighbours';
import { TRIPLETS, TSNE, SVM, CLASSIFIER, NEIGHBOURS, DATASET } from '../util/modes';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Welcome',
            component: Welcome,
        }, {
            path: `/${CLASSIFIER}`,
            name: CLASSIFIER,
            component: Classifier,
            props: true,
        }, {
            path: `/${SVM}`,
            name: SVM,
            component: Svm,
            props: true,
        }, {
            path: `/${NEIGHBOURS}`,
            name: NEIGHBOURS,
            component: Neighbours,
        }, {
            path: `/${DATASET}`,
            name: DATASET,
            component: Dataset,
        },
    ],
});
