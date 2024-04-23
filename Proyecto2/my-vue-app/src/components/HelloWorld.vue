<template>
    <h2 class="info">Nombre: Luis Manuel Chay Marroquín</h2>
    <h2 class="info">Carnet: 202000343</h2>
  <div>
    <div class="terminal">
      <div v-for="(record, index) in records" :key="index" class="record">
        <span class="timestamp">{{ record.inserted }}</span>
        <span class="message">{{ record.message }}</span>
      </div>
    </div>
    <button @click="reloadData" class="reload-button">Recargar datos</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const records = ref([])

const fetchData = async () => {
  try {
    const response = await fetch("https://apinode4-sav6cg7sqa-uc.a.run.app/datos")
    const data = await response.json()

    // Limitar los datos a 20 registros
    const limitedData = data.slice(0, 20)
    records.value = limitedData
  } catch (error) {
    console.error('Error al obtener los datos:', error)
  }
}

onMounted(fetchData)

const reloadData = async () => {
  await fetchData()
}
</script>

<style scoped>
.terminal {
  background-color: black;
  color: white;
  font-family: monospace;
  padding: 20px;
  overflow-y: scroll;
  height: 400px; /* Ajusta la altura según sea necesario */
}

.record {
  margin-bottom: 10px;
}

.timestamp {
  color: gray;
}

.message {
  margin-left: 10px;
}

.reload-button {
  margin-top: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.reload-button:hover {
  background-color: #0056b3;
}
</style>
