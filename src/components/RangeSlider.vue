<template>
    <input type="range" min="0" max="1" step="0.01" :value="value" @input="change"/>
</template>

<script>
export default {
    name: 'range-slider',

    props: ['value', 'change', 'input', 'slide'],
};
</script>

<style scoped>
    input[type=range] {
        -webkit-appearance: none;
        width: 85%;
        margin: 6px 0;
    }
    input[type=range]:focus {
        outline: none;
    }
    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 10.9px;
        cursor: pointer;
        box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0px 0px 1.5px rgba(126, 134, 233, 0.5);
        background: #ffffff;
        border-radius: 25px;
        border: 0.6px solid #6772e5;
    }
    input[type=range]::-webkit-slider-thumb {
        box-shadow: 0px 0px 12.3px rgba(103, 114, 229, 0.48), 0px 0px 0px rgba(125, 134, 233, 0.48);
        border: 2.5px solid #ffffff;
        height: 23px;
        width: 23px;
        border-radius: 12px;
        background: #6772e5;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -6.65px;
    }
    input[type=range]:focus::-webkit-slider-runnable-track {
        background: #ffffff;
    }
    input[type=range]::-moz-range-track {
        width: 100%;
        height: 10.9px;
        cursor: pointer;
        box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0px 0px 1.5px rgba(126, 134, 233, 0.5);
        background: #ffffff;
        border-radius: 25px;
        border: 0.6px solid #6772e5;
    }
    input[type=range]::-moz-range-thumb {
        box-shadow: 0px 0px 12.3px rgba(103, 114, 229, 0.48), 0px 0px 0px rgba(125, 134, 233, 0.48);
        border: 2.5px solid #ffffff;
        height: 23px;
        width: 23px;
        border-radius: 12px;
        background: #6772e5;
        cursor: pointer;
    }
    input[type=range]::-ms-track {
        width: 100%;
        height: 10.9px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
    }
    input[type=range]::-ms-fill-lower {
        background: #f0f0f0;
        border: 0.6px solid #6772e5;
        border-radius: 50px;
        box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0px 0px 1.5px rgba(126, 134, 233, 0.5);
    }
    input[type=range]::-ms-fill-upper {
        background: #ffffff;
        border: 0.6px solid #6772e5;
        border-radius: 50px;
        box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0px 0px 1.5px rgba(126, 134, 233, 0.5);
    }
    input[type=range]::-ms-thumb {
        box-shadow: 0px 0px 12.3px rgba(103, 114, 229, 0.48), 0px 0px 0px rgba(125, 134, 233, 0.48);
        border: 2.5px solid #ffffff;
        height: 23px;
        width: 23px;
        border-radius: 12px;
        background: #6772e5;
        cursor: pointer;
        height: 10.9px;
    }
    input[type=range]:focus::-ms-fill-lower {
        background: #ffffff;
    }
    input[type=range]:focus::-ms-fill-upper {
        background: #ffffff;
    }

</style>
