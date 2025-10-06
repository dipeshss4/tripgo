import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { hrService } from '../../services/hr'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  PrinterIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface ReportConfig {
  type: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  parameters?: string[]
}

interface GeneratedReport {
  id: string
  type: string
  title: string
  generatedAt: string
  generatedBy: string
  parameters: Record<string, any>
  status: 'GENERATING' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
}

const ReportsPage: React.FC = () => {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<ReportConfig | null>(null)
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null)
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({})

  // Company logo placeholder - will be embedded later
  const companyLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPHR2eHQgeD0iNTAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+VEc8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCI+VHJpcEdvPC90ZXh0Pgo8L3N2Zz4='

  const reportTypes: ReportConfig[] = [
    {
      type: 'employee_list',
      title: 'Employee List Report',
      description: 'Complete list of all employees with their details',
      icon: UsersIcon,
      color: 'blue',
      parameters: ['department', 'status', 'sortBy']
    },
    {
      type: 'attendance_summary',
      title: 'Attendance Summary',
      description: 'Monthly attendance summary for all employees',
      icon: ClockIcon,
      color: 'green',
      parameters: ['month', 'year', 'department']
    },
    {
      type: 'leave_report',
      title: 'Leave Report',
      description: 'Leave requests and balances by employee',
      icon: CalendarDaysIcon,
      color: 'yellow',
      parameters: ['startDate', 'endDate', 'leaveType', 'status']
    },
    {
      type: 'payroll_summary',
      title: 'Payroll Summary',
      description: 'Monthly payroll summary and statistics',
      icon: CurrencyDollarIcon,
      color: 'purple',
      parameters: ['month', 'year', 'department']
    },
    {
      type: 'department_analytics',
      title: 'Department Analytics',
      description: 'Department-wise employee distribution and metrics',
      icon: BuildingOfficeIcon,
      color: 'indigo',
      parameters: ['includeInactive']
    },
    {
      type: 'performance_summary',
      title: 'Performance Summary',
      description: 'Employee performance metrics and ratings',
      icon: ChartBarIcon,
      color: 'pink',
      parameters: ['quarter', 'year', 'department']
    }
  ]

  // Mock generated reports
  const mockGeneratedReports: GeneratedReport[] = [
    {
      id: '1',
      type: 'employee_list',
      title: 'Employee List Report - December 2024',
      generatedAt: '2024-12-20T10:30:00Z',
      generatedBy: 'Admin User',
      parameters: { department: 'All', status: 'Active' },
      status: 'COMPLETED',
      downloadUrl: '#'
    },
    {
      id: '2',
      type: 'attendance_summary',
      title: 'Attendance Summary - November 2024',
      generatedAt: '2024-12-15T14:20:00Z',
      generatedBy: 'HR Manager',
      parameters: { month: 'November', year: 2024 },
      status: 'COMPLETED',
      downloadUrl: '#'
    },
    {
      id: '3',
      type: 'payroll_summary',
      title: 'Payroll Summary - December 2024',
      generatedAt: '2024-12-21T09:15:00Z',
      generatedBy: 'Finance Manager',
      parameters: { month: 'December', year: 2024 },
      status: 'GENERATING'
    }
  ]

  const handleGenerateReport = (reportType: ReportConfig) => {
    setSelectedReportType(reportType)
    setReportParameters({})
    setIsGenerateModalOpen(true)
  }

  const handleSubmitGeneration = () => {
    if (!selectedReportType) return

    toast.success(`${selectedReportType.title} generation started`)
    setIsGenerateModalOpen(false)
    setSelectedReportType(null)
    setReportParameters({})
  }

  const handlePreviewReport = (report: GeneratedReport) => {
    setSelectedReport(report)
    setIsPreviewModalOpen(true)
  }

  const handleDownloadReport = (report: GeneratedReport) => {
    toast.success(`Downloading ${report.title}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'GENERATING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderParameterInput = (param: string) => {
    switch (param) {
      case 'department':
        return (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={reportParameters[param] || ''}
              onChange={(e) => setReportParameters({ ...reportParameters, [param]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        )
      case 'status':
        return (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={reportParameters[param] || ''}
              onChange={(e) => setReportParameters({ ...reportParameters, [param]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )
      case 'month':
        return (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={reportParameters[param] || ''}
              onChange={(e) => setReportParameters({ ...reportParameters, [param]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Month</option>
              {['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        )
      case 'year':
        return (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <Input
              type="number"
              value={reportParameters[param] || new Date().getFullYear()}
              onChange={(e) => setReportParameters({ ...reportParameters, [param]: parseInt(e.target.value) })}
              min={2020}
              max={new Date().getFullYear() + 1}
            />
          </div>
        )
      case 'startDate':
        return (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={reportParameters[param] || ''}
              onChange={(e) => setReportParameters({ ...reportParameters, [param]: e.target.value })}
            />
          </div>
        )
      case 'endDate':
        return (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={reportParameters[param] || ''}
              onChange={(e) => setReportParameters({ ...reportParameters, [param]: e.target.value })}
              min={reportParameters.startDate}
            />
          </div>
        )
      default:
        return (
          <div key={param}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.charAt(0).toUpperCase() + param.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            <Input
              value={reportParameters[param] || ''}
              onChange={(e) => setReportParameters({ ...reportParameters, [param]: e.target.value })}
              placeholder={`Enter ${param}`}
            />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Types Grid */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((reportType) => {
            const Icon = reportType.icon
            return (
              <div
                key={reportType.type}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleGenerateReport(reportType)}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-3 rounded-lg bg-${reportType.color}-100`}>
                    <Icon className={`w-6 h-6 text-${reportType.color}-600`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{reportType.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{reportType.description}</p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenerateReport(reportType)
                      }}
                    >
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h2>
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Generated Reports</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockGeneratedReports.map((report) => (
              <div key={report.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.title}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-gray-500">
                          Generated by {report.generatedBy}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.generatedAt).toLocaleDateString()} at {new Date(report.generatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  {report.status === 'COMPLETED' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewReport(report)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.print()}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {mockGeneratedReports.length === 0 && (
              <div className="px-6 py-12 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports generated yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => {
          setIsGenerateModalOpen(false)
          setSelectedReportType(null)
          setReportParameters({})
        }}
        title={selectedReportType ? `Generate ${selectedReportType.title}` : 'Generate Report'}
        size="lg"
      >
        {selectedReportType && (
          <div className="space-y-6">
            <div className="flex items-start">
              <div className={`flex-shrink-0 p-3 rounded-lg bg-${selectedReportType.color}-100`}>
                <selectedReportType.icon className={`w-6 h-6 text-${selectedReportType.color}-600`} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedReportType.title}</h3>
                <p className="text-sm text-gray-500">{selectedReportType.description}</p>
              </div>
            </div>

            {selectedReportType.parameters && selectedReportType.parameters.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Report Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReportType.parameters.map(renderParameterInput)}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsGenerateModalOpen(false)
                  setSelectedReportType(null)
                  setReportParameters({})
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitGeneration}>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Report Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setSelectedReport(null)
        }}
        title="Report Preview"
        size="2xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Report Header with Company Logo */}
            <div className="text-center border-b border-gray-200 pb-6">
              <div className="flex justify-center mb-4">
                <img src={companyLogo} alt="Company Logo" className="w-16 h-16" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TripGo Travel Company</h1>
              <p className="text-gray-600">Human Resources Department</p>
              <h2 className="text-xl font-semibold text-gray-800 mt-4">{selectedReport.title}</h2>
              <p className="text-sm text-gray-500">
                Generated on {new Date(selectedReport.generatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Sample Report Content */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Report Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">96%</div>
                    <div className="text-sm text-gray-600">Attendance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-sm text-gray-600">Pending Leaves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">$89,500</div>
                    <div className="text-sm text-gray-600">Monthly Payroll</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Report Parameters</h4>
                <div className="text-sm text-gray-600">
                  {Object.entries(selectedReport.parameters).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                This is a preview of the report. Download the full report for complete details.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="text-gray-600 border-gray-600 hover:bg-gray-50"
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={() => handleDownloadReport(selectedReport)}
                className="text-green-600 bg-green-50 border-green-600 hover:bg-green-100"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPreviewModalOpen(false)
                  setSelectedReport(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReportsPage