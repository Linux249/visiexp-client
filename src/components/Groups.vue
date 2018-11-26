<template>
    <div class="area">
        <div class="title">Save/load groups</div>
        <div v-if="this.savedGroups.length"
             class="group-list">

            <div class="group-item row-between btn"
                 v-for="(group, i) in savedGroups"
                 :key="i"
            >
                <div
                    class="btn"
                    :class="{active: group.groupId === activeGroup}"
                    @click="loadGroup(i)"
                >
                    {{`${group.name }`}}
                </div>
                <router-link class="btn" :to="{ name: 'labels', query: { groupId: group.groupId }}">get N.</router-link>
                <div class="btn" @click="deleteGroup(i)"><trash></trash></div>
            </div>
        </div>
        <div class="row v-center">
            <input class="input" type="text" v-model="groupName"/>
            <div @click="saveGroup" class="btn">save group</div>
        </div>
    </div>

</template>

<script>
import Trash from '../icons/Trash';

export default {
    name: 'Groups',
    props: ['activeGroup', 'selectGroup', 'getStore'],
    components: {
        Trash,
    },
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
            // get the ids of the groupd nodes

            this.savedGroups.push({
                groupId,
                name,
            });
            this.getStore().saveGroup(groupId);
            console.log('saved groups');
            console.log(this.savedGroups);
        },
        loadGroup(i) {
            const { groupId } = this.savedGroups[i];
            this.getStore().loadGroupByGroupId(groupId);
            this.selectGroup(groupId);
        },
        deleteGroup(i) {
            const { groupId } = this.savedGroups[i];
            this.savedGroups.splice(i, 1);
            this.getStore().deleteGroup(groupId);
        },
    },
};
</script>

<style scoped>
.group-item {
    display: flex;
}
</style>
