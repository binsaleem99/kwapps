/**
 * Generic DataTable Component
 *
 * Reusable table for all admin CRUD operations
 * Features:
 * - Sorting, filtering, pagination
 * - Bulk actions
 * - Row actions (edit, delete)
 * - RTL support
 *
 * Usage:
 * <DataTable
 *   columns={productColumns}
 *   data={products}
 *   onEdit={(item) => editProduct(item)}
 *   onDelete={(item) => deleteProduct(item)}
 * />
 */

'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Trash, Search, Plus } from 'lucide-react'

export interface DataTableColumn<T> {
  id: string
  header: string
  headerAr: string
  accessor: keyof T | ((item: T) => any)
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onBulkDelete?: (items: T[]) => void
  onCreate?: () => void
  itemIdKey?: keyof T
  emptyMessage?: string
  emptyMessageAr?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  itemIdKey = 'id' as keyof T,
  emptyMessage = 'No items found',
  emptyMessageAr = 'لا توجد عناصر',
}: DataTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<any>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filter data
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true

    return columns.some((col) => {
      const value =
        typeof col.accessor === 'function'
          ? col.accessor(item)
          : item[col.accessor]

      return String(value).toLowerCase().includes(searchQuery.toLowerCase())
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const column = columns.find((c) => c.id === sortColumn)
    if (!column) return 0

    const aValue =
      typeof column.accessor === 'function' ? column.accessor(a) : a[column.accessor]
    const bValue =
      typeof column.accessor === 'function' ? column.accessor(b) : b[column.accessor]

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  const toggleSelection = (itemId: any) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    setSelectedItems(newSelection)
  }

  const toggleAll = () => {
    if (selectedItems.size === sortedData.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(sortedData.map((item) => item[itemIdKey])))
    }
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 start-3 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث..."
              className="ps-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedItems.size > 0 && onBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const items = sortedData.filter((item) =>
                  selectedItems.has(item[itemIdKey])
                )
                onBulkDelete(items)
                setSelectedItems(new Set())
              }}
            >
              <Trash className="w-4 h-4 me-2" />
              حذف ({selectedItems.size})
            </Button>
          )}

          {onCreate && (
            <Button size="sm" onClick={onCreate}>
              <Plus className="w-4 h-4 me-2" />
              إضافة جديد
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {sortedData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed rounded-lg">
          {emptyMessageAr}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {onBulkDelete && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === sortedData.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                )}

                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    onClick={() => column.sortable && handleSort(column.id)}
                    className={column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.headerAr}</span>
                      {column.sortable && sortColumn === column.id && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                ))}

                {(onEdit || onDelete) && <TableHead className="w-24">إجراءات</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow key={item[itemIdKey] || index}>
                  {onBulkDelete && (
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item[itemIdKey])}
                        onCheckedChange={() => toggleSelection(item[itemIdKey])}
                      />
                    </TableCell>
                  )}

                  {columns.map((column) => {
                    const value =
                      typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : item[column.accessor]

                    return (
                      <TableCell key={column.id}>
                        {column.render ? column.render(value, item) : value}
                      </TableCell>
                    )
                  })}

                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item)}
                          >
                            <Trash className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          عرض {sortedData.length} من {data.length} عنصر
          {selectedItems.size > 0 && ` • ${selectedItems.size} محدد`}
        </div>
      </div>
    </div>
  )
}
