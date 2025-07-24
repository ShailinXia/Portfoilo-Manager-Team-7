<script setup>
import PortfolioManager from '/Users/shailinxia/Projects/Presentation/Portfoilo-Manager-Team-7/frontend/src/components/PortfolioManager.vue'; // Adjust the path as necessary
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

