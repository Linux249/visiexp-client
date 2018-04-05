<template>
    <div id="header">
        <router-link to="/">Home</router-link>
        <router-link to="/TsneMap">TsneMap</router-link>
        <router-link to="/about">About</router-link>
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
        /*height: 50px;*/
        box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
    }

    /*a {
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
*/
    a {
        text-decoration: none;

        display: flex;
        align-items: center;
        height: 40px;

        font-weight: bold;
        padding: 0 1em;
        margin-bottom: 5px;
        color: #767676;
    }

    a:hover {
         color: #484848;
     }

    .router-link-exact-active {
         /*//background-color: paleturquoise;*/
         border-bottom: 5px solid paleturquoise;
         color: #484848;
         margin-bottom: 0;
     }
    /*.router-link-active {
        color: #fff;
        background: #6772e5;
    }
    .router-link-active:hover {
        color: #fff;
        background-color: #7795f8;
    }*/
</style>
