import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Employee } from '../../types'
import { MarkAttendanceData } from '../../services/hr'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'

interface AttendanceFormProps {
  employees: Employee[]
  onSubmit: (data: MarkAttendanceData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  defaultEmployeeId?: string
  defaultDate?: string
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  employees,
  onSubmit,
  onCancel,
  loading = false,
  defaultEmployeeId = '',
  defaultDate = '',
}) => {
  const [formData, setFormData] = useState({
    employeeId: defaultEmployeeId,
    date: defaultDate || new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'PRESENT' as 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (defaultEmployeeId) {
      setFormData(prev => ({ ...prev, employeeId: defaultEmployeeId }))
    }
    if (defaultDate) {
      setFormData(prev => ({ ...prev, date: defaultDate }))
    }
  }, [defaultEmployeeId, defaultDate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) newErrors.employeeId = 'Employee is required'
    if (!formData.date) newErrors.date = 'Date is required'

    if (formData.status === 'PRESENT' || formData.status === 'LATE') {
      if (!formData.checkIn) newErrors.checkIn = 'Check-in time is required'
    }

    if (formData.checkIn && formData.checkOut) {
      const checkInTime = new Date(`${formData.date}T${formData.checkIn}`)
      const checkOutTime = new Date(`${formData.date}T${formData.checkOut}`)

      if (checkOutTime <= checkInTime) {
        newErrors.checkOut = 'Check-out time must be after check-in time'
      }
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
      const submitData: MarkAttendanceData = {
        employeeId: formData.employeeId,
        date: formData.date,
        status: formData.status,
      }

      if (formData.checkIn) {
        submitData.checkIn = formData.checkIn
      }

      if (formData.checkOut) {
        submitData.checkOut = formData.checkOut
      }

      if (formData.notes.trim()) {
        submitData.notes = formData.notes.trim()
      }

      await onSubmit(submitData)
      toast.success('Attendance marked successfully')
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
    }
  }

  const handleStatusChange = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY') => {
    setFormData(prev => {
      const newData = { ...prev, status }

      // Clear times for absent status
      if (status === 'ABSENT') {
        newData.checkIn = ''
        newData.checkOut = ''
      }

      return newData
    })
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

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
        required
      />

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Status <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'PRESENT', label: 'Present', color: 'green' },
            { value: 'ABSENT', label: 'Absent', color: 'red' },
            { value: 'LATE', label: 'Late', color: 'yellow' },
            { value: 'HALF_DAY', label: 'Half Day', color: 'blue' },
          ].map(({ value, label, color }) => (
            <label
              key={value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.status === value
                  ? `border-${color}-500 bg-${color}-50`
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={value}
                checked={formData.status === value}
                onChange={() => handleStatusChange(value as any)}
                className={`mr-2 text-${color}-600`}
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Time Fields */}
      {(formData.status === 'PRESENT' || formData.status === 'LATE' || formData.status === 'HALF_DAY') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Check-in Time"
            type="time"
            value={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            error={errors.checkIn}
            required={formData.status === 'PRESENT' || formData.status === 'LATE'}
          />

          <Input
            label="Check-out Time"
            type="time"
            value={formData.checkOut}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            error={errors.checkOut}
            placeholder="Optional"
          />
        </div>
      )}

      {/* Notes */}
      <TextArea
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
        placeholder="Optional notes about attendance"
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
          Mark Attendance
        </Button>
      </div>
    </form>
  )
}

export default AttendanceForm