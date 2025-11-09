"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, Eye, EyeOff, GripVertical } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export default function FooterSettingsPage() {
  const [footerConfig, setFooterConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  useEffect(() => {
    fetchFooterConfig();
  }, []);

  const fetchFooterConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFooterConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch footer config:', error);
      setMessage({ type: 'error', text: 'Failed to load footer configuration' });
    } finally {
      setLoading(false);
    }
  };

  const updateFooterConfig = async (updates) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        setFooterConfig(data.data);
        setMessage({ type: 'success', text: 'Footer configuration updated successfully' });
      }
    } catch (error) {
      console.error('Failed to update footer config:', error);
      setMessage({ type: 'error', text: 'Failed to update footer configuration' });
    } finally {
      setSaving(false);
    }
  };

  const createSection = async (sectionData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sectionData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchFooterConfig();
        setMessage({ type: 'success', text: 'Section created successfully' });
        setShowSectionModal(false);
      }
    } catch (error) {
      console.error('Failed to create section:', error);
      setMessage({ type: 'error', text: 'Failed to create section' });
    }
  };

  const updateSection = async (sectionId, updates) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        await fetchFooterConfig();
        setMessage({ type: 'success', text: 'Section updated successfully' });
        setShowSectionModal(false);
        setEditingSection(null);
      }
    } catch (error) {
      console.error('Failed to update section:', error);
      setMessage({ type: 'error', text: 'Failed to update section' });
    }
  };

  const deleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchFooterConfig();
        setMessage({ type: 'success', text: 'Section deleted successfully' });
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
      setMessage({ type: 'error', text: 'Failed to delete section' });
    }
  };

  const createLink = async (sectionId, linkData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin/sections/${sectionId}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(linkData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchFooterConfig();
        setMessage({ type: 'success', text: 'Link created successfully' });
        setShowLinkModal(false);
        setSelectedSectionId(null);
      }
    } catch (error) {
      console.error('Failed to create link:', error);
      setMessage({ type: 'error', text: 'Failed to create link' });
    }
  };

  const updateLink = async (linkId, updates) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        await fetchFooterConfig();
        setMessage({ type: 'success', text: 'Link updated successfully' });
        setShowLinkModal(false);
        setEditingLink(null);
      }
    } catch (error) {
      console.error('Failed to update link:', error);
      setMessage({ type: 'error', text: 'Failed to update link' });
    }
  };

  const deleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/footer/admin/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchFooterConfig();
        setMessage({ type: 'success', text: 'Link deleted successfully' });
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      setMessage({ type: 'error', text: 'Failed to delete link' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading footer configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Footer Settings</h1>
          <p className="mt-2 text-gray-600">Manage your website footer configuration, sections, and links</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={footerConfig?.companyName || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Tagline</label>
              <input
                type="text"
                value={footerConfig?.companyTagline || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, companyTagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={footerConfig?.description || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={footerConfig?.email || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={footerConfig?.phone || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={footerConfig?.address || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
              <input
                type="text"
                value={footerConfig?.copyrightText || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="© 2024 TripGo. All rights reserved."
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input
                type="url"
                value={footerConfig?.facebook || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, facebook: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
              <input
                type="url"
                value={footerConfig?.twitter || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, twitter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input
                type="url"
                value={footerConfig?.instagram || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, instagram: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={footerConfig?.linkedin || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, linkedin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input
                type="url"
                value={footerConfig?.youtube || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, youtube: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>
        </div>

        {/* Newsletter Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Newsletter Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={footerConfig?.showNewsletter || false}
                onChange={(e) => setFooterConfig({ ...footerConfig, showNewsletter: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Show newsletter subscription form
              </label>
            </div>

            {footerConfig?.showNewsletter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Title</label>
                  <input
                    type="text"
                    value={footerConfig?.newsletterTitle || ''}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletterTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Stay in the loop"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Newsletter Text</label>
                  <input
                    type="text"
                    value={footerConfig?.newsletterText || ''}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletterText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Get fresh deals and new routes weekly. No spam."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={footerConfig?.backgroundColor || '#1a1a1a'}
                  onChange={(e) => setFooterConfig({ ...footerConfig, backgroundColor: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={footerConfig?.backgroundColor || '#1a1a1a'}
                  onChange={(e) => setFooterConfig({ ...footerConfig, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={footerConfig?.textColor || '#ffffff'}
                  onChange={(e) => setFooterConfig({ ...footerConfig, textColor: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={footerConfig?.textColor || '#ffffff'}
                  onChange={(e) => setFooterConfig({ ...footerConfig, textColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={footerConfig?.accentColor || '#3b82f6'}
                  onChange={(e) => setFooterConfig({ ...footerConfig, accentColor: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={footerConfig?.accentColor || '#3b82f6'}
                  onChange={(e) => setFooterConfig({ ...footerConfig, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Sections */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Footer Sections & Links</h2>
            <button
              onClick={() => {
                setEditingSection(null);
                setShowSectionModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>

          <div className="space-y-4">
            {footerConfig?.sections && footerConfig.sections.length > 0 ? (
              footerConfig.sections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      {!section.isActive && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          setEditingLink(null);
                          setShowLinkModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Plus size={14} className="inline mr-1" />
                        Add Link
                      </button>
                      <button
                        onClick={() => {
                          setEditingSection(section);
                          setShowSectionModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {section.links && section.links.length > 0 && (
                    <ul className="space-y-2 ml-6">
                      {section.links.map((link) => (
                        <li key={link.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">{link.label}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-500">{link.url}</span>
                            {!link.isActive && <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Inactive</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingLink(link);
                                setSelectedSectionId(section.id);
                                setShowLinkModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteLink(link.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No sections added yet. Click "Add Section" to get started.</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => updateFooterConfig(footerConfig)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {/* Section Modal */}
        {showSectionModal && (
          <SectionModal
            section={editingSection}
            onSave={(data) => {
              if (editingSection) {
                updateSection(editingSection.id, data);
              } else {
                createSection(data);
              }
            }}
            onClose={() => {
              setShowSectionModal(false);
              setEditingSection(null);
            }}
          />
        )}

        {/* Link Modal */}
        {showLinkModal && (
          <LinkModal
            link={editingLink}
            sectionId={selectedSectionId}
            onSave={(data) => {
              if (editingLink) {
                updateLink(editingLink.id, data);
              } else {
                createLink(selectedSectionId, data);
              }
            }}
            onClose={() => {
              setShowLinkModal(false);
              setEditingLink(null);
              setSelectedSectionId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Section Modal Component
function SectionModal({ section, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    displayOrder: section?.displayOrder ?? 0,
    isActive: section?.isActive ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {section ? 'Edit Section' : 'Add Section'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <label className="ml-2 text-sm text-gray-900">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {section ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Link Modal Component
function LinkModal({ link, sectionId, onSave, onClose }) {
  const [formData, setFormData] = useState({
    label: link?.label || '',
    url: link?.url || '',
    icon: link?.icon || '',
    openInNewTab: link?.openInNewTab ?? false,
    displayOrder: link?.displayOrder ?? 0,
    isActive: link?.isActive ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {link ? 'Edit Link' : 'Add Link'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Label</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Home"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="/home"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.openInNewTab}
                onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-900">Open in new tab</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-900">Active</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {link ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
