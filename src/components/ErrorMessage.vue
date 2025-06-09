<template>
  <div class="bg-red-100 text-red-700 px-4 py-2 rounded-md border border-red-300 text-sm">
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>
