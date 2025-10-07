import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Employee } from '../../types'
import { CreateLeaveRequestData } from '../../services/hr'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'

interface LeaveRequestFormProps {
  employees: Employee[]
  onSubmit: (data: CreateLeaveRequestData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  defaultEmployeeId?: string
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  employees,
  onSubmit,
  onCancel,
  loading = false,
  defaultEmployeeId = '',
}) => {
  const [formData, setFormData] = useState({
    employeeId: defaultEmployeeId,
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const [calculatedDays, setCalculatedDays] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const leaveTypes = [
    'Annual Leave',
    'Sick Leave',
    'Personal Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Emergency Leave',
    'Bereavement Leave',
    'Study Leave',
    'Unpaid Leave',
  ]

  useEffect(() => {
    if (defaultEmployeeId) {
      setFormData(prev => ({ ...prev, employeeId: defaultEmployeeId }))
    }
  }, [defaultEmployeeId])

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (end >= start) {
        const timeDiff = end.getTime() - start.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
        setCalculatedDays(daysDiff)
      } else {
        setCalculatedDays(0)
      }
    } else {
      setCalculatedDays(0)
    }
  }, [formData.startDate, formData.endDate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) newErrors.employeeId = 'Employee is required'
    if (!formData.type.trim()) newErrors.type = 'Leave type is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required'

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (end < start) {
        newErrors.endDate = 'End date must be after start date'
      }

      // Check if dates are in the past (except for today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past'
      }
    }

    if (calculatedDays > 365) {
      newErrors.endDate = 'Leave period cannot exceed 365 days'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    try {
      const submitData: CreateLeaveRequestData = {
        employeeId: formData.employeeId,
        type: formData.type.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      }

      await onSubmit(submitData)
      toast.success('Leave request created successfully')
    } catch (error) {
      console.error('Error creating leave request:', error)
      toast.error('Failed to create leave request')
    }
  }

  const selectedEmployee = employees.find(emp => emp.id === formData.employeeId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employee <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select an employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.user.firstName} {employee.user.lastName} - {employee.employeeId}
            </option>
          ))}
        </select>
        {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}

        {selectedEmployee && (
          <div className="mt-2 text-sm text-gray-600">
            Department: {selectedEmployee.department} | Position: {selectedEmployee.position}
          </div>
        )}
      </div>

      {/* Leave Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Leave Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select leave type</option>
          {leaveTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          error={errors.startDate}
          required
          min={new Date().toISOString().split('T')[0]}
        />

        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          error={errors.endDate}
          required
          min={formData.startDate || new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Calculated Days */}
      {calculatedDays > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-800">
              <strong>Total Days:</strong> {calculatedDays} day{calculatedDays !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Reason */}
      <TextArea
        label="Reason"
        value={formData.reason}
        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        rows={4}
        error={errors.reason}
        required
        placeholder="Please provide a detailed reason for your leave request..."
      />

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          Submit Leave Request
        </Button>
      </div>
    </form>
  )
}

export default LeaveRequestForm