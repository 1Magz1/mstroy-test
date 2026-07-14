<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise'
import type {
  ColDef,
  GetDataPath,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  ValueGetterParams,
} from 'ag-grid-community'

import type { TreeStore } from '~/shared/lib/TreeStore'
import type { TreeItem, TreeItemId, TreeRow } from '~/shared/types/tree'

ModuleRegistry.registerModules([AllEnterpriseModule])

const props = defineProps<{
  store: TreeStore<TreeItem>
  treeRows: TreeRow[]
  selectedId?: TreeItemId | null
}>()

const emit = defineEmits<{
  select: [id: TreeItemId | null]
}>()

const rowHeight = 48

const gridApi = shallowRef<GridApi<TreeRow> | null>(null)

const rowData = computed(() => props.treeRows)

const getDataPath: GetDataPath<TreeRow> = data => data.path.map(String)

const columnDefs: ColDef<TreeRow>[] = [
  {
    headerName: '№ п/п',
    width: 72,
    pinned: 'left',
    sortable: false,
    filter: false,
    cellStyle: { textAlign: 'center' },
    cellClass: 'tree-table__index-cell',
    headerClass: 'tree-table__index-header',
    valueGetter: (params: ValueGetterParams<TreeRow>) => {
      if (params.node?.rowIndex == null) {
        return ''
      }

      return params.node.rowIndex + 1
    },
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
    sortable: false,
    filter: false,
  },
]

const autoGroupColumnDef = computed<ColDef<TreeRow>>(() => ({
  headerName: 'Категория',
  minWidth: 220,
  suppressHeaderMenuButton: true,
  suppressHeaderFilterButton: true,
  valueGetter: (params: ValueGetterParams<TreeRow>) => {
    const id = params.data?.id

    if (id == null) {
      return ''
    }

    return props.store.getChildren(id).length > 0 ? 'Группа' : 'Элемент'
  },
  cellRendererParams: {
    suppressCount: true,
  },
}))

const defaultColDef: ColDef<TreeRow> = {
  resizable: true,
  sortable: false,
  filter: false,
  suppressHeaderMenuButton: true,
  suppressHeaderFilterButton: true,
}

const rowClassRules = {
  'tree-table__row--selected': (params: { data?: TreeRow }) =>
    params.data?.id === props.selectedId,
  'tree-table__row--group': (params: { data?: TreeRow }) => {
    const id = params.data?.id

    return id != null && props.store.getChildren(id).length > 0
  },
}

function refreshGrid() {
  if (!gridApi.value) {
    return
  }

  gridApi.value.setGridOption('rowData', rowData.value)
  gridApi.value.refreshClientSideRowModel('group')
  gridApi.value.expandAll()
  gridApi.value.redrawRows()
}

function onGridReady(event: GridReadyEvent<TreeRow>) {
  gridApi.value = event.api
  refreshGrid()
}

function onRowClicked(event: RowClickedEvent<TreeRow>) {
  emit('select', event.data?.id ?? null)
}

watch(
  rowData,
  () => {
    nextTick(refreshGrid)
  },
  { deep: true },
)

watch(
  () => props.selectedId,
  () => {
    gridApi.value?.redrawRows()
  },
)
</script>

<template>
  <div class="tree-table ag-theme-quartz">
    <AgGridVue
      :row-data="rowData"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :auto-group-column-def="autoGroupColumnDef"
      :row-class-rules="rowClassRules"
      :tree-data="true"
      :get-data-path="getDataPath"
      :group-default-expanded="-1"
      :row-height="rowHeight"
      :header-height="rowHeight"
      :animate-rows="false"
      dom-layout="autoHeight"
      @grid-ready="onGridReady"
      @row-clicked="onRowClicked"
    />
  </div>
</template>

<style scoped lang="scss">
.tree-table {
  width: 100%;

  &.ag-theme-quartz {
    --ag-border-color: #{$color-border};
    --ag-header-background-color: #{$color-bg-header};
    --ag-background-color: #{$color-bg-page};
    --ag-odd-row-background-color: #{$color-bg-page};
    --ag-row-hover-color: #{$color-bg-hover};
    --ag-font-family: #{$font-family};
    --ag-font-size: 14px;
    --ag-row-height: #{$table-row-height};
    --ag-header-height: #{$table-header-height};
  }

  :deep(.ag-root-wrapper) {
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    overflow: hidden;
  }

  :deep(.ag-header) {
    border-bottom: 1px solid $color-border;
  }

  :deep(.ag-header-cell) {
    font-weight: 600;
    border-right: 1px solid $color-border;

    &:last-child {
      border-right: none;
    }
  }

  :deep(.ag-header-cell-label) {
    font-weight: 600;
  }

  :deep(.ag-row) {
    border-bottom: 1px solid $color-border;
  }

  :deep(.ag-cell) {
    border-right: none;
    display: flex;
    align-items: center;
  }

  :deep(.ag-pinned-left-header .ag-header-cell),
  :deep(.ag-pinned-left-cols-container .ag-cell),
  :deep(.ag-cell-last-left-pinned) {
    border-right: none !important;
  }

  :deep(.ag-pinned-left-border),
  :deep(.ag-pinned-left-header),
  :deep(.ag-pinned-left-cols-container) {
    box-shadow: none;
    border-right: none;
  }

  :deep(.tree-table__index-header .ag-header-cell-label) {
    justify-content: center;
    width: 100%;
  }

  :deep(.tree-table__index-cell) {
    font-weight: 600;
  }

  :deep(.tree-table__row--group .ag-cell:not(.tree-table__index-cell)) {
    font-weight: 600;
  }

  :deep(.tree-table__row--selected) {
    background-color: $color-bg-selected;
  }
}
</style>
