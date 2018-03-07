<template>
  <div>
    <p>Name: {{ coin.name }}</p>
    <p>Symbol: {{ coin.symbol }}</p>
    <p>Price (USD): {{ coin.price_usd }}</p>
  </div>
</template>
<script>


export default {
    name: 'Coins',

    data() {
        return {
            coin: {},
        };
    },

    created() {
        this.fetchData();
    },

    watch: {
        $route: 'fetchData',
    },

    methods: {
        fetchData() {
            fetch(`https://api.coinmarketcap.com/v1/ticker/${this.$route.params.id}/`)
                .then((resp) => {
                    this.coin = resp.data[0];
                    console.log(resp);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
    },
};
</script>

<style scoped>

</style>
