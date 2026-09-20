/**
 * Sharma Industries / Swatch Paints — CEO Sovereign File Approval Controller
 * 
 * Strict Directive from CEO Ashutosh Sharma (+91 9079609627):
 * ALL files, SOPs, pricing slabs, schemes, formulations, script ledgers, 
 * battlecards, and policies created or modified by any Division Leader or Legend
 * MUST be submitted for explicit CEO approval.
 * 
 * Status Lifecycle:
 *  - PENDING_CEO_APPROVAL: Newly created / updated, awaiting CEO signoff
 *  - APPROVED_BY_CEO: Explicitly approved by Ashutosh Sir, active & enforced
 *  - REJECTED_NEEDS_REVISION: Rejected with reason, routed back to division leader
 */

const fs = require('fs');
const path = require('path');

const APPROVALS_LEDGER_FILE = path.join(__dirname, 'data', 'ceo_file_approvals_ledger.json');
const OWNER_PHONE = '+919079609627';

function ensureLedger() {
  const dir = path.dirname(APPROVALS_LEDGER_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(APPROVALS_LEDGER_FILE)) {
    fs.writeFileSync(APPROVALS_LEDGER_FILE, JSON.stringify({
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      files: []
    }, null, 2), 'utf-8');
  }
}

class CeoApprovalController {
  constructor() {
    this.name = 'ceo_approval_controller';
    ensureLedger();
  }

  getLedger() {
    ensureLedger();
    try {
      return JSON.parse(fs.readFileSync(APPROVALS_LEDGER_FILE, 'utf-8'));
    } catch (e) {
      return { version: '1.0', files: [], totalPending: 0, totalApproved: 0, totalRejected: 0 };
    }
  }

  saveLedger(ledger) {
    ensureLedger();
    ledger.lastUpdated = new Date().toISOString();
    ledger.totalPending = (ledger.files || []).filter(f => f.status === 'PENDING_CEO_APPROVAL').length;
    ledger.totalApproved = (ledger.files || []).filter(f => f.status === 'APPROVED_BY_CEO').length;
    ledger.totalRejected = (ledger.files || []).filter(f => f.status === 'REJECTED_NEEDS_REVISION').length;
    fs.writeFileSync(APPROVALS_LEDGER_FILE, JSON.stringify(ledger, null, 2), 'utf-8');
  }

  /**
   * Submit a newly generated or modified file for CEO approval
   */
  submitFileForApproval({
    filePath,
    title,
    division,
    authorLegend,
    summary,
    commercialImpact = null,
    metadata = {}
  }) {
    const ledger = this.getLedger();
    const cleanPath = filePath.replace(/\\/g, '/');
    const existingIdx = ledger.files.findIndex(f => f.filePath === cleanPath || f.filePath.endsWith(path.basename(cleanPath)));

    const fileId = existingIdx >= 0 
      ? ledger.files[existingIdx].fileId 
      : `FILE-${division.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

    const submissionRecord = {
      fileId,
      filePath: cleanPath,
      fileName: path.basename(cleanPath),
      title,
      division,
      authorLegend,
      summary,
      commercialImpact,
      status: 'PENDING_CEO_APPROVAL',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      decisionNotes: null,
      metadata
    };

    if (existingIdx >= 0) {
      ledger.files[existingIdx] = submissionRecord;
    } else {
      ledger.files.unshift(submissionRecord);
    }

    this.saveLedger(ledger);
    console.log(`[CEO Approval Gate] File ${fileId} ("${title}") submitted by ${authorLegend} (${division}). Status: PENDING_CEO_APPROVAL`);
    return submissionRecord;
  }

  getPendingFiles() {
    const ledger = this.getLedger();
    return (ledger.files || []).filter(f => f.status === 'PENDING_CEO_APPROVAL');
  }

  getFile(fileIdOrName) {
    const ledger = this.getLedger();
    const q = fileIdOrName.toLowerCase().trim();
    return (ledger.files || []).find(f => 
      f.fileId.toLowerCase() === q || 
      f.fileName.toLowerCase() === q ||
      f.filePath.toLowerCase().includes(q)
    ) || null;
  }

  /**
   * CEO approves a file
   */
  approveFile(fileIdOrName, approverPhone = OWNER_PHONE, notes = 'Approved by CEO Ashutosh Sharma') {
    const ledger = this.getLedger();
    const q = fileIdOrName.toLowerCase().trim();
    const target = (ledger.files || []).find(f => 
      f.fileId.toLowerCase() === q || 
      f.fileName.toLowerCase() === q ||
      f.filePath.toLowerCase().includes(q)
    );

    if (!target) {
      return { success: false, message: `File matching "${fileIdOrName}" not found in approvals ledger.` };
    }

    target.status = 'APPROVED_BY_CEO';
    target.reviewedAt = new Date().toISOString();
    target.reviewedBy = approverPhone;
    target.decisionNotes = notes;

    this.saveLedger(ledger);
    return {
      success: true,
      file: target,
      message: `File [${target.fileId}] "${target.title}" successfully APPROVED by CEO Ashutosh Sharma.`
    };
  }

  /**
   * CEO rejects a file with revision notes
   */
  rejectFile(fileIdOrName, approverPhone = OWNER_PHONE, reason = 'Requires revision per CEO instructions') {
    const ledger = this.getLedger();
    const q = fileIdOrName.toLowerCase().trim();
    const target = (ledger.files || []).find(f => 
      f.fileId.toLowerCase() === q || 
      f.fileName.toLowerCase() === q ||
      f.filePath.toLowerCase().includes(q)
    );

    if (!target) {
      return { success: false, message: `File matching "${fileIdOrName}" not found in approvals ledger.` };
    }

    target.status = 'REJECTED_NEEDS_REVISION';
    target.reviewedAt = new Date().toISOString();
    target.reviewedBy = approverPhone;
    target.decisionNotes = reason;

    this.saveLedger(ledger);
    return {
      success: true,
      file: target,
      message: `File [${target.fileId}] "${target.title}" REJECTED. Sent back to ${target.authorLegend} for revision: "${reason}".`
    };
  }

  /**
   * Format executive notification briefing for CEO WhatsApp
   */
  formatPendingBriefing(user = null) {
    const pending = this.getPendingFiles();
    if (pending.length === 0) {
      return `✅ *HERMES CEO APPROVAL DESK*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Ashutosh Sir, filhal koi bhi file pending nahi hai! Sabhi division deliverables up-to-date aur approved hain. 🫡`;
    }

    let msg = `🛡️ *HERMES CEO APPROVAL DESK (${pending.length} Files Pending Approval)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Ashutosh Sir, company ke division leaders ne naye documents/SOPs submit kiye hain jo aapke signoff ke bina active nahi honge:\n\n`;

    pending.forEach((f, idx) => {
      msg += `[#${idx + 1}] 📄 *${f.title}*\n` +
        `• *ID*: \`${f.fileId}\`\n` +
        `• *Division*: ${f.division} (${f.authorLegend})\n` +
        `• *File*: \`${f.fileName}\`\n` +
        `• *Summary*: ${f.summary}\n` +
        (f.commercialImpact ? `• *Impact*: ${f.commercialImpact}\n` : '') +
        `• *Action*: Reply *"Approve ${f.fileId}"* ya *"Reject ${f.fileId} [reason]"*\n\n`;
    });

    msg += `_Sovereign Rule: Only CEO Ashutosh Sharma (+91 9079609627) can authorize these files._ 👑`;
    return msg;
  }
}

const controller = new CeoApprovalController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || '--list';

  if (cmd === '--list' || cmd === '--pending') {
    console.log(JSON.stringify(controller.getPendingFiles(), null, 2));
  } else if (cmd === '--all') {
    console.log(JSON.stringify(controller.getLedger(), null, 2));
  } else if (cmd === '--approve') {
    const id = args[1];
    console.log(JSON.stringify(controller.approveFile(id, OWNER_PHONE, args[2] || 'Approved via CLI'), null, 2));
  } else if (cmd === '--reject') {
    const id = args[1];
    console.log(JSON.stringify(controller.rejectFile(id, OWNER_PHONE, args[2] || 'Rejected via CLI'), null, 2));
  } else {
    console.log('Usage: node ceo-approval-controller.js [--pending | --all | --approve <id> | --reject <id> <reason>]');
  }
}

module.exports = controller;
