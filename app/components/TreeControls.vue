<script setup lang="ts">
import type { TreeStore } from '~/shared/lib/TreeStore'
import type { TreeItem, TreeItemId } from '~/shared/types/tree'

const props = defineProps<{
  store: TreeStore<TreeItem>
  items: TreeItem[]
  selectedId: TreeItemId | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  add: [item: TreeItem]
  update: [item: TreeItem]
  remove: [id: TreeItemId]
}>()

const form = reactive({
  id: '' as string,
  label: '',
  parent: null as TreeItemId | null,
})

const parentOptions = computed(() =>
  props.items.filter(item => item.id !== props.selectedId),
)

const parentPath = computed(() => {
  if (props.selectedId == null) {
    return []
  }

  const _ = props.items.length
  return props.store.getAllParents(props.selectedId)
})

const parentPathLabel = computed(() => {
  if (props.selectedId == null) {
    return 'Элемент не выбран'
  }

  if (parentPath.value.length === 1 && parentPath.value[0]?.parent === null) {
    return 'Корневой элемент'
  }

  return parentPath.value.map(parent => parent.label).join(' → ')
})

watch(
  () => props.selectedId,
  (selectedId) => {
    if (selectedId == null) {
      resetForm()
      return
    }

    const selected = props.items.find(item => item.id === selectedId)

    if (!selected) {
      resetForm()
      return
    }

    form.id = String(selected.id)
    form.label = selected.label
    form.parent = selected.parent
  },
  { immediate: true },
)

function resetForm() {
  form.id = ''
  form.label = ''
  form.parent = null
}

function createId(): TreeItemId {
  return `item-${crypto.randomUUID().slice(0, 8)}`
}

function parseId(value: string): TreeItemId {
  if (value.trim() === '') {
    return createId()
  }

  const asNumber = Number(value)

  if (!Number.isNaN(asNumber) && String(asNumber) === value.trim()) {
    return asNumber
  }

  return value.trim()
}

function onAdd() {
  const parent = props.selectedId ?? form.parent

  emit('add', {
    id: createId(),
    parent,
    label: form.label.trim() || 'Новый элемент',
  })
}

function onUpdate() {
  if (props.selectedId == null) {
    return
  }

  emit('update', {
    id: parseId(form.id),
    parent: form.parent,
    label: form.label.trim() || 'Без названия',
  })
}

function onRemove() {
  if (props.selectedId == null) {
    return
  }

  emit('remove', props.selectedId)
}
</script>

<template>
  <section class="controls">
    <div class="controls__header">
      <h2 class="controls__title">
        Управление данными
      </h2>
      <p class="controls__hint">
        Выберите строку в таблице или заполните форму для добавления элемента.
      </p>
      <p class="controls__path">
        <span class="controls__path-label">Путь к корню:</span>
        {{ parentPathLabel }}
      </p>
    </div>

    <div class="controls__form">
      <label class="controls__field">
        <span>ID</span>
        <input
          v-model="form.id"
          type="text"
          placeholder="Авто при добавлении"
          :disabled="disabled || selectedId == null"
        >
      </label>

      <label class="controls__field">
        <span>Наименование</span>
        <input
          v-model="form.label"
          type="text"
          placeholder="Айтем"
          :disabled="disabled"
        >
      </label>

      <label class="controls__field">
        <span>Родитель</span>
        <select v-model="form.parent" :disabled="disabled">
          <option :value="null">
            Корень
          </option>
          <option
            v-for="item in parentOptions"
            :key="String(item.id)"
            :value="item.id"
          >
            {{ item.label }} ({{ item.id }})
          </option>
        </select>
      </label>
    </div>

    <div class="controls__actions">
      <button
        type="button"
        class="controls__button controls__button--primary"
        :disabled="disabled"
        @click="onAdd"
      >
        Добавить
      </button>

      <button
        type="button"
        class="controls__button"
        :disabled="disabled || selectedId == null"
        @click="onUpdate"
      >
        Сохранить
      </button>

      <button
        type="button"
        class="controls__button controls__button--danger"
        :disabled="disabled || selectedId == null"
        @click="onRemove"
      >
        Удалить
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.controls {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-bg-panel;

  &__header {
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
  }

  &__hint {
    margin: 0;
    font-size: 13px;
    color: $color-text-muted;
  }

  &__path {
    margin: 8px 0 0;
    font-size: 13px;
    color: $color-text;

    &-label {
      font-weight: 600;
    }
  }

  &__form {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: $color-text-muted;

    input,
    select {
      padding: 8px 10px;
      border: 1px solid $color-border-input;
      border-radius: $radius-md;
      font: inherit;
      color: $color-text;
      background: $color-bg-page;

      &:disabled {
        background: $color-bg-input-disabled;
        color: $color-text-disabled;
      }
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__button {
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid $color-border-input;
    border-radius: $radius-md;
    font: inherit;
    color: $color-text;
    background: $color-bg-page;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: $color-bg-hover;
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &--primary {
      border-color: $color-primary;
      background: $color-primary;
      color: #fff;

      &:hover:not(:disabled) {
        background: $color-primary-hover;
      }
    }

    &--danger {
      border-color: $color-danger;
      color: $color-danger;

      &:hover:not(:disabled) {
        background: $color-bg-danger-hover;
      }
    }
  }
}
</style>
