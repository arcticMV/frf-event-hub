'use client';

import { User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="john@example.com"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Your organization"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-3" defaultChecked />
              <span className="text-sm text-gray-700">Email notifications for new registrations</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-3" defaultChecked />
              <span className="text-sm text-gray-700">Email notifications for event updates</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-3" />
              <span className="text-sm text-gray-700">Weekly summary reports</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-3" defaultChecked />
              <span className="text-sm text-gray-700">Event reminder notifications</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Change Password
              </button>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">Enable two-factor authentication</span>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Theme</span>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}