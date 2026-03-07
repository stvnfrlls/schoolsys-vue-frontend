<template>
  <div>
    <div class="row g-3 mb-4">
      <div
        class="col-sm-6 col-lg-3"
        v-for="card in statCards"
        :key="card.label">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small mb-1">{{ card.label }}</div>
            <div class="fs-4 fw-bold">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-semibold mb-1">Welcome back, {{ auth.user?.name }}</h6>
        <p class="text-muted small mb-0">
          This is your admin dashboard. More features coming soon.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const statCards = [
  { label: "Total Students", value: "—" },
  { label: "Total Teachers", value: "—" },
  { label: "Sections", value: "—" },
  { label: "Subjects", value: "—" },
];
</script>
