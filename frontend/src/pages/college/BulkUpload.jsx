import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, ArrowLeft, FileDown, FileUp, Eye, Sparkles } from 'lucide-react';
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
    const [currentStep, setCurrentStep] = useState(1);

    const expectedColumns = [
        'First Name', 'Last Name', 'Email', 'Phone', 'Gender',
        'Department', 'Batch', 'Roll Number', 'CGPA', 'Skills'
    ];

    const steps = [
        { num: 1, title: 'Download', desc: 'Get template file', icon: FileDown },
        { num: 2, title: 'Fill Data', desc: 'Add student details', icon: FileSpreadsheet },
        { num: 3, title: 'Upload', desc: 'Import your file', icon: FileUp },
        { num: 4, title: 'Review', desc: 'Confirm & submit', icon: Eye }
    ];

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
            toast.error('Please upload an Excel file (.xlsx, .xls) or CSV');
            return;
        }

        setFile(selectedFile);
        setCurrentStep(3);
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
                setCurrentStep(4);

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

        if (currentStep === 1) setCurrentStep(2);
        toast.success('Template downloaded!');
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
            {/* Premium Header */}
            <div className="upload-header">
                <button className="back-btn" onClick={() => navigate('/college/students')}>
                    <ArrowLeft size={20} />
                    <span>Back to Students</span>
                </button>
                <div className="header-content">
                    <div className="header-icon">
                        <Upload size={28} />
                    </div>
                    <div>
                        <h1>Bulk Upload Students</h1>
                        <p>Import multiple students at once using Excel or CSV</p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="steps-timeline">
                {steps.map((step, idx) => (
                    <div key={step.num} className={`step ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                        <div className="step-indicator">
                            {currentStep > step.num ? (
                                <CheckCircle size={20} />
                            ) : (
                                <step.icon size={20} />
                            )}
                        </div>
                        <div className="step-content">
                            <span className="step-title">{step.title}</span>
                            <span className="step-desc">{step.desc}</span>
                        </div>
                        {idx < steps.length - 1 && <div className="step-connector" />}
                    </div>
                ))}
            </div>

            {/* Instructions Card */}
            <Card className="instructions-card glass-card">
                <div className="instructions-header">
                    <Sparkles size={20} />
                    <h3>Quick Start Guide</h3>
                </div>
                <div className="instructions-content">
                    <div className="instruction-step">
                        <span className="instruction-num">1</span>
                        <span>Download the Excel template with required columns</span>
                    </div>
                    <div className="instruction-step">
                        <span className="instruction-num">2</span>
                        <span>Fill student data (Required: First Name, Email, Department, Roll Number)</span>
                    </div>
                    <div className="instruction-step">
                        <span className="instruction-num">3</span>
                        <span>Upload your completed file and review the preview</span>
                    </div>
                    <div className="instruction-step">
                        <span className="instruction-num">4</span>
                        <span>Confirm and submit to add students to your college</span>
                    </div>
                </div>
                <Button variant="secondary" icon={Download} onClick={downloadTemplate} className="template-btn">
                    Download Template
                </Button>
            </Card>

            {/* Upload Area */}
            {!uploadResult && (
                <Card className="upload-card glass-card">
                    <div
                        className={`upload-zone ${file ? 'has-file' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                        onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('drag-over');
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
                            <div className="file-selected">
                                <div className="file-icon-wrapper">
                                    <FileSpreadsheet size={48} className="file-icon" />
                                </div>
                                <span className="file-name">{file.name}</span>
                                <span className="file-info">
                                    <CheckCircle size={16} />
                                    {parsedData.length} students found
                                    {errors.length > 0 && <span className="error-count">• {errors.length} errors</span>}
                                </span>
                            </div>
                        ) : (
                            <div className="upload-prompt">
                                <div className="upload-icon-wrapper">
                                    <Upload size={48} />
                                </div>
                                <span className="upload-text">Drop your Excel file here</span>
                                <span className="upload-or">or</span>
                                <Button variant="secondary">Browse Files</Button>
                                <span className="upload-hint">Supports .xlsx, .xls, .csv</span>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <Card className="errors-card">
                    <div className="errors-header">
                        <AlertCircle size={20} />
                        <h3>Validation Errors</h3>
                        <span className="error-badge">{errors.length} issues</span>
                    </div>
                    <div className="errors-list">
                        {errors.slice(0, 5).map((err, idx) => (
                            <div key={idx} className="error-item">
                                <span className="error-row">Row {err.row}</span>
                                <span className="error-msg">{err.errors.join(', ')}</span>
                            </div>
                        ))}
                        {errors.length > 5 && (
                            <p className="more-errors">And {errors.length - 5} more errors...</p>
                        )}
                    </div>
                </Card>
            )}

            {/* Preview */}
            {parsedData.length > 0 && !uploadResult && (
                <Card className="preview-card glass-card">
                    <div className="preview-header">
                        <Eye size={20} />
                        <h3>Preview</h3>
                        <span className="preview-count">{parsedData.length} students ready</span>
                    </div>
                    <Table
                        columns={previewColumns}
                        data={parsedData.slice(0, 10)}
                    />
                    {parsedData.length > 10 && (
                        <p className="preview-note">Showing first 10 of {parsedData.length} students</p>
                    )}

                    <div className="upload-actions">
                        <Button variant="secondary" onClick={() => { setFile(null); setParsedData([]); setErrors([]); setCurrentStep(1); }}>
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
                <Card className="results-card glass-card">
                    <div className="results-header">
                        <CheckCircle size={28} className="success-icon" />
                        <h2>Upload Complete!</h2>
                    </div>
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
                        <Button onClick={() => { setUploadResult(null); setFile(null); setParsedData([]); setCurrentStep(1); }}>
                            Upload More
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default BulkUpload;
