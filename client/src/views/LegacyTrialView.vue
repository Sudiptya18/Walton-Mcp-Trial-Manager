<template>
  <div>
    <!-- Legacy Trial Sheet: unchanged HTML served from /legacy/trial-sheet.html -->
    <iframe
      class="legacy-frame"
      title="WALTON MCP Trial Sheet"
      src="/legacy/trial-sheet.html"
      @load="onLegacyLoad"
    />
  </div>
</template>

<script setup>
import api from '@/services/api';

async function onLegacyLoad() {
  try {
    await api.post('/api/activity', {
      action: 'trial_sheet_opened',
      entityType: 'trial_form',
    });
  } catch {
    /* optional audit */
  }
}
</script>
