<template>
    <div id="header">
        <router-link :to="{ name: 'Welcome' }">Home</router-link>
        <router-link to="/TsneMap">TsneMap</router-link>
        <router-link to="/coins/ethereum">Ethereum</router-link>
        <router-link to="/coins/bitcoin">Bitcoin</router-link>
    </div>
</template>

<script>
export default {
    name: 'NavHeader',
};
</script>

<style scoped>
    #header {
        display: flex;
        align-items: center;
        height: 50px;
        box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
    }

    a {
        text-decoration: none;
        margin: 10px;
        height: 40px;
        line-height: 40px;
        padding: 0 14px;
        box-shadow: 0 4px 6px rgba(50, 50, 93, .11), 0 1px 3px rgba(0, 0, 0, .08);
        background: #fff;
        color: #6772e5;
        border-radius: 4px;
        font-size: 15px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .025em;
        transition: all .15s ease;
        cursor: pointer;
    }

    a:hover {
        transform: translateY(-1px);
        box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
    }

    .router-link-active {
        color: #fff;
        background: #6772e5;
    }
    .router-link-active:hover {
        color: #fff;
        background-color: #7795f8;
    }
</style>
