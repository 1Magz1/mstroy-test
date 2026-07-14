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

const gridApi = shallowRef<GridApi<TreeRow> | null>(null)

const rowData = computed(() => props.treeRows)

const getDataPath: GetDataPath<TreeRow> = data => data.path.map(String)

const columnDefs: ColDef<TreeRow>[] = [
  {
    headerName: '№ п/п',
    width: 90,
    pinned: 'left',
    sortable: false,
    filter: false,
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

  :deep(.ag-root-wrapper) {
    border: 1px solid $color-border;
    border-radius: $radius-sm;
  }

  :deep(.ag-header-cell-label) {
    font-weight: 600;
  }

  :deep(.tree-table__row--selected) {
    background-color: $color-bg-selected;
  }
}
</style>
