<template>
    <div>
        <canvas  ref="canvas" id="canvas" width="1600" height="800"></canvas>
    </div>
</template>

<script>
import logo from '../assets/logo.png';

export default {
    name: 'TsneMap',
    data() {
        return {
            exampleContent: 'This is TEXT',
        };
    },
    methods: {
        updateCanvas: () => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.font = '20px Georgia';
            ctx.fillText(this.exampleContent, 10, 50);

            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                ctx.beginPath();
                ctx.moveTo(30, 96);
                ctx.lineTo(70, 66);
                ctx.lineTo(103, 76);
                ctx.lineTo(170, 15);
                ctx.stroke();
            };
            img.src = logo;
        },
    },
    watch: {
        exampleContent(val, oldVal) {
            this.updateCanvas();
        },
    },
    mounted() {
        this.updateCanvas();
    },
};
</script>

<style scoped>

</style>
