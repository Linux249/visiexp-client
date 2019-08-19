import Vue from 'vue';
import Router from 'vue-router';
import Explorer from '../components/Explorer';
import Dataset from '../components/Dataset';
import Logout from '../components/Logout';
import Login from '../components/Login';
import {
    DATASET, EXPLORER, LOGIN, LOGOUT,
} from '../util/modes';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/explorer/:setup?',
            name: EXPLORER,
            component: Explorer,
            props: true,
        },
        {
            path: `/${LOGIN}`,
            name: LOGIN,
            component: Login,
            props: true,
        },
        {
            path: `/${LOGOUT}`,
            name: LOGOUT,
            component: Logout,
            props: true,
        },
        {
            path: `/${DATASET}`,
            name: DATASET,
            component: Dataset,
        },
        {
            path: '*',
            redirect: '/login',
        },
    ],
});
