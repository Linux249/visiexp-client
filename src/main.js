import Vue from 'vue';
import Notifications from 'vue-notification';
import App from './App';
import router from './router';
import './index.css';

Vue.use(Notifications)

Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
    router,
}).$mount('#app');
