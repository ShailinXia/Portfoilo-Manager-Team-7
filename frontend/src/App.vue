<script setup>
import PortfolioManager from './components/PortfolioManager.vue';
</script>

<template>
  <PortfolioManager />
  <StockList />
  <!-- <StockHistory /> -->

</template>
<script>
import StockList from './components/StockList.vue';
// import StockHistory from './components/StockHistory.vue';

export default {
  name: 'App',
  components: {
    StockList,
    // StockHistory,
  }
};
</script>
<style>
body {
  margin: 0;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>

