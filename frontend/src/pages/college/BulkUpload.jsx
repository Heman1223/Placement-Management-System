import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import './BulkUpload.css';

const BulkUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const expectedColumns = [
        'First Name', 'Last Name', 'Email', 'Phone', 'Gender',
        'Department', 'Batch', 'Roll Number', 'CGPA', 'Skills'
    ];

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
            toast.error('Please upload an Excel file (.xlsx, .xls) or CSV');
            return;
        }

        setFile(selectedFile);
        parseFile(selectedFile);
    };

    const parseFile = (file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Validate and transform data
                const { validated, errors } = validateData(jsonData);
                setParsedData(validated);
                setErrors(errors);

                if (errors.length > 0) {
                    toast.error(`Found ${errors.length} errors in the data`);
                } else if (validated.length > 0) {
                    toast.success(`Parsed ${validated.length} students successfully`);
                }
            } catch (error) {
                toast.error('Failed to parse file. Please check the format.');
                console.error('Parse error:', error);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const validateData = (data) => {
        const validated = [];
        const errors = [];

        data.forEach((row, index) => {
            const rowErrors = [];

            // Check required fields
            if (!row['First Name'] && !row['firstName']) {
                rowErrors.push('First Name is required');
            }
            if (!row['Email'] && !row['email']) {
                rowErrors.push('Email is required');
            }
            if (!row['Department'] && !row['department']) {
                rowErrors.push('Department is required');
            }
            if (!row['Roll Number'] && !row['rollNumber']) {
                rowErrors.push('Roll Number is required');
            }

            // Validate email format
            const email = row['Email'] || row['email'];
            if (email && !/^\S+@\S+\.\S+$/.test(email)) {
                rowErrors.push('Invalid email format');
            }

            // Validate CGPA
            const cgpa = parseFloat(row['CGPA'] || row['cgpa']);
            if (cgpa && (cgpa < 0 || cgpa > 10)) {
                rowErrors.push('CGPA must be between 0 and 10');
            }

            if (rowErrors.length > 0) {
                errors.push({ row: index + 2, errors: rowErrors }); // +2 for 1-indexed and header
            }

            // Transform to API format
            validated.push({
                name: {
                    firstName: row['First Name'] || row['firstName'] || '',
                    lastName: row['Last Name'] || row['lastName'] || ''
                },
                email: row['Email'] || row['email'] || '',
                phone: row['Phone'] || row['phone'] || row['Mobile'] || '',
                gender: (row['Gender'] || row['gender'] || '').toLowerCase(),
                department: row['Department'] || row['department'] || '',
                batch: parseInt(row['Batch'] || row['batch']) || new Date().getFullYear(),
                rollNumber: String(row['Roll Number'] || row['rollNumber'] || ''),
                cgpa: parseFloat(row['CGPA'] || row['cgpa']) || undefined,
                backlogs: {
                    active: parseInt(row['Active Backlogs'] || 0),
                    history: parseInt(row['Backlog History'] || 0)
                },
                skills: (row['Skills'] || row['skills'] || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s),
                education: {
                    tenth: { percentage: parseFloat(row['10th %']) || undefined },
                    twelfth: { percentage: parseFloat(row['12th %']) || undefined }
                }
            });
        });

        return { validated, errors };
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            toast.error('No valid data to upload');
            return;
        }

        if (errors.length > 0) {
            const proceed = window.confirm(
                `There are ${errors.length} rows with errors. Continue uploading valid rows only?`
            );
            if (!proceed) return;
        }

        setUploading(true);
        try {
            const response = await collegeAPI.bulkUpload(parsedData);
            setUploadResult(response.data.data);
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = [
            'First Name', 'Last Name', 'Email', 'Phone', 'Gender',
            'Department', 'Batch', 'Roll Number', 'CGPA', 'Active Backlogs',
            '10th %', '12th %', 'Skills'
        ];
        const sample = [
            'John', 'Doe', 'john@example.com', '9876543210', 'male',
            'Computer Science', '2024', 'CS001', '8.5', '0',
            '90', '88', 'JavaScript, React, Node.js'
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, 'student_upload_template.xlsx');
    };

    const previewColumns = [
        { header: 'Name', accessor: 'name', render: (v) => `${v.firstName} ${v.lastName}` },
        { header: 'Email', accessor: 'email' },
        { header: 'Department', accessor: 'department' },
        { header: 'Batch', accessor: 'batch' },
        { header: 'Roll No', accessor: 'rollNumber' },
        { header: 'CGPA', accessor: 'cgpa', render: (v) => v?.toFixed(2) || '-' }
    ];

    return (
        <div className="bulk-upload-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/college/students')}>
                    <ArrowLeft size={20} />
                    <span>Back to Students</span>
                </button>
                <h1>Bulk Upload Students</h1>
                <p>Upload multiple students at once using an Excel file</p>
            </div>

            {/* Instructions */}
            <Card title="Instructions" className="instructions-card">
                <ol className="instructions-list">
                    <li>Download the template file</li>
                    <li>Fill in student data (required: First Name, Email, Department, Roll Number)</li>
                    <li>Save the file and upload it here</li>
                    <li>Review the preview and confirm upload</li>
                </ol>
                <Button variant="secondary" icon={Download} onClick={downloadTemplate}>
                    Download Template
                </Button>
            </Card>

            {/* Upload Area */}
            {!uploadResult && (
                <Card className="upload-card">
                    <div
                        className={`upload-zone ${file ? 'has-file' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const droppedFile = e.dataTransfer.files[0];
                            if (droppedFile) {
                                setFile(droppedFile);
                                parseFile(droppedFile);
                            }
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                            hidden
                        />

                        {file ? (
                            <>
                                <FileSpreadsheet size={48} className="file-icon" />
                                <span className="file-name">{file.name}</span>
                                <span className="file-info">
                                    {parsedData.length} students found
                                    {errors.length > 0 && ` • ${errors.length} errors`}
                                </span>
                            </>
                        ) : (
                            <>
                                <Upload size={48} />
                                <span>Drop your Excel file here or click to browse</span>
                                <span className="upload-hint">Supports .xlsx, .xls, .csv</span>
                            </>
                        )}
                    </div>
                </Card>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <Card title="Validation Errors" className="errors-card">
                    <div className="errors-list">
                        {errors.slice(0, 10).map((err, idx) => (
                            <div key={idx} className="error-item">
                                <AlertCircle size={16} />
                                <span>Row {err.row}: {err.errors.join(', ')}</span>
                            </div>
                        ))}
                        {errors.length > 10 && (
                            <p className="more-errors">And {errors.length - 10} more errors...</p>
                        )}
                    </div>
                </Card>
            )}

            {/* Preview */}
            {parsedData.length > 0 && !uploadResult && (
                <Card title={`Preview (${parsedData.length} students)`} className="preview-card">
                    <Table
                        columns={previewColumns}
                        data={parsedData.slice(0, 10)}
                    />
                    {parsedData.length > 10 && (
                        <p className="preview-note">Showing first 10 of {parsedData.length} students</p>
                    )}

                    <div className="upload-actions">
                        <Button variant="secondary" onClick={() => { setFile(null); setParsedData([]); setErrors([]); }}>
                            Clear
                        </Button>
                        <Button icon={Upload} loading={uploading} onClick={handleUpload}>
                            Upload {parsedData.length} Students
                        </Button>
                    </div>
                </Card>
            )}

            {/* Results */}
            {uploadResult && (
                <Card title="Upload Complete" className="results-card">
                    <div className="results-summary">
                        <div className="result-stat success">
                            <CheckCircle size={24} />
                            <span className="result-value">{uploadResult.success?.length || 0}</span>
                            <span className="result-label">Uploaded Successfully</span>
                        </div>
                        <div className="result-stat error">
                            <AlertCircle size={24} />
                            <span className="result-value">{uploadResult.failed?.length || 0}</span>
                            <span className="result-label">Failed</span>
                        </div>
                    </div>

                    {uploadResult.failed?.length > 0 && (
                        <div className="failed-list">
                            <h4>Failed Entries:</h4>
                            {uploadResult.failed.map((item, idx) => (
                                <div key={idx} className="failed-item">
                                    <span>{item.name || item.rollNumber}</span>
                                    <span className="failed-reason">{item.error}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="result-actions">
                        <Button variant="secondary" onClick={() => navigate('/college/students')}>
                            View All Students
                        </Button>
                        <Button onClick={() => { setUploadResult(null); setFile(null); setParsedData([]); }}>
                            Upload More
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default BulkUpload;
