<template>
  <a-row>
    <a-form-model-item
      :label-col="{ span: 9 }"
      :wrapper-col="{ span: 15 }"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <!-- label -->
      <template #label>
        <slot name="label" />
      </template>

      <!-- content -->
      <template #default>
        <slot name="content" />
      </template>
    </a-form-model-item>
  </a-row>
</template>
