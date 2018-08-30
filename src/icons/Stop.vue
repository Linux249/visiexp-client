<template>
    <svg
        @click="clickHandler"
        :class="{ active }"
        class="stop-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <rect x="4" y="4" width="16" height="16"></rect>
    </svg>
</template>

<script>
export default {
    name: 'Stop',
    props: ['clickHandler', 'active'],
};
</script>

<style scoped>
    /*.stop-icon:hover{
        border: 1px solid transparent;
    }
    .stop-icon:hover{
        border: 1px solid grey;
    }
    .stop-icon.active{
        border: 1px solid grey;
    }*/
</style>
