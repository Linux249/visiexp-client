<template>
    <svg
        class="grid-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
</template>

<script>
export default {
    name: 'Grid',
    // props: ['clickHandler', 'active'],
};
</script>

<style scoped>
    /*.grid-icon{
        border: 1px solid transparent;
    }*/
    /*.grid-icon:hover{*/
    /*border: 1px solid grey;*/
    /*}*/
    /*.grid-icon.active{*/
    /*border: 1px solid grey;*/
    /*}*/
</style>
