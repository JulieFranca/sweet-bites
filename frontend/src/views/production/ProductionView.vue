<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Producao" subtitle="Registre suas producoes e controle o estoque" />
    <EmptyState
      title="Em breve"
      description="O modulo de Producao sera implementado na Fase 2. Aqui voce podera registrar producoes, verificar estoque disponivel (dry run) e baixar insumos automaticamente."
    />
  </div>
</template>
