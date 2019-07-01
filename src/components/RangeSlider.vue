<template>
    <input class="" type="range" :min="min" :max="max" :step="step" :value="value" @input="change"/>
</template>

<script>
export default {
    name: 'range-slider',
    props: {
        value: Number,
        change: Function,
        min: {
            type: Number,
            default: 1,
        },
        max: {
            type: Number,
            default: 100,
        },
        step: {
            type: Number,
            default: 1,
        },
    },
};
</script>

<style scoped>
input[type='range'] {
    -webkit-appearance: none;
    width: 85%;
    margin: 6px 6px 0 6px;
    border-bottom: 0;
}
input[type='range']:focus {
    outline: none;
}
input[type='range']::-webkit-slider-runnable-track {
    width: 100%;
    height: 11px;
    cursor: pointer;
    box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0 0 1.5px rgba(126, 134, 233, 0.5);
    background: #ffffff;
    border-radius: 25px;
    border: 0.6px solid #6772e5;
}
input[type='range']::-webkit-slider-thumb {
    box-shadow: 0 0 12.3px rgba(103, 114, 229, 0.48), 0 0 0 rgba(125, 134, 233, 0.48);
    border: 2.5px solid #ffffff;
    height: 23px;
    width: 23px;
    border-radius: 12px;
    background: #6772e5;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -6.65px;
}
input[type='range']:focus::-webkit-slider-runnable-track {
    background: #ffffff;
}
input[type='range']::-moz-range-track {
    width: 100%;
    height: 10.9px;
    cursor: pointer;
    box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0 0 1.5px rgba(126, 134, 233, 0.5);
    background: #ffffff;
    border-radius: 25px;
    border: 0.6px solid #6772e5;
}
input[type='range']::-moz-range-thumb {
    box-shadow: 0 0 12.3px rgba(103, 114, 229, 0.48), 0 0 0 rgba(125, 134, 233, 0.48);
    border: 2.5px solid #ffffff;
    height: 23px;
    width: 23px;
    border-radius: 12px;
    background: #6772e5;
    cursor: pointer;
}
input[type='range']::-ms-track {
    width: 100%;
    height: 10.9px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
}
input[type='range']::-ms-fill-lower {
    background: #f0f0f0;
    border: 0.6px solid #6772e5;
    border-radius: 50;
    box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0 0 1.5px rgba(126, 134, 233, 0.5);
}
input[type='range']::-ms-fill-upper {
    background: #ffffff;
    border: 0.6px solid #6772e5;
    border-radius: 50;
    box-shadow: 1.5px 1.5px 5px rgba(104, 114, 229, 0.5), 0 0 1.5px rgba(126, 134, 233, 0.5);
}
input[type='range']::-ms-thumb {
    box-shadow: 0 0 12.3px rgba(103, 114, 229, 0.48), 0 0 0 rgba(125, 134, 233, 0.48);
    border: 2.5px solid #ffffff;
    height: 23px;
    width: 23px;
    border-radius: 12px;
    background: #6772e5;
    cursor: pointer;
    height: 11px;
}
input[type='range']:focus::-ms-fill-lower {
    background: #ffffff;
}
input[type='range']:focus::-ms-fill-upper {
    background: #ffffff;
}
</style>
