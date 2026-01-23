const { Job, Application, Company } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Create a new job
 * @route   POST /api/jobs
 * @access  Company (Approved)
 */
const createJob = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { college } = req.body;

    // If creating a placement drive for a college, verify access
    if (college) {
        const company = await Company.findById(companyId);
        const hasAccess = company.collegeAccess.some(
            ca => ca.college.toString() === college && ca.status === 'approved'
        );
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have approved access to create placement drives for this college'
            });
        }
        req.body.isPlacementDrive = true;
    }

    const job = await Job.create({
        ...req.body,
        company: companyId,
        createdBy: req.userId
    });

    await Company.findByIdAndUpdate(companyId, {
        $inc: { 'stats.totalJobsPosted': 1, 'stats.activeJobs': 1 }
    });

    res.status(201).json({ success: true, data: job });
});

/**
 * @desc    Get all jobs for company
 * @route   GET /api/jobs
 */
const getJobs = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = { company: companyId };
    if (status) query.status = status;
    if (type) query.type = type;

    const [jobs, total] = await Promise.all([
        Job.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
        Job.countDocuments(query)
    ]);

    res.json({ success: true, data: { jobs, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } } });
});

/**
 * @desc    Get single job
 */
const getJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate('company', 'name type industry logo');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
});

/**
 * @desc    Update job
 */
const updateJob = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    let job = await Job.findOne({ _id: req.params.id, company: companyId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const wasOpen = job.status === 'open';

    // If updating placement drive status, verify access
    if (req.body.college) {
        const company = await Company.findById(companyId);
        const hasAccess = company.collegeAccess.some(
            ca => ca.college.toString() === req.body.college && ca.status === 'approved'
        );
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have approved access to create placement drives for this college'
            });
        }
        req.body.isPlacementDrive = true;
    } else if (req.body.college === null || req.body.college === '') {
        req.body.isPlacementDrive = false;
        req.body.college = null;
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (wasOpen && job.status !== 'open') {
        await Company.findByIdAndUpdate(companyId, { $inc: { 'stats.activeJobs': -1 } });
    }

    res.json({ success: true, data: job });
});

/**
 * @desc    Delete job
 */
const deleteJob = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const job = await Job.findOne({ _id: req.params.id, company: companyId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const appCount = await Application.countDocuments({ job: job._id });
    if (appCount > 0) return res.status(400).json({ success: false, message: 'Cannot delete job with applications' });

    await job.deleteOne();
    await Company.findByIdAndUpdate(companyId, { $inc: { 'stats.totalJobsPosted': -1, ...(job.status === 'open' && { 'stats.activeJobs': -1 }) } });

    res.json({ success: true, message: 'Job deleted' });
});

/**
 * @desc    Get applicants for a job
 */
const getApplicants = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const { status, page = 1, limit = 10 } = req.query;

    const job = await Job.findOne({ _id: req.params.id, company: companyId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const query = { job: req.params.id };
    if (status) query.status = status;

    const [applications, total] = await Promise.all([
        Application.find(query).populate('student', 'name email phone department batch cgpa skills resumeUrl').sort({ appliedAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
        Application.countDocuments(query)
    ]);

    res.json({ success: true, data: { job: { id: job._id, title: job.title }, applications, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } } });
});

/**
 * @desc    Close a job
 */
const closeJob = asyncHandler(async (req, res) => {
    const companyId = req.user.companyProfile._id;
    const job = await Job.findOne({ _id: req.params.id, company: companyId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = req.body.reason || 'closed';
    job.closedAt = new Date();
    await job.save();

    await Company.findByIdAndUpdate(companyId, { $inc: { 'stats.activeJobs': -1 } });
    res.json({ success: true, data: job });
});

/**
 * @desc    Get all open jobs (public)
 */
const getPublicJobs = asyncHandler(async (req, res) => {
    const { type, department, batch, search, page = 1, limit = 10 } = req.query;

    const query = { status: 'open', applicationDeadline: { $gte: new Date() } };
    if (type) query.type = type;
    if (department) query['eligibility.allowedDepartments'] = { $in: department.split(',') };
    if (batch) query['eligibility.allowedBatches'] = { $in: batch.split(',').map(Number) };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }];

    const [jobs, total] = await Promise.all([
        Job.find(query).populate('company', 'name type industry logo').sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
        Job.countDocuments(query)
    ]);

    res.json({ success: true, data: { jobs, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } } });
});

module.exports = { createJob, getJobs, getJob, updateJob, deleteJob, getApplicants, closeJob, getPublicJobs };
