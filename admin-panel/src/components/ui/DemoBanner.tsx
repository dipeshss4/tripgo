import React from 'react'
import { useDemoMode } from '../../hooks/useDemoMode'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

const DemoBanner: React.FC = () => {
  const { isDemoMode, disableDemoMode } = useDemoMode()

  if (!isDemoMode()) {
    return null
  }

  return (
    <div className="bg-warning-100 border-l-4 border-warning-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-warning-700">
            <strong>Demo Mode Active:</strong> You are viewing the admin panel with sample data.
            No real changes will be made to any database.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={disableDemoMode}
              className="inline-flex rounded-md bg-warning-100 p-1.5 text-warning-500 hover:bg-warning-200 focus:outline-none focus:ring-2 focus:ring-warning-600 focus:ring-offset-2 focus:ring-offset-warning-100"
              title="Exit Demo Mode"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoBanner