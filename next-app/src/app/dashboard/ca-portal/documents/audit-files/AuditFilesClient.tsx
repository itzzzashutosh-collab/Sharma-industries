"use client";
import { DocumentUploadClient } from "../DocumentUploadClient";
export function AuditFilesClient() {
  return <DocumentUploadClient category="audit" title="Audit Files" description="Audit reports, balance sheet workpapers, and internal audit documentation." />;
}