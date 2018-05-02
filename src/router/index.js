import Vue from 'vue';
import Router from 'vue-router';
import Welcome from '@/components/Welcome';
import Svm from '@/components/Svm';
import Classifier from '../components/Classifier';
import { TRIBLETS, TSNE, SVM, CLASSIFIER, NEIGHBOURS } from '../util/modes';

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
        },
    ],
});
