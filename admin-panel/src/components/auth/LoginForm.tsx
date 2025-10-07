import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDemoMode } from '../../hooks/useDemoMode'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantSubdomain, setTenantSubdomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login } = useAuth()
  const { enableDemoMode } = useDemoMode()
  const navigate = useNavigate()

  const handleDemoMode = () => {
    enableDemoMode()
    toast.success('Demo mode enabled! Explore the admin panel.')
    navigate('/dashboard')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await login(email, password, tenantSubdomain || undefined)
      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the TripGo Admin Panel
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <Select
              label="Tenant"
              name="tenantSubdomain"
              value={tenantSubdomain}
              onChange={(e) => setTenantSubdomain(e.target.value)}
              options={[
                { value: '', label: 'Select a tenant' },
                { value: 'main', label: 'TripGo Main (main.tripgo.local)' },
                { value: 'cruises', label: 'TripGo Cruises (cruises.tripgo.local)' },
                { value: 'hotels', label: 'TripGo Hotels (hotels.tripgo.local)' },
              ]}
            />
          </div>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            Sign in
          </Button>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleDemoMode}
              className="w-full mt-4"
              size="lg"
            >
              Try Demo Mode
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              Explore the admin panel with sample data (no backend required)
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm