<template>
    <div class="area">
        <div class="title">Save/load groups</div>
        <div v-if="this.savedGroups.length"
             class="group-list">

            <div class="group-item row-between area"
                 v-for="(group, i) in savedGroups"
                 :key="i"
                 @click="loadGroup(i)"
            >
                <div class="btn" :class="{active: group.groupId === activeGroupe}">{{`${group.name } (${group.ids.length})`}}</div>
                <router-link class="btn" :to="{ name: 'labels', query: { groupId: group.groupId }}">get N.</router-link>
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
    props: ['groupNodesByGroupId', 'getGroupeIds', 'activeGroupe', 'selectGroupe'],
    data: () => ({
        savedGroups: [],
        groupName: '',
    }),
    methods: {
        saveGroup() {
            // save the actually group
            const groupId = this.savedGroups.length + 1;

            // get the name
            const name = this.groupName || `Group ${groupId}`;
            // get the ids of the grouped nodes
            const ids = this.getGroupeIds();

            this.savedGroups.push({
                groupId,
                ids,
                name,
            });
            console.log('saved groups');
            console.log(this.savedGroups);
        },
        loadGroup(i) {
            const { groupId } = this.savedGroups[i] || [];
            this.groupNodesByGroupId(groupId);
            this.selectGroupe(i + 1);
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
