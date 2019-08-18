import Vue from 'vue';
import Router from 'vue-router';
// import Svm from '@/components/Svm';
import Explorer from '../components/Explorer';
import Classifier from '../components/Classifier';
import Dataset from '../components/Dataset';
// import Neighbours from '../components/Neighbours';
// import Labels from '../components/Labels';
import {
    CLASSIFIER, DATASET, EXPLORER, LOGIN, LOGOUT
} from '../util/modes';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: `/explorer/:setup?`,
            name: EXPLORER,
            component: Explorer,
            props: true,
        },
        {
            path: `/${CLASSIFIER}`,
            name: CLASSIFIER,
            component: Explorer,
            props: true,
        },
        // {
        //     path: `/${SVM}`,
        //     name: SVM,
        //     component: Svm,
        //     props: true,
        // },
        // {
        //     path: `/${NEIGHBOURS}`,
        //     name: NEIGHBOURS,
        //     component: Neighbours,
        // },
        {
            path: `/${DATASET}`,
            name: DATASET,
            component: Dataset,
        },
        // {
        //     path: `/${LABELS}`,
        //     name: LABELS,
        //     component: Labels,
        // },
    ],
});
