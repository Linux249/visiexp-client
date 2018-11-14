<template>
    <svg
        class="map-icon"
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
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
</template>

<script>
export default {
    name: 'Map',
    // props: ['clickHandler', 'active'],
};
</script>

<style scoped>
/*.map-icon{
        border: 1px solid transparent;
    }*/
/*.map-icon:hover{*/
/*border: 1px solid grey;*/
/*}*/
/*.map-icon.active{*/
/*border: 1px solid grey;*/
/*}*/
</style>
