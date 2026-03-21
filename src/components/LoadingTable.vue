<template>
    <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr class="text-center">
                        <th v-for="(header, index) in headers" :key="index">
                            {{ header }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="text-center">
                        <td :colspan="headers.length" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <div v-if="loadingText" class="mt-2 text-muted small">
                                {{ loadingText }}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
defineProps({
    headers: {
        type: Array,
        required: true
    },
    loadingText: {
        type: String,
        default: ''
    }
})
</script>