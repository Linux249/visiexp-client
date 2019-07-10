<template>
    <div class="body">
    <div class="area login">
        <label>
            <div class="title">Username</div>
            <input type="text" v-model="user">
        </label>
        <label>
            <div class="title" >Password</div>
            <input type="password" v-model="password">
        </label>
        <div class="btn margin" @click="login" :class="{ active: loading }">login</div>
        <div v-if="error" class="title" style="color: red">{{error}}</div>
        <div v-if="loading" class="title" style="color: red">Loading...</div>
    </div>
    </div>
</template>

<script>
import { apiUrl } from '../config/apiUrl';

export default {
    name: 'Login',
    props: ['setAuth'],
    data: () => ({
        user: '',
        password: '',
        error: '',
        loading: false,
    }),
    methods: {
        async login() {
            this.loading = true;
            console.log('Login clicked');
            console.log(this.user);
            console.log(this.password);
            // reset error
            this.error = '';
            try {
                const body = {
                    user: this.user,
                    password: this.password,
                };
                const res = await fetch(`${apiUrl}/api/v1/login`, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(body),
                });
                console.log(res);
                if (!res.ok) throw Error(res.statusText);
                const data = await res.json();

                if (res.isAuth) {
                    this.setAuth(res.id);
                    this.$notify({
                        group: 'default',
                        title: 'Login successful',
                        type: 'success',
                    });
                } else {
                    throw Error(data.message);
                }
            } catch (e) {
                this.error = e.message;
                console.log(e);
                console.log(e.message);
                this.$notify({
                    group: 'default',
                    title: 'Error log in',
                    type: 'error',
                    text: e.message,
                });
            }
            this.loading = false;
            if (process.env.NODE_ENV === 'development') this.setAuth(0);
        },
    },
};
</script>

<style scoped>
    .body {
        width: 100%;
        height: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
    }
    .login {
        width: 20rem;
        padding-right: 8px;
        padding-top: 0.5rem;
    }
    input {
        width: 90%;
        margin: 8px;
    }
    .margin {
        width: min-content;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }
</style>
