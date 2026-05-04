<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Relatorios" subtitle="Analise custos, producao e rentabilidade" />
    <EmptyState
      title="Em breve"
      description="O modulo de Relatorios sera implementado na Fase 3. Aqui voce podera gerar relatorios de custo, rentabilidade, evolucao de precos e exportar dados em CSV/JSON."
    />
  </div>
</template>
