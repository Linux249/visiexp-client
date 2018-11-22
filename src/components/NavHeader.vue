<template>
    <div class="header">
        <div class="left-header">
            <router-link to="/tsne">t-SNE</router-link>
            <router-link to="/svm">SVM</router-link>
            <router-link to="/classifier">Classifier</router-link>
            <!--<router-link to="/triplets">Triplets</router-link>
            <router-link to="/neighbours">Neighbours</router-link>
            <router-link to="/labels">Labels</router-link>-->
        </div>
        <div class="right-header">
            <router-link to="/Dataset">Dataset</router-link>
            <router-link to="/modes">modes</router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NavHeader',
};
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    /*height: 50px;*/
    box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
}

.left-header,
.right-header {
    display: flex;
    align-items: center;
}

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
</style>
