import React from 'react'

interface Column {
  key: string
  header: string
  render?: (value: any, row: any) => React.ReactNode
}

interface EmptyState {
  title: string
  description: string
  action?: React.ReactNode
}

interface TableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  onRowClick?: (row: any) => void
  emptyState?: EmptyState
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyState,
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-10 mb-4 rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-12 mb-2 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center"
              >
                {emptyState ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {emptyState.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {emptyState.description}
                    </p>
                    {emptyState.action && (
                      <div className="mt-4">
                        {emptyState.action}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">No data available</span>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table