<script setup>
import PortfolioManager from './components/PortfolioManager.vue';
</script>

<template>
  <PortfolioManager />
  <StockList />

</template>
<script>
import StockList from './components/StockList.vue';

export default {
  name: 'App',
  components: {
    StockList
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

