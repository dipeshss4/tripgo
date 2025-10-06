import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminSystemService, isDemoMode } from '../services'
import { Tab } from '@headlessui/react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  CogIcon,
  ServerIcon,
  DocumentArrowUpIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [editingSetting, setEditingSetting] = useState<any>(null)
  const [newSettingValue, setNewSettingValue] = useState('')
  const queryClient = useQueryClient()

  const tabs = [
    { name: 'Site Settings', icon: CogIcon },
    { name: 'Tenants', icon: ServerIcon },
    { name: 'Media Library', icon: FolderIcon },
    { name: 'System Logs', icon: ClipboardDocumentListIcon },
    { name: 'Backups', icon: DocumentArrowUpIcon },
  ]

  // Queries
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      if (isDemoMode()) return []
      return await adminSystemService.settings.getAll()
    },
    enabled: activeTab === 0,
  })

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['system-tenants'],
    queryFn: async () => {
      if (isDemoMode()) return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      return await adminSystemService.tenants.getAll({ page: 1, limit: 50 })
    },
    enabled: activeTab === 1,
  })

  const { data: mediaFiles, isLoading: mediaLoading } = useQuery({
    queryKey: ['system-media'],
    queryFn: async () => {
      if (isDemoMode()) return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      return await adminSystemService.media.getAll({ page: 1, limit: 50 })
    },
    enabled: activeTab === 2,
  })

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      if (isDemoMode()) return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      return await adminSystemService.logs.getAll({ page: 1, limit: 100 })
    },
    enabled: activeTab === 3,
  })

  const { data: backups, isLoading: backupsLoading } = useQuery({
    queryKey: ['system-backups'],
    queryFn: async () => {
      if (isDemoMode()) return []
      return await adminSystemService.backup.getHistory()
    },
    enabled: activeTab === 4,
  })

  // Mutations
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminSystemService.settings.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      setEditingSetting(null)
      setNewSettingValue('')
      toast.success('Setting updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update setting')
    },
  })

  const createBackupMutation = useMutation({
    mutationFn: () => adminSystemService.backup.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-backups'] })
      toast.success('Backup created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create backup')
    },
  })

  const deleteMediaMutation = useMutation({
    mutationFn: (id: string) => adminSystemService.media.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-media'] })
      toast.success('Media file deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete media file')
    },
  })

  const handleUpdateSetting = (setting: any) => {
    if (!newSettingValue.trim()) return
    updateSettingMutation.mutate({ key: setting.key, value: newSettingValue })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await adminSystemService.media.upload(file)
      queryClient.invalidateQueries({ queryKey: ['system-media'] })
      toast.success('File uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file')
    }
  }

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Site Configuration</h3>
          <p className="text-sm text-gray-500">Manage global site settings and configuration</p>
        </div>
        <div className="p-6">
          {settingsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(settings) ? settings : settings?.raw || [])?.map((setting: any) => (
                <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{setting.key}</p>
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {editingSetting?.id === setting.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newSettingValue}
                          onChange={(e) => setNewSettingValue(e.target.value)}
                          className="input text-sm"
                          placeholder="New value"
                        />
                        <button
                          onClick={() => handleUpdateSetting(setting)}
                          className="btn btn-primary btn-sm"
                          disabled={updateSettingMutation.isPending}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingSetting(null)
                            setNewSettingValue('')
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-gray-600 max-w-xs truncate">
                          {setting.value}
                        </span>
                        <button
                          onClick={() => {
                            setEditingSetting(setting)
                            setNewSettingValue(setting.value)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderTenantsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tenant Management</h3>
          <p className="text-sm text-gray-500">Manage all tenants and their configurations</p>
        </div>
        <div className="overflow-x-auto">
          {tenantsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(tenants?.tenants || tenants?.items || [])?.map((tenant: any) => (
                  <tr key={tenant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.subdomain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-primary">{tenant.plan}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge ${
                          tenant.status === 'ACTIVE' ? 'badge-success' :
                          tenant.status === 'TRIAL' ? 'badge-warning' : 'badge-danger'
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  const renderMediaTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Media Library</h3>
            <p className="text-sm text-gray-500">Manage uploaded files and media assets</p>
          </div>
          <div>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
              multiple
            />
            <label
              htmlFor="media-upload"
              className="btn btn-primary flex items-center gap-2 cursor-pointer"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              Upload Files
            </label>
          </div>
        </div>
        <div className="p-6">
          {mediaLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(mediaFiles?.files || mediaFiles?.items || [])?.map((file: any) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {file.category === 'IMAGE' ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteMediaMutation.mutate(file.id)}
                      className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 truncate">{file.originalName}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderBackupsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">System Backups</h3>
            <p className="text-sm text-gray-500">Create and manage system backups</p>
          </div>
          <button
            onClick={() => createBackupMutation.mutate()}
            className="btn btn-primary flex items-center gap-2"
            disabled={createBackupMutation.isPending}
          >
            <DocumentArrowUpIcon className="h-5 w-5" />
            Create Backup
          </button>
        </div>
        <div className="p-6">
          {backupsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(backups) ? backups : backups?.items || backups?.backups || [])?.map((backup: any) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{backup.filename}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(backup.createdAt).toLocaleString()} • {(backup.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`badge ${
                        backup.status === 'COMPLETED' ? 'badge-success' :
                        backup.status === 'PROCESSING' ? 'badge-warning' :
                        backup.status === 'FAILED' ? 'badge-danger' : 'badge-secondary'
                      }`}
                    >
                      {backup.status}
                    </span>
                    {backup.downloadUrl && (
                      <a
                        href={backup.downloadUrl}
                        className="btn btn-sm btn-secondary"
                        download
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Manage system configuration, tenants, and maintenance</p>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              <span className="flex items-center justify-center gap-2">
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </span>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>{renderSettingsTab()}</Tab.Panel>
          <Tab.Panel>{renderTenantsTab()}</Tab.Panel>
          <Tab.Panel>{renderMediaTab()}</Tab.Panel>
          <Tab.Panel>
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-4">System Logs</h3>
              <p className="text-gray-600">System logs functionality will be available soon.</p>
            </div>
          </Tab.Panel>
          <Tab.Panel>{renderBackupsTab()}</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default SystemSettingsPage