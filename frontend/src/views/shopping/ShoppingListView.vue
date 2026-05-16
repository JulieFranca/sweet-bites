<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Lista de Compras" subtitle="Gerencie suas listas de compras em tempo real" />
    <EmptyState
      title="Em breve"
      description="O modulo de Lista de Compras sera implementado na Fase 2. Aqui voce podera criar listas de compras, marcar itens e sincronizar em tempo real."
    />
  </div>
</template>
