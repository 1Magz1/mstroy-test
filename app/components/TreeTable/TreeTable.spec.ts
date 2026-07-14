import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TreeTable from './TreeTable.vue'
import { TreeStore } from '~/shared/lib/TreeStore/TreeStore'
import { mockTreeItems } from '~/shared/mocks/tree-items'

vi.mock('ag-grid-vue3', () => ({
  AgGridVue: {
    name: 'AgGridVue',
    props: {
      rowData: Array,
      columnDefs: Array,
      defaultColDef: Object,
      autoGroupColumnDef: Object,
      treeData: Boolean,
    },
    template: '<div data-testid="ag-grid" />',
  },
}))

vi.mock('ag-grid-enterprise', () => ({
  AllEnterpriseModule: {},
  ModuleRegistry: {
    registerModules: vi.fn(),
  },
}))

describe('TreeTable', () => {
  it('renders ag-grid with tree rows', async () => {
    const items = structuredClone(mockTreeItems)
    const store = new TreeStore(items)
    const treeRows = store.getTreeRows()

    const wrapper = await mountSuspended(TreeTable, {
      props: {
        store,
        treeRows,
        selectedId: null,
      },
    })

    expect(wrapper.find('[data-testid="ag-grid"]').exists()).toBe(true)
  })

  it('passes row data to ag-grid', async () => {
    const items = structuredClone(mockTreeItems)
    const store = new TreeStore(items)
    const treeRows = store.getTreeRows()

    const wrapper = await mountSuspended(TreeTable, {
      props: {
        store,
        treeRows,
        selectedId: 7,
      },
    })

    const grid = wrapper.findComponent({ name: 'AgGridVue' })

    expect(grid.props('rowData')).toHaveLength(8)
    expect(grid.props('treeData')).toBe(true)
  })
})
