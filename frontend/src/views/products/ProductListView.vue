<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Produtos" subtitle="Gerencie seus produtos e precos de venda" />
    <EmptyState
      title="Em breve"
      description="O modulo de Produtos sera implementado na Fase 2. Aqui voce podera vincular receitas a embalagens, definir margens de lucro e calcular precos de venda automaticamente."
    />
  </div>
</template>
