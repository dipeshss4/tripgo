"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Shield, User, Briefcase, Calendar, Mail, Phone, Building, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export default function VerifyDocument() {
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    firstName: "",
    lastName: "",
    passportNumber: "",
    email: "",
    phone: "",
    position: "",
    department: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Filter out empty fields
    const dataToSubmit = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value.trim() !== '')
    );

    if (!dataToSubmit.employeeId) {
      setError("Employee ID is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Verification error:', err);
      setError("Failed to verify document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      employeeId: "",
      fullName: "",
      firstName: "",
      lastName: "",
      passportNumber: "",
      email: "",
      phone: "",
      position: "",
      department: ""
    });
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Employee Document Verification
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Verify employee credentials and documents against our secure database
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="Enter employee ID"
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Required field</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name (First Last)"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passport Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    placeholder="Enter passport number"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="employee@company.com"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g., Senior Developer"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Engineering"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Verify Document
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Verification Result */}
          {result && (
            <div className={`bg-white rounded-2xl shadow-xl border-2 p-8 ${
              result.verified ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="flex items-start gap-4 mb-6">
                {result.verified ? (
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    result.verified ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.verified ? 'Document Verified ✓' : 'Verification Failed ✗'}
                  </h2>
                  <p className="text-gray-600">{result.message}</p>
                </div>
              </div>

              {/* Match Details */}
              {result.matchDetails && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Details:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(result.matchDetails).map(([field, matched]) => (
                      <div key={field} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {matched ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${matched ? 'text-green-700' : 'text-gray-500'}`}>
                          {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Percentage */}
              {result.matchPercentage !== undefined && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Match Percentage</span>
                    <span className={`text-lg font-bold ${
                      result.matchPercentage >= 80 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.matchPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.matchPercentage >= 80 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.matchPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.matchCount} out of {result.totalProvided} fields matched
                  </p>
                </div>
              )}

              {/* Employee Info (if verified) */}
              {result.verified && result.employeeInfo && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900">{result.employeeInfo.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="font-semibold text-gray-900">{result.employeeInfo.position}</p>
                      </div>
                    </div>

                    {result.employeeInfo.department && (
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Department</p>
                          <p className="font-semibold text-gray-900">{result.employeeInfo.department}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Hire Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(result.employeeInfo.hireDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-semibold text-green-700">{result.employeeInfo.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Enter the employee ID (required) and any additional information you have</li>
                  <li>• The more fields you provide, the more accurate the verification</li>
                  <li>• Documents are verified against our secure employee database</li>
                  <li>• A match of 80% or higher indicates successful verification</li>
                  <li>• All verification attempts are logged for security purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}