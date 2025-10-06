import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { hrService } from '../../services/hr'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { Employee } from '../../types'
import {
  PlusIcon,
  BanknotesIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface PayrollRecord {
  id: string
  employee: Employee
  month: string
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  bonus: number
  overtime: number
  netSalary: number
  paymentDate: string
  status: 'PENDING' | 'PAID' | 'PROCESSING'
  payslipGenerated: boolean
  createdAt: string
}

interface PayrollForm {
  employeeId: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  bonus: number
  overtime: number
}

const PayrollPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null)
  const [payrollForm, setPayrollForm] = useState<PayrollForm>({
    employeeId: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    bonus: 0,
    overtime: 0
  })

  const queryClient = useQueryClient()
  const limit = 10

  // Mock data for demonstration
  const mockPayrollData = {
    payroll: [
      {
        id: '1',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          position: 'Software Engineer',
          department: 'Engineering'
        },
        month: 'December',
        year: 2024,
        basicSalary: 5000,
        allowances: 500,
        deductions: 200,
        bonus: 1000,
        overtime: 300,
        netSalary: 6600,
        paymentDate: '2024-12-31',
        status: 'PAID' as const,
        payslipGenerated: true,
        createdAt: '2024-12-01'
      },
      {
        id: '2',
        employee: {
          id: '2',
          employeeId: 'EMP002',
          user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          position: 'HR Manager',
          department: 'HR'
        },
        month: 'December',
        year: 2024,
        basicSalary: 4500,
        allowances: 400,
        deductions: 150,
        bonus: 800,
        overtime: 0,
        netSalary: 5550,
        paymentDate: '2024-12-31',
        status: 'PENDING' as const,
        payslipGenerated: false,
        createdAt: '2024-12-01'
      }
    ] as PayrollRecord[],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1
    }
  }

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => hrService.getEmployees({ limit: 1000 }),
  })

  const calculateNetSalary = (form: PayrollForm) => {
    return form.basicSalary + form.allowances + form.bonus + form.overtime - form.deductions
  }

  const handleCreatePayroll = async () => {
    try {
      const netSalary = calculateNetSalary(payrollForm)
      toast.success(`Payroll created successfully. Net Salary: $${netSalary.toLocaleString()}`)
      setIsCreateModalOpen(false)
      setPayrollForm({
        employeeId: '',
        month: '',
        year: new Date().getFullYear(),
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        bonus: 0,
        overtime: 0
      })
    } catch (error) {
      toast.error('Failed to create payroll')
    }
  }

  const handleViewPayroll = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll)
    setIsViewModalOpen(true)
  }

  const handleGeneratePayslip = (payroll: PayrollRecord) => {
    toast.success(`Payslip generated for ${payroll.employee.user.firstName} ${payroll.employee.user.lastName}`)
  }

  const handleProcessPayment = (payroll: PayrollRecord) => {
    toast.success(`Payment processed for ${payroll.employee.user.firstName} ${payroll.employee.user.lastName}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedMonth('')
    setSelectedYear('')
    setSelectedStatus('')
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (_: any, payroll: PayrollRecord) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {payroll.employee.user.firstName[0]}{payroll.employee.user.lastName[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {payroll.employee.user.firstName} {payroll.employee.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{payroll.employee.position}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      render: (_: any, payroll: PayrollRecord) => (
        <div className="text-sm text-gray-900">
          <div>{payroll.month} {payroll.year}</div>
        </div>
      ),
    },
    {
      key: 'basicSalary',
      header: 'Basic Salary',
      render: (_: any, payroll: PayrollRecord) => (
        <span className="text-sm text-gray-900">${payroll.basicSalary.toLocaleString()}</span>
      ),
    },
    {
      key: 'netSalary',
      header: 'Net Salary',
      render: (_: any, payroll: PayrollRecord) => (
        <span className="text-sm font-medium text-gray-900">${payroll.netSalary.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, payroll: PayrollRecord) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
          {payroll.status}
        </span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      render: (_: any, payroll: PayrollRecord) => (
        <span className="text-sm text-gray-900">
          {payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : 'Not set'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, payroll: PayrollRecord) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewPayroll(payroll)}
            className="text-blue-600 hover:text-blue-800"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          {!payroll.payslipGenerated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGeneratePayslip(payroll)}
              className="text-green-600 hover:text-green-800"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
            </Button>
          )}
          {payroll.status === 'PENDING' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleProcessPayment(payroll)}
              className="text-purple-600 hover:text-purple-800"
            >
              <BanknotesIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const payrollRecords = mockPayrollData.payroll
  const pagination = mockPayrollData.pagination
  const employees = employeesData?.employees || []

  return (
    <div className="space-y-6">
      {/* Page Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Process Payroll
        </Button>
      </div>

      {/* Payroll Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payroll', value: `$${payrollRecords.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}`, color: 'blue', icon: CurrencyDollarIcon },
          { label: 'Pending Payments', value: payrollRecords.filter(p => p.status === 'PENDING').length, color: 'yellow', icon: BanknotesIcon },
          { label: 'Processed This Month', value: payrollRecords.filter(p => p.status === 'PAID').length, color: 'green', icon: BanknotesIcon },
          { label: 'Payslips Generated', value: payrollRecords.filter(p => p.payslipGenerated).length, color: 'purple', icon: DocumentArrowDownIcon },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="PAID">Paid</option>
          </select>
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          columns={columns}
          data={payrollRecords}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No payroll records found"
        />
      </div>

      {/* Create Payroll Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Process Payroll"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={payrollForm.employeeId}
                onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user.firstName} {employee.user.lastName} - {employee.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={payrollForm.month}
                onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <Input
                type="number"
                value={payrollForm.year}
                onChange={(e) => setPayrollForm({ ...payrollForm, year: parseInt(e.target.value) })}
                min={currentYear - 5}
                max={currentYear + 1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basic Salary ($)
              </label>
              <Input
                type="number"
                value={payrollForm.basicSalary}
                onChange={(e) => setPayrollForm({ ...payrollForm, basicSalary: parseFloat(e.target.value) || 0 })}
                min={0}
                step={0.01}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowances ($)
              </label>
              <Input
                type="number"
                value={payrollForm.allowances}
                onChange={(e) => setPayrollForm({ ...payrollForm, allowances: parseFloat(e.target.value) || 0 })}
                min={0}
                step={0.01}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deductions ($)
              </label>
              <Input
                type="number"
                value={payrollForm.deductions}
                onChange={(e) => setPayrollForm({ ...payrollForm, deductions: parseFloat(e.target.value) || 0 })}
                min={0}
                step={0.01}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus ($)
              </label>
              <Input
                type="number"
                value={payrollForm.bonus}
                onChange={(e) => setPayrollForm({ ...payrollForm, bonus: parseFloat(e.target.value) || 0 })}
                min={0}
                step={0.01}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime ($)
              </label>
              <Input
                type="number"
                value={payrollForm.overtime}
                onChange={(e) => setPayrollForm({ ...payrollForm, overtime: parseFloat(e.target.value) || 0 })}
                min={0}
                step={0.01}
              />
            </div>
          </div>

          {/* Net Salary Calculation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-lg font-medium text-gray-900">
              Net Salary: ${calculateNetSalary(payrollForm).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Basic + Allowances + Bonus + Overtime - Deductions
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePayroll}
              disabled={!payrollForm.employeeId || !payrollForm.month}
            >
              Process Payroll
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Payroll Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedPayroll(null)
        }}
        title="Payroll Details"
        size="lg"
      >
        {selectedPayroll && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  <span className="text-lg font-medium text-gray-700">
                    {selectedPayroll.employee.user.firstName[0]}{selectedPayroll.employee.user.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedPayroll.employee.user.firstName} {selectedPayroll.employee.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedPayroll.employee.position}</p>
                  <p className="text-sm text-blue-600">{selectedPayroll.employee.department}</p>
                </div>
              </div>
            </div>

            {/* Payroll Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-500">Period:</span>
                  <span className="ml-2 text-gray-900">{selectedPayroll.month} {selectedPayroll.year}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Basic Salary:</span>
                  <span className="ml-2 text-gray-900">${selectedPayroll.basicSalary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Allowances:</span>
                  <span className="ml-2 text-gray-900">${selectedPayroll.allowances.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Bonus:</span>
                  <span className="ml-2 text-gray-900">${selectedPayroll.bonus.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayroll.status)}`}>
                    {selectedPayroll.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Deductions:</span>
                  <span className="ml-2 text-gray-900">-${selectedPayroll.deductions.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Overtime:</span>
                  <span className="ml-2 text-gray-900">${selectedPayroll.overtime.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Payment Date:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedPayroll.paymentDate ? new Date(selectedPayroll.paymentDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-xl font-bold text-blue-900">
                Net Salary: ${selectedPayroll.netSalary.toLocaleString()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex space-x-3">
                {!selectedPayroll.payslipGenerated && (
                  <Button
                    variant="outline"
                    onClick={() => handleGeneratePayslip(selectedPayroll)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Generate Payslip
                  </Button>
                )}
                {selectedPayroll.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    onClick={() => handleProcessPayment(selectedPayroll)}
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    <BanknotesIcon className="w-4 h-4 mr-2" />
                    Process Payment
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedPayroll(null)
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

export default PayrollPage