<template>
    <div>
    <div class="btn" @click="saveGroup">save group</div>

    <div v-if="this.savedGroups.length"
         class="group-list">

        <div class="group-item row"
             v-for="(group, i) in savedGroups"
             :key="i"
        >
            <div class="btn" @click="loadGroup(i)">{{`${group.name } (${group.ids.length})`}}</div>
            <div class="btn" @click="loadGroup(i)">load</div>
            <div class="btn" @click="deleteGroup(i)">delete</div>
        </div>
    </div>
    </div>

</template>

<script>
export default {
    name: 'Groups',
    props: ['groupNodesByIds', 'getGroupeIds'],
    data: () => ({
        savedGroups: [],
    }),
    methods: {
        saveGroup() {
            // save the actually group

            // get the name
            const name = `Group ${this.savedGroups.length}`;
            // get the ids of the grouped nodes
            const ids = this.getGroupeIds();


            this.savedGroups.push({
                ids,
                name,
            });
            console.log('saved groups');
            console.log(this.savedGroups);
        },
        loadGroup(i) {
            const { ids } = this.savedGroups[i] || [];
            this.groupNodesByIds(ids);
        },
        deleteGroup(i) {
            this.savedGroups.splice(i, 1);
        },

    },
};
</script>

<style scoped>

    .group-item {
        display: flex;
    }
</style>
