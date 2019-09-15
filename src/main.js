import Vue from 'vue';
import VTooltip from 'v-tooltip';
import Notifications from 'vue-notification';
import VModal from 'vue-js-modal';
import App from './App';
import router from './router';
import './index.css';

Vue.use(Notifications);
Vue.use(VTooltip, { defaultDelay: 500, defaultPlacement: 'bottom' });
Vue.use(VModal, { dialog: true });

Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
    router,
}).$mount('#app');
