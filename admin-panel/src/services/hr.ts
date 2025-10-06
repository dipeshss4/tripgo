import api from './api'
import { Employee, Department, ApiResponse } from '../types'

// Employee Interfaces
export interface CreateEmployeeData {
  userId: string
  employeeId: string
  department: string
  position: string
  salary?: number
  hireDate: string
  manager?: string
  skills?: string[]
  bio?: string
  address?: string
  emergencyContact?: any
}

export interface UpdateEmployeeData {
  employeeId?: string
  department?: string
  position?: string
  salary?: number
  hireDate?: string
  manager?: string
  skills?: string[]
  bio?: string
  address?: string
  emergencyContact?: any
  status?: string
}

export interface EmployeesQuery {
  page?: number
  limit?: number
  search?: string
  department?: string
  status?: string
  position?: string
}

export interface EmployeesResponse {
  employees: Employee[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Attendance Interfaces
export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
  notes?: string
  employee: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface MarkAttendanceData {
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
  notes?: string
}

export interface AttendanceQuery {
  employeeId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface AttendanceResponse {
  attendance: AttendanceRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Leave Request Interfaces
export interface LeaveRequest {
  id: string
  employeeId: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedBy?: string
  approvedAt?: string
  comments?: string
  employee: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface CreateLeaveRequestData {
  employeeId: string
  type: string
  startDate: string
  endDate: string
  reason: string
}

export interface UpdateLeaveRequestData {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comments?: string
}

export interface LeaveRequestsQuery {
  employeeId?: string
  status?: string
  type?: string
  page?: number
  limit?: number
}

export interface LeaveRequestsResponse {
  leaveRequests: LeaveRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Department Interfaces
export interface CreateDepartmentData {
  name: string
  description?: string
  headId?: string
  budget?: number
}

// Dashboard Interface
export interface HRDashboard {
  totalEmployees: number
  activeEmployees: number
  pendingLeaves: number
  todayAttendance: number
  departmentStats: Array<{
    category: string
    count: number
    size: number
  }>
  recentJoiners: Employee[]
}

class HRService {
  // Employee Management
  async getEmployees(query?: EmployeesQuery): Promise<EmployeesResponse> {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    const response = await api.get<ApiResponse<EmployeesResponse>>(`/hr/employees?${params}`)
    return response.data.data!
  }

  async getEmployee(id: string): Promise<Employee> {
    const response = await api.get<ApiResponse<Employee>>(`/hr/employees/${id}`)
    return response.data.data!
  }

  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    const response = await api.post<ApiResponse<Employee>>('/hr/employees', data)
    return response.data.data!
  }

  async updateEmployee(id: string, data: UpdateEmployeeData): Promise<Employee> {
    const response = await api.put<ApiResponse<Employee>>(`/hr/employees/${id}`, data)
    return response.data.data!
  }

  // Attendance Management
  async markAttendance(data: MarkAttendanceData): Promise<AttendanceRecord> {
    const response = await api.post<ApiResponse<AttendanceRecord>>('/hr/attendance', data)
    return response.data.data!
  }

  async getAttendance(query?: AttendanceQuery): Promise<AttendanceResponse> {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    const response = await api.get<ApiResponse<AttendanceResponse>>(`/hr/attendance?${params}`)
    return response.data.data!
  }

  // Leave Management
  async createLeaveRequest(data: CreateLeaveRequestData): Promise<LeaveRequest> {
    const response = await api.post<ApiResponse<LeaveRequest>>('/hr/leave-requests', data)
    return response.data.data!
  }

  async getLeaveRequests(query?: LeaveRequestsQuery): Promise<LeaveRequestsResponse> {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    const response = await api.get<ApiResponse<LeaveRequestsResponse>>(`/hr/leave-requests?${params}`)
    return response.data.data!
  }

  async updateLeaveRequestStatus(id: string, data: UpdateLeaveRequestData): Promise<LeaveRequest> {
    const response = await api.put<ApiResponse<LeaveRequest>>(`/hr/leave-requests/${id}/status`, data)
    return response.data.data!
  }

  // Department Management
  async getDepartments(): Promise<Department[]> {
    const response = await api.get<ApiResponse<Department[]>>('/hr/departments')
    return response.data.data!
  }

  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const response = await api.post<ApiResponse<Department>>('/hr/departments', data)
    return response.data.data!
  }

  // HR Dashboard
  async getHRDashboard(): Promise<HRDashboard> {
    const response = await api.get<ApiResponse<HRDashboard>>('/hr/dashboard')
    return response.data.data!
  }
}

export const hrService = new HRService()