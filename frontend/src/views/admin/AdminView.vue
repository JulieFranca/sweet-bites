<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Administracao" subtitle="Gerencie usuarios e configuracoes do sistema" />
    <EmptyState
      title="Em breve"
      description="O painel administrativo sera implementado em breve. Aqui voce podera aprovar usuarios, gerenciar a tabela de conversoes e configurar o sistema."
    />
  </div>
</template>
