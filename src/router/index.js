import Vue from 'vue';
import Router from 'vue-router';
import Welcome from '@/components/Welcome';
import TsneMap from '@/components/TsneMap';
import Coins from '@/components/Coins';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Welcome',
            component: Welcome,
        }, {
            path: '/TsneMap',
            name: 'TsneMap',
            component: TsneMap,
        }, {
            path: '/coins/:id',
            name: 'Coins',
            component: Coins,
        },
    ],
});
