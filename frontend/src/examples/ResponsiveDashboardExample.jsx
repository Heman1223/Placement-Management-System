import React, { useState } from 'react';
import { CardGrid, StatsCard } from '../components/common/ResponsiveCard';
import ResponsiveTable from '../components/common/ResponsiveTable';
import { ResponsiveButton } from '../components/common/ResponsiveForm';
import ResponsiveLayout, { PageHeader, Section } from '../components/layout/ResponsiveLayout';
import {
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Plus,
  Download,
  Filter,
  Search,
} from 'lucide-react';

/**
 * Complete Responsive Dashboard Example
 * 
 * This demonstrates how to build a fully responsive dashboard
 * that works perfectly on mobile, tablet, and desktop
 */
const ResponsiveDashboardExample = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const stats = {
    users: 1234,
    colleges: 45,
    companies: 89,
    students: 567,
  };

  const navigation = [
    { label: 'Dashboard', href: '/dashboard', icon: TrendingUp, active: true },
    { label: 'Students', href: '/students', icon: Users },
    { label: 'Colleges', href: '/colleges', icon: Building2 },
    { label: 'Companies', href: '/companies', icon: Briefcase },
  ];

  const tableColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span
          className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${
              value === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }
          `}
        >
          {value}
        </span>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      mobileHide: true, // Hide on mobile
    },
  ];

  const tableData = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      role: 'Admin',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      role: 'User',
    },
    {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'inactive',
      role: 'User',
    },
  ];

  return (
    <ResponsiveLayout
      user={{ name: 'Admin User', role: 'Super Admin' }}
      navigation={navigation}
    >
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        actions={[
          <ResponsiveButton
            key="export"
            variant="outline"
            icon={Download}
            className="hidden sm:flex"
          >
            Export
          </ResponsiveButton>,
          <ResponsiveButton key="add" variant="primary" icon={Plus}>
            Add New
          </ResponsiveButton>,
        ]}
      />

      {/* Stats Cards */}
      <Section>
        <CardGrid columns={4}>
          <StatsCard
            title="Total Users"
            value={stats.users.toLocaleString()}
            icon={Users}
            color="primary"
            trend={12}
          />
          <StatsCard
            title="Colleges"
            value={stats.colleges}
            icon={Building2}
            color="success"
            trend={5}
          />
          <StatsCard
            title="Companies"
            value={stats.companies}
            icon={Briefcase}
            color="warning"
            trend={-3}
          />
          <StatsCard
            title="Students"
            value={stats.students}
            icon={GraduationCap}
            color="info"
            trend={8}
          />
        </CardGrid>
      </Section>

      {/* Search and Filters */}
      <Section>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5
                  text-sm md:text-base
                  border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              />
            </div>

            {/* Filter Button */}
            <ResponsiveButton variant="outline" icon={Filter}>
              <span className="hidden sm:inline">Filters</span>
            </ResponsiveButton>
          </div>

          {/* Responsive Table */}
          <ResponsiveTable
            columns={tableColumns}
            data={tableData}
            onRowClick={(row) => console.log('Clicked:', row)}
          />
        </div>
      </Section>

      {/* Charts Section (Example) */}
      <Section title="Analytics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Chart Card 1 */}
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
              Placement Trends
            </h3>
            <div className="h-48 md:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-500">Chart Placeholder</p>
            </div>
          </div>

          {/* Chart Card 2 */}
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
              Department Distribution
            </h3>
            <div className="h-48 md:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-500">Chart Placeholder</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Recent Activity */}
      <Section title="Recent Activity">
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm">
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-900">
                    New student registered
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    John Doe joined Computer Science department
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </ResponsiveLayout>
  );
};

export default ResponsiveDashboardExample;
