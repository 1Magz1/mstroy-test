<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { AllEnterpriseModule, ModuleRegistry } from 'ag-grid-enterprise'
import type {
  ColDef,
  GetDataPath,
  GridReadyEvent,
  ValueGetterParams,
} from 'ag-grid-community'

import type { TreeItem, TreeRow } from '../../shared/types/tree'
import { buildTreeRows, hasChildren } from '../../shared/utils/tree-path'

ModuleRegistry.registerModules([AllEnterpriseModule])

const props = defineProps<{
  items: TreeItem[]
}>()

const rowData = computed(() => buildTreeRows(props.items))

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
  valueGetter: (params: ValueGetterParams<TreeRow>) => {
    const id = params.data?.id

    if (id == null) {
      return ''
    }

    return hasChildren(props.items, id) ? 'Группа' : 'Элемент'
  },
  cellRendererParams: {
    suppressCount: true,
  },
}))

const defaultColDef: ColDef<TreeRow> = {
  resizable: true,
}

function onGridReady(event: GridReadyEvent<TreeRow>) {
  event.api.expandAll()
}
</script>

<template>
  <div class="tree-table ag-theme-quartz">
    <AgGridVue
      :row-data="rowData"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :auto-group-column-def="autoGroupColumnDef"
      :tree-data="true"
      :get-data-path="getDataPath"
      :group-default-expanded="-1"
      :animate-rows="false"
      dom-layout="autoHeight"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<style scoped>
.tree-table {
  width: 100%;
}

.tree-table :deep(.ag-root-wrapper) {
  border: 1px solid #d7dce3;
  border-radius: 4px;
}

.tree-table :deep(.ag-header-cell-label) {
  font-weight: 600;
}
</style>
