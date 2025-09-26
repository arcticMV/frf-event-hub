'use client';

import { TrendingUp, Users, Calendar, Eye } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">12,543</p>
              <p className="text-sm text-green-600 mt-1">↑ 12% vs last month</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">68%</p>
              <p className="text-sm text-green-600 mt-1">↑ 5% vs last month</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
              <p className="text-sm text-gray-500 mt-1">3 ending soon</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Attendees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">74</p>
              <p className="text-sm text-red-600 mt-1">↓ 3% vs last month</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization will be added here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Categories</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Pie chart visualization will be added here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Bar chart visualization will be added here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Events</h3>
          <div className="space-y-3">
            {[
              { name: 'Annual Tech Conference', attendees: 186 },
              { name: 'Spring Networking', attendees: 142 },
              { name: 'Innovation Workshop', attendees: 98 },
              { name: 'Summer Meetup', attendees: 76 },
              { name: 'Product Launch', attendees: 64 },
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{index + 1}.</span>
                  <span className="ml-2 text-sm text-gray-700">{event.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{event.attendees}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}