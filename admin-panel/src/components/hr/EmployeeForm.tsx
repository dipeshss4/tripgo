import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Employee, User } from '../../types'
import { CreateEmployeeData, UpdateEmployeeData } from '../../services/hr'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface EmployeeFormProps {
  employee?: Employee
  users?: User[]
  onSubmit: (data: CreateEmployeeData | UpdateEmployeeData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  users = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    employeeId: '',
    department: '',
    position: '',
    salary: 0,
    hireDate: '',
    manager: '',
    bio: '',
    address: '',
    status: 'ACTIVE',
  })

  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (employee) {
      setFormData({
        userId: employee.userId || '',
        employeeId: employee.employeeId || '',
        department: employee.department || '',
        position: employee.position || '',
        salary: employee.salary || 0,
        hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
        manager: employee.manager || '',
        bio: employee.bio || '',
        address: employee.address || '',
        status: employee.status || 'ACTIVE',
      })

      setSkills(employee.skills || [])
      setEmergencyContact(employee.emergencyContact || {
        name: '',
        relationship: '',
        phone: '',
        email: '',
      })
    }
  }, [employee])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.userId) newErrors.userId = 'User is required'
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required'
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.position.trim()) newErrors.position = 'Position is required'
    if (!formData.hireDate) newErrors.hireDate = 'Hire date is required'

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
      const submitData = {
        ...formData,
        salary: formData.salary || undefined,
        manager: formData.manager || undefined,
        bio: formData.bio || undefined,
        address: formData.address || undefined,
        skills: skills.length > 0 ? skills : undefined,
        emergencyContact: emergencyContact.name ? emergencyContact : undefined,
      }

      await onSubmit(submitData)
      toast.success(employee ? 'Employee updated successfully' : 'Employee created successfully')
    } catch (error) {
      console.error('Error submitting employee:', error)
      toast.error('Failed to save employee')
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const availableUsers = users.filter(user =>
    !employee || user.id === employee.userId
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!!employee}
          >
            <option value="">Select a user</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
          {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId}</p>}
        </div>

        <Input
          label="Employee ID"
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          error={errors.employeeId}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          error={errors.department}
          required
        />

        <Input
          label="Position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          error={errors.position}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Salary"
          type="number"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
          placeholder="Optional"
        />

        <Input
          label="Hire Date"
          type="date"
          value={formData.hireDate}
          onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
          error={errors.hireDate}
          required
        />
      </div>

      <Input
        label="Manager"
        value={formData.manager}
        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
        placeholder="Optional"
      />

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <TextArea
        label="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        rows={3}
        placeholder="Optional bio/description"
      />

      <TextArea
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        rows={2}
        placeholder="Optional address"
      />

      {/* Emergency Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Emergency Contact
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            value={emergencyContact.name}
            onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
            placeholder="Emergency contact name"
          />
          <Input
            label="Relationship"
            value={emergencyContact.relationship}
            onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
            placeholder="Relationship to employee"
          />
          <Input
            label="Phone"
            value={emergencyContact.phone}
            onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
            placeholder="Emergency contact phone"
          />
          <Input
            label="Email"
            type="email"
            value={emergencyContact.email}
            onChange={(e) => setEmergencyContact({ ...emergencyContact, email: e.target.value })}
            placeholder="Emergency contact email"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>

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
          {employee ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  )
}

export default EmployeeForm