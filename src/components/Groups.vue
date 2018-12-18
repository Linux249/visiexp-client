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
                    @click="selectGroup(i)"
                >
                    {{`${group.name }`}}
                </div>
                <div
                    class="btn"
                    :class="{active: neighbourMode && group.groupId === activeGroup}"
                    @click="handleNeighbourMode(i)"
                >
                    neighbours
                </div>
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
    props: ['activeGroup', 'setActiveGroup', 'getStore', 'toggleNeighbourMode', 'neighbourMode'],
    components: {
        Trash,
    },
    data: () => ({
        savedGroups: [],
        groupName: '',
        groupCounter: 1, // 0 is no group
    }),
    methods: {
        saveGroup() {
            // save the actually group
            this.groupCounter += 1;
            const groupId = this.groupCounter;

            // get the name
            const name = this.groupName || `Group ${groupId}`;
            // get the ids of the groupd nodes

            this.savedGroups.push({
                groupId,
                name,
            });
            this.getStore().saveGroup(groupId);
            // console.log('saved groups');
            // console.log(this.savedGroups);
        },

        selectGroup(i) {
            const { groupId } = this.savedGroups[i];
            if (groupId === this.activeGroup) {
                console.log('unselect');
                this.setActiveGroup(null);
                this.getStore().clearGroup();
            } else {
                console.log('select');
                this.getStore().loadGroupByGroupId(groupId);
                this.setActiveGroup(groupId);
            }
        },

        deleteGroup(i) {
            const { groupId } = this.savedGroups[i];
            this.savedGroups.splice(i, 1);
            this.getStore().deleteGroup(groupId);
        },

        handleNeighbourMode(i) {
            // set groupt to active if not allready set
            const { groupId } = this.savedGroups[i];
            if (groupId !== this.activeGroup) this.selectGroup(i);

            // switch to neighbourmode
            this.toggleNeighbourMode();
            this.setActiveGroup(groupId);
        },
    },
};
</script>

<style scoped>
.group-item {
    display: flex;
}
</style>
