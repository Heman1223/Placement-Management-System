/**
 * Email Templates
 */

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎓 Placement Management System</h1>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>This is an automated email. Please do not reply.</p>
        <p>&copy; ${new Date().getFullYear()} Placement Management System. All rights reserved.</p>
    </div>
</body>
</html>
`;

// Welcome Email
const welcomeEmail = (name, role) => {
    const content = `
        <h2>Welcome to Placement Management System!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering as a <strong>${role.replace('_', ' ')}</strong>.</p>
        <p>Your account is currently pending approval. You will receive an email once your account is approved.</p>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Account Approved Email
const accountApprovedEmail = (name, role, loginUrl) => {
    const content = `
        <h2>🎉 Your Account Has Been Approved!</h2>
        <p>Hi ${name},</p>
        <p>Great news! Your <strong>${role.replace('_', ' ')}</strong> account has been approved.</p>
        <p>You can now login and start using the platform.</p>
        <a href="${loginUrl}" class="button">Login Now</a>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Account Rejected Email
const accountRejectedEmail = (name, role, reason) => {
    const content = `
        <h2>Account Application Status</h2>
        <p>Hi ${name},</p>
        <p>We regret to inform you that your <strong>${role.replace('_', ' ')}</strong> account application has been rejected.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this is an error, please contact the administrator.</p>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Password Reset Email
const passwordResetEmail = (name, resetUrl) => {
    const content = `
        <h2>🔒 Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Student Verified Email
const studentVerifiedEmail = (name) => {
    const content = `
        <h2>✅ Profile Verified!</h2>
        <p>Hi ${name},</p>
        <p>Your student profile has been verified by your college administrator.</p>
        <p>You can now apply for jobs and participate in placement activities.</p>
        <a href="${process.env.FRONTEND_URL}/student/jobs" class="button">Browse Jobs</a>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Job Posted Notification
const jobPostedEmail = (studentName, jobTitle, companyName, jobUrl) => {
    const content = `
        <h2>💼 New Job Opportunity!</h2>
        <p>Hi ${studentName},</p>
        <p>A new job has been posted that matches your profile:</p>
        <p><strong>${jobTitle}</strong> at <strong>${companyName}</strong></p>
        <a href="${jobUrl}" class="button">View Job Details</a>
        <p>Don't miss this opportunity!</p>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Application Status Update
const applicationStatusEmail = (studentName, jobTitle, status, remarks) => {
    const statusMessages = {
        shortlisted: '⭐ You have been shortlisted!',
        interview_scheduled: '📅 Interview Scheduled',
        interviewed: '💬 Interview Completed',
        offered: '🎉 Job Offer Received!',
        hired: '🎊 Congratulations! You\'re Hired!',
        rejected: '❌ Application Update'
    };

    const content = `
        <h2>${statusMessages[status] || 'Application Status Update'}</h2>
        <p>Hi ${studentName},</p>
        <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
        <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
        ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/student/applications" class="button">View Application</a>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Shortlisted Notification
const shortlistedEmail = (studentName, jobTitle, companyName) => {
    const content = `
        <h2>⭐ You've Been Shortlisted!</h2>
        <p>Hi ${studentName},</p>
        <p>Congratulations! <strong>${companyName}</strong> has shortlisted you for the position of <strong>${jobTitle}</strong>.</p>
        <p>The company will contact you soon with further details.</p>
        <a href="${process.env.FRONTEND_URL}/student/applications" class="button">View Details</a>
        <p>Best of luck!</p>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Interview Scheduled Email
const interviewScheduledEmail = (studentName, jobTitle, companyName, date, mode, location) => {
    const content = `
        <h2>📅 Interview Scheduled</h2>
        <p>Hi ${studentName},</p>
        <p>Your interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been scheduled.</p>
        <p><strong>Date & Time:</strong> ${new Date(date).toLocaleString()}</p>
        <p><strong>Mode:</strong> ${mode}</p>
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/student/applications" class="button">View Details</a>
        <p>Good luck with your interview!</p>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Offer Received Email
const offerReceivedEmail = (studentName, jobTitle, companyName, packageAmount) => {
    const content = `
        <h2>🎉 Job Offer Received!</h2>
        <p>Hi ${studentName},</p>
        <p>Congratulations! You have received a job offer from <strong>${companyName}</strong>!</p>
        <p><strong>Position:</strong> ${jobTitle}</p>
        ${packageAmount ? `<p><strong>Package:</strong> ₹${packageAmount} LPA</p>` : ''}
        <p>Please review the offer details and respond accordingly.</p>
        <a href="${process.env.FRONTEND_URL}/student/applications" class="button">View Offer</a>
        <p>Congratulations once again!</p>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

// Bulk Upload Success Email
const bulkUploadSuccessEmail = (adminName, successCount, failedCount) => {
    const content = `
        <h2>📤 Bulk Upload Complete</h2>
        <p>Hi ${adminName},</p>
        <p>Your bulk student upload has been processed.</p>
        <p><strong>Successfully uploaded:</strong> ${successCount} students</p>
        ${failedCount > 0 ? `<p><strong>Failed:</strong> ${failedCount} students</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/college/students" class="button">View Students</a>
        <p>Best regards,<br>Placement Management Team</p>
    `;
    return baseTemplate(content);
};

module.exports = {
    welcomeEmail,
    accountApprovedEmail,
    accountRejectedEmail,
    passwordResetEmail,
    studentVerifiedEmail,
    jobPostedEmail,
    applicationStatusEmail,
    shortlistedEmail,
    interviewScheduledEmail,
    offerReceivedEmail,
    bulkUploadSuccessEmail
};
