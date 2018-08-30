<template>
    <svg
        @click="clickHandler"
        :class="{ active }"
        class="send-icon"
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
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
</template>

<script>
export default {
    name: 'Send',
    props: ['clickHandler', 'active'],
};
</script>

<style scoped>
    /*.send-icon:hover{
        border: 1px solid grey;
    }
    .send-icon:hover{
        border: 1px solid transparent;
    }
    .send-icon.active{
        border: 1px solid grey;
    }*/
</style>
