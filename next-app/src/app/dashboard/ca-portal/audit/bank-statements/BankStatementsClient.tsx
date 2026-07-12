"use client";
import { DocumentUploadClient } from "../../documents/DocumentUploadClient";
export function BankStatementsClient() {
  return <DocumentUploadClient category="statements" title="Bank Statements" description="Upload bank statement PDFs or CSVs for reconciliation. Supports all major banks." />;
}