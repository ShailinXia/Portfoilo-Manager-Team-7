<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const message = ref("");

onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/hello");
    message.value = res.data.message;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
</script>

<template>
  <h1>Vue + Node.js Fullstack App</h1>
  <p>Backend says: {{ message }}</p>
</template>