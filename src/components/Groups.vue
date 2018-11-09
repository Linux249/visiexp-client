<template>
    <div class="area">
        <div class="title">Save/load groups</div>
        <div v-if="this.savedGroups.length"
             class="group-list">

            <div class="group-item row"
                 v-for="(group, i) in savedGroups"
                 :key="i"
            >
                <div class="btn" @click="loadGroup(i)">{{`${group.name } (${group.ids.length})`}}</div>
                <div class="btn" @click="loadGroup(i)">get N.</div>
                <div class="btn" @click="deleteGroup(i)">X</div>
            </div>
        </div>
        <div class="row v-center">
            <input class="input" type="text" v-model="groupName"/>
            <div @click="saveGroup" class="btn">save group</div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'Groups',
    props: ['groupNodesByIds', 'getGroupeIds'],
    data: () => ({
        savedGroups: [],
        groupName: '',
    }),
    methods: {
        saveGroup() {
            // save the actually group

            // get the name
            const name = this.groupName || `Group ${this.savedGroups.length}`;
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
