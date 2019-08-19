<template> </template>

<script>
export default {
    name: 'Logout',
    props: {
        logout: Function,
    },
    mounted() {
        this.logout();
    },
};
</script>

<style scoped></style>
