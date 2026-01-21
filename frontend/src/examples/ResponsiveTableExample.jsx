import React, { useState } from 'react';
import Table, { Pagination } from '../components/common/Table';
import { ResponsiveButton } from '../components/common/ResponsiveForm';
import { Eye, Edit, Trash2 } from 'lucide-react';

/**
 * Responsive Table Usage Example
 * 
 * Desktop: Traditional table layout
 * Mobile: Card-based layout with label-value pairs
 */
const ResponsiveTableExample = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data
  const students = [
    {
      _id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      department: 'Computer Science',
      batch: 2024,
      cgpa: 8.5,
      status: 'active',
      placementStatus: 'placed',
    },
    {
      _id: '2',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      department: 'Information Technology',
      batch: 2024,
      cgpa: 9.2,
      status: 'active',
      placementStatus: 'in_process',
    },
    {
      _id: '3',
      name: 'Amit Patel',
      email: 'amit@example.com',
      department: 'Electronics',
      batch: 2025,
      cgpa: 7.8,
      status: 'active',
      placementStatus: 'not_placed',
    },
  ];

  // Define columns with mobile responsiveness
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      width: '20%',
      // Always show on mobile
    },
    {
      header: 'Email',
      accessor: 'email',
      width: '20%',
      // Always show on mobile
    },
    {
      header: 'Department',
      accessor: 'department',
      width: '15%',
      // Always show on mobile
    },
    {
      header: 'Batch',
      accessor: 'batch',
      width: '10%',
      mobileHide: true, // Hide on mobile to save space
    },
    {
      header: 'CGPA',
      accessor: 'cgpa',
      width: '10%',
      render: (value) => (
        <span className="font-semibold text-blue-600">
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '10%',
      render: (value) => (
        <span
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
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
      header: 'Placement',
      accessor: 'placementStatus',
      width: '15%',
      render: (value) => {
        const statusConfig = {
          placed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Placed' },
          in_process: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Process' },
          not_placed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Placed' },
        };
        const config = statusConfig[value] || statusConfig.not_placed;
        
        return (
          <span
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${config.bg} ${config.text}
            `}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: '_id',
      width: '10%',
      mobileHide: true, // Hide action buttons on mobile (use row click instead)
      render: (id, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('View:', row);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit:', row);
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete:', row);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
    // On mobile, this can open a detail modal or navigate to detail page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                Students List
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Manage and view all students
              </p>
            </div>
            <ResponsiveButton variant="primary">
              Add Student
            </ResponsiveButton>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header (Mobile Info) */}
          <div className="md:hidden px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-600">
              Tap on a card to view details
            </p>
          </div>

          {/* Table */}
          <div className="p-0 md:p-0">
            <Table
              columns={columns}
              data={students}
              onRowClick={handleRowClick}
              emptyMessage="No students found"
            />
          </div>

          {/* Pagination */}
          <div className="px-4 md:px-6 pb-4">
            <Pagination
              current={currentPage}
              total={students.length}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Mobile Instructions */}
        <div className="md:hidden mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Some columns are hidden on mobile to improve readability. 
            Tap on any card to view full details.
          </p>
        </div>

        {/* Desktop Instructions */}
        <div className="hidden md:block mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Desktop View:</strong> All columns are visible. Use action buttons to view, edit, or delete records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTableExample;
