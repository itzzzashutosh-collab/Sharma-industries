"use client";

import React, { useState } from "react";
import { UserPlus, Upload, Save, User, Building, Phone, Briefcase, Landmark } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { addEmployee } from "@/actions/employeeActions";
import { useRouter } from "next/navigation";

export default function OnboardEmployeePage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    profile_pic: null,
    aadhaar_front: null,
    aadhaar_back: null,
    pan_front: null
  });

  const [autoId, setAutoId] = useState("Loading...");

  React.useEffect(() => {
    async function fetchNextId() {
      const { getEmployees } = await import("@/actions/employeeActions");
      const res = await getEmployees();
      if (res.success && res.data) {
        let maxNum = 0;
        res.data.forEach((e: any) => {
          if (e.id && e.id.startsWith("EMPSW-")) {
            const num = parseInt(e.id.replace("EMPSW-", ""), 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
        const nextId = `EMPSW-${String(maxNum + 1).padStart(3, '0')}`;
        setAutoId(nextId);
      } else {
        setAutoId("EMPSW-001");
      }
    }
    fetchNextId();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    // Append files explicitly
    if (files.profile_pic) formData.set("profile_pic", files.profile_pic);
    if (files.aadhaar_front) formData.set("aadhaar_front", files.aadhaar_front);
    if (files.aadhaar_back) formData.set("aadhaar_back", files.aadhaar_back);
    if (files.pan_front) formData.set("pan_front", files.pan_front);

    const res = await addEmployee(formData);
    setIsSubmitting(false);

    if (res.success) {
      alert("Employee Onboarded Successfully!");
      router.push("/dashboard/employees");
    } else {
      alert("Error onboarding employee: " + res.error);
    }
  };

  const renderUploadZone = (title: string, fieldName: string) => {
    const file = files[fieldName];
    return (
      <div className="relative group bg-background border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden min-h-[140px]">
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Upload size={20} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{file.name}</p>
            <p className="text-sm text-primary font-semibold mt-1">Ready to upload</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
              <Upload size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">Click to browse or drag file</p>
          </>
        )}
        <input 
          type="file" 
          name={fieldName}
          onChange={(e) => handleFileChange(e, fieldName)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*,application/pdf"
        />
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <UserPlus className="text-primary" size={32} /> {t("Onboard Employee")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("Register a new team member and upload compliance documents.")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Personal & Work Details */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="bg-primary/20 p-1.5 rounded-lg text-primary"><Briefcase size={18} /></span> 
            {t("Work & Personal Details")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Employee ID (Auto-Generated)")}</label>
              <input type="text" name="id" value={autoId} readOnly className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 focus:outline-none text-muted-foreground font-mono uppercase opacity-80 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Full Name")}</label>
              <input type="text" name="name" required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Designation")}</label>
              <input type="text" name="designation" required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Payroll Type")}</label>
              <select name="payroll_type" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                <option value="Permanent Monthly">Permanent Monthly</option>
                <option value="Daily Wage">Daily Wage</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Salary Date")}</label>
              <input type="text" name="salary_day" placeholder="e.g. 5th of every month" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Work Details / Shift")}</label>
              <input type="text" name="work_details" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Base Salary (₹)")}</label>
              <input type="number" name="salary" required placeholder="e.g. 25000" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono" />
            </div>
          </div>
        </div>

        {/* Contact & Banking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="bg-blue-500/20 p-1.5 rounded-lg text-blue-400"><Phone size={18} /></span> 
              {t("Contact & KYC Info")}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("Contact No")}</label>
                <input type="text" name="contact_no" required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("Emergency Contact")}</label>
                <input type="text" name="emergency_contact" required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("Aadhaar Number")}</label>
                <input type="text" name="aadhaar_no" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("PAN Number")}</label>
                <input type="text" name="pan_no" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground uppercase font-mono" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><Landmark size={18} /></span> 
              {t("Banking Details")}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("Bank Name")}</label>
                <input type="text" name="bank_name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("Account Name")}</label>
                <input type="text" name="account_name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("Account Number")}</label>
                <input type="text" name="account_no" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t("IFSC Code")}</label>
                <input type="text" name="ifsc_code" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground font-mono uppercase" />
              </div>
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="bg-purple-500/20 p-1.5 rounded-lg text-purple-400"><Upload size={18} /></span> 
            {t("Compliance Documents")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {renderUploadZone("Profile Picture", "profile_pic")}
            {renderUploadZone("Aadhaar (Front)", "aadhaar_front")}
            {renderUploadZone("Aadhaar (Back)", "aadhaar_back")}
            {renderUploadZone("PAN Card", "pan_front")}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-primary text-white px-12 py-4 rounded-xl font-black text-lg shadow-md hover:shadow-md transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Save size={24} /> {isSubmitting ? t("Uploading Documents...") : t("Onboard Employee")}
          </button>
        </div>
        
      </form>
    </div>
  );
}
