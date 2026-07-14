import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TreeControls from './TreeControls.vue'
import { TreeStore } from '~/shared/lib/TreeStore/TreeStore'
import { mockTreeItems } from '~/shared/mocks/tree-items'
import type { TreeItem } from '~/shared/types/tree'

const TEST_IDS = {
  root: '[data-testid="tree-controls"]',
  path: '[data-testid="tree-controls-path"]',
  idInput: '[data-testid="tree-controls-id-input"]',
  labelInput: '[data-testid="tree-controls-label-input"]',
  parentSelect: '[data-testid="tree-controls-parent-select"]',
  addButton: '[data-testid="tree-controls-add-button"]',
  updateButton: '[data-testid="tree-controls-update-button"]',
  removeButton: '[data-testid="tree-controls-remove-button"]',
} as const

function createProps(selectedId: TreeItem['id'] | null = null) {
  const items = structuredClone(mockTreeItems)
  const store = new TreeStore(items)

  return {
    store,
    items,
    selectedId,
  }
}

describe('TreeControls', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      randomUUID: () => '00000000-0000-0000-0000-000000000001',
    })
  })

  it('shows placeholder when nothing is selected', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(null),
    })

    expect(wrapper.get(TEST_IDS.path).text()).toContain('Элемент не выбран')
  })

  it('shows root label for root element', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(1),
    })

    expect(wrapper.get(TEST_IDS.path).text()).toContain('Корневой элемент')
  })

  it('shows parent path for nested element', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(7),
    })

    expect(wrapper.get(TEST_IDS.path).text()).toContain('Айтем 7 → Айтем 4 → Айтем 2 → Айтем 1')
  })

  it('fills form when item is selected', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(7),
    })

    const idInput = wrapper.get(TEST_IDS.idInput)
    const labelInput = wrapper.get(TEST_IDS.labelInput)

    expect((idInput.element as HTMLInputElement).value).toBe('7')
    expect((labelInput.element as HTMLInputElement).value).toBe('Айтем 7')
  })

  it('emits add event', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(1),
    })

    await wrapper.get(TEST_IDS.labelInput).setValue('Новый элемент')
    await wrapper.get(TEST_IDS.addButton).trigger('click')

    expect(wrapper.emitted('add')?.[0]?.[0]).toMatchObject({
      id: 'item-00000000',
      parent: 1,
      label: 'Новый элемент',
    })
  })

  it('emits update event for selected item', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(3),
    })

    await wrapper.get(TEST_IDS.labelInput).setValue('Изменённый')
    await wrapper.get(TEST_IDS.updateButton).trigger('click')

    expect(wrapper.emitted('update')?.[0]?.[0]).toEqual({
      id: 3,
      parent: 1,
      label: 'Изменённый',
    })
  })

  it('emits remove event for selected item', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(3),
    })

    await wrapper.get(TEST_IDS.removeButton).trigger('click')

    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe(3)
  })

  it('disables save and remove buttons without selection', async () => {
    const wrapper = await mountSuspended(TreeControls, {
      props: createProps(null),
    })

    const saveButton = wrapper.get(TEST_IDS.updateButton)
    const removeButton = wrapper.get(TEST_IDS.removeButton)

    expect(saveButton.attributes('disabled')).toBeDefined()
    expect(removeButton.attributes('disabled')).toBeDefined()
  })
})
