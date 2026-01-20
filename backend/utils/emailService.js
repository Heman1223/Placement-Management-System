const { sendEmail } = require('../config/email');
const emailTemplates = require('./emailTemplates');

/**
 * Email Service - Send various types of emails
 */

// Send Welcome Email
const sendWelcomeEmail = async (user) => {
    const html = emailTemplates.welcomeEmail(
        user.email.split('@')[0],
        user.role
    );

    return await sendEmail({
        to: user.email,
        subject: 'Welcome to Placement Management System',
        html
    });
};

// Send Account Approved Email
const sendAccountApprovedEmail = async (user) => {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const html = emailTemplates.accountApprovedEmail(
        user.email.split('@')[0],
        user.role,
        loginUrl
    );

    return await sendEmail({
        to: user.email,
        subject: 'Your Account Has Been Approved!',
        html
    });
};

// Send Account Rejected Email
const sendAccountRejectedEmail = async (user, reason) => {
    const html = emailTemplates.accountRejectedEmail(
        user.email.split('@')[0],
        user.role,
        reason
    );

    return await sendEmail({
        to: user.email,
        subject: 'Account Application Status',
        html
    });
};

// Send Password Reset Email
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = emailTemplates.passwordResetEmail(
        user.email.split('@')[0],
        resetUrl
    );

    return await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html
    });
};

// Send Student Verified Email
const sendStudentVerifiedEmail = async (student) => {
    const html = emailTemplates.studentVerifiedEmail(
        `${student.name.firstName} ${student.name.lastName}`
    );

    return await sendEmail({
        to: student.email,
        subject: 'Your Profile Has Been Verified!',
        html
    });
};

// Send Job Posted Email
const sendJobPostedEmail = async (student, job, company) => {
    const jobUrl = `${process.env.FRONTEND_URL}/student/jobs`;
    const html = emailTemplates.jobPostedEmail(
        `${student.name.firstName} ${student.name.lastName}`,
        job.title,
        company.name,
        jobUrl
    );

    return await sendEmail({
        to: student.email,
        subject: `New Job: ${job.title} at ${company.name}`,
        html
    });
};

// Send Application Status Update Email
const sendApplicationStatusEmail = async (student, job, status, remarks) => {
    const html = emailTemplates.applicationStatusEmail(
        `${student.name.firstName} ${student.name.lastName}`,
        job.title,
        status,
        remarks
    );

    return await sendEmail({
        to: student.email,
        subject: `Application Update: ${job.title}`,
        html
    });
};

// Send Shortlisted Email
const sendShortlistedEmail = async (student, job, company) => {
    const html = emailTemplates.shortlistedEmail(
        `${student.name.firstName} ${student.name.lastName}`,
        job.title,
        company.name
    );

    return await sendEmail({
        to: student.email,
        subject: `You've Been Shortlisted for ${job.title}!`,
        html
    });
};

// Send Interview Scheduled Email
const sendInterviewScheduledEmail = async (student, job, company, interviewDetails) => {
    const html = emailTemplates.interviewScheduledEmail(
        `${student.name.firstName} ${student.name.lastName}`,
        job.title,
        company.name,
        interviewDetails.scheduledAt,
        interviewDetails.mode,
        interviewDetails.location
    );

    return await sendEmail({
        to: student.email,
        subject: `Interview Scheduled: ${job.title}`,
        html
    });
};

// Send Offer Received Email
const sendOfferReceivedEmail = async (student, job, company, offerDetails) => {
    const html = emailTemplates.offerReceivedEmail(
        `${student.name.firstName} ${student.name.lastName}`,
        job.title,
        company.name,
        offerDetails.package
    );

    return await sendEmail({
        to: student.email,
        subject: `Job Offer from ${company.name}!`,
        html
    });
};

// Send Bulk Upload Success Email
const sendBulkUploadSuccessEmail = async (admin, successCount, failedCount) => {
    const html = emailTemplates.bulkUploadSuccessEmail(
        admin.email.split('@')[0],
        successCount,
        failedCount
    );

    return await sendEmail({
        to: admin.email,
        subject: 'Bulk Upload Complete',
        html
    });
};

module.exports = {
    sendWelcomeEmail,
    sendAccountApprovedEmail,
    sendAccountRejectedEmail,
    sendPasswordResetEmail,
    sendStudentVerifiedEmail,
    sendJobPostedEmail,
    sendApplicationStatusEmail,
    sendShortlistedEmail,
    sendInterviewScheduledEmail,
    sendOfferReceivedEmail,
    sendBulkUploadSuccessEmail
};
