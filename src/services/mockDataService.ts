import CryptoJS from 'crypto-js';
import { MOCK_PATIENTS, MOCK_PRESCRIPTIONS, MOCK_CLINICS, MOCK_DOCTORS, MOCK_MEDICAL_RECORDS } from '../mockData';

const SECRET_KEY = 'yemen-health-secure-key-2026';

// This service acts as the "Internal State" engine, replacing Firebase.
// It uses localStorage to persist data across refreshes in the browser.

class MockDataService {
  private patients: any[] = [];
  private prescriptions: any[] = [];
  private clinics: any[] = [];
  private doctors: any[] = [];
  private medicalRecords: any[] = [];
  private aiReports: any[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedPatients = localStorage.getItem('mock_patients');
    const storedPrescriptions = localStorage.getItem('mock_prescriptions');
    const storedClinics = localStorage.getItem('mock_clinics');
    const storedDoctors = localStorage.getItem('mock_doctors');
    const storedRecords = localStorage.getItem('mock_medical_records');
    const storedAIReports = localStorage.getItem('mock_ai_reports');

    this.patients = storedPatients ? JSON.parse(storedPatients) : [...MOCK_PATIENTS];
    this.prescriptions = storedPrescriptions ? JSON.parse(storedPrescriptions) : [...MOCK_PRESCRIPTIONS];
    this.clinics = storedClinics ? JSON.parse(storedClinics) : [...MOCK_CLINICS];
    this.doctors = storedDoctors ? JSON.parse(storedDoctors) : [...MOCK_DOCTORS];
    this.medicalRecords = storedRecords ? JSON.parse(storedRecords) : [...MOCK_MEDICAL_RECORDS];
    this.aiReports = storedAIReports ? JSON.parse(storedAIReports) : [];
  }

  private saveToStorage() {
    localStorage.setItem('mock_patients', JSON.stringify(this.patients));
    localStorage.setItem('mock_prescriptions', JSON.stringify(this.prescriptions));
    localStorage.setItem('mock_clinics', JSON.stringify(this.clinics));
    localStorage.setItem('mock_doctors', JSON.stringify(this.doctors));
    localStorage.setItem('mock_medical_records', JSON.stringify(this.medicalRecords));
    localStorage.setItem('mock_ai_reports', JSON.stringify(this.aiReports));
  }

  // Patients
  getPatients() { return this.patients; }
  getPatientById(id: string) { return this.patients.find(p => p.id === id); }
  
  searchPatients(query: string, type: string = 'all') {
    const q = query.toLowerCase();
    return this.patients.filter(p => {
      if (type === 'nationalId') return p.nationalId?.includes(q);
      if (type === 'yhid') return p.yhid?.toLowerCase().includes(q);
      if (type === 'name') return p.name?.toLowerCase().includes(q);
      if (type === 'phone') return p.phone?.includes(q);
      
      return (
        p.name?.toLowerCase().includes(q) ||
        p.nationalId?.includes(q) ||
        p.yhid?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      );
    });
  }
  
  private generateYHID() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `YHID-${year}-${random}`;
  }

  addPatient(patient: any) {
    const newPatient = { 
      ...patient, 
      id: `p${Date.now()}`, 
      yhid: patient.yhid || this.generateYHID(),
      createdAt: new Date().toISOString() 
    };
    this.patients = [newPatient, ...this.patients];
    this.saveToStorage();
    return newPatient;
  }
  updatePatient(id: string, updates: any) {
    this.patients = this.patients.map(p => p.id === id ? { ...p, ...updates } : p);
    this.saveToStorage();
  }
  deletePatient(id: string) {
    this.patients = this.patients.filter(p => p.id !== id);
    this.saveToStorage();
  }

  // Prescriptions
  getPrescriptions() { return this.prescriptions; }
  getPrescriptionById(id: string) { return this.prescriptions.find(p => p.id === id); }
  
  generateHash(prescriptionId: string) {
    return CryptoJS.SHA256(prescriptionId + SECRET_KEY).toString();
  }

  addPrescription(prescription: any) {
    const id = `pr${Date.now()}`;
    const qrHash = this.generateHash(id);
    const newPrescription = { 
      ...prescription, 
      id, 
      qrHash,
      status: 'active',
      issuedAt: new Date().toISOString(),
      expiresAt: prescription.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString() 
    };
    this.prescriptions = [newPrescription, ...this.prescriptions];
    this.saveToStorage();
    return newPrescription;
  }

  validatePrescription(id: string, hash: string) {
    const prescription = this.getPrescriptionById(id);
    if (!prescription) return { valid: false, reason: 'الوصفة غير موجودة' };
    
    const recalculatedHash = this.generateHash(id);
    if (recalculatedHash !== hash) return { valid: false, reason: 'فشل التحقق من صحة الرمز (تلاعب محتمل)' };
    
    if (prescription.status === 'dispensed') return { valid: false, reason: 'تم صرف هذه الوصفة مسبقاً' };
    
    const now = new Date();
    const expiry = new Date(prescription.expiresAt);
    if (now > expiry) {
      this.updatePrescription(id, { status: 'expired' });
      return { valid: false, reason: 'انتهت صلاحية هذه الوصفة' };
    }
    
    return { valid: true, prescription };
  }

  dispensePrescription(id: string, pharmacyId: string) {
    const prescription = this.getPrescriptionById(id);
    if (!prescription || prescription.status !== 'active') return false;
    
    this.updatePrescription(id, { 
      status: 'dispensed', 
      pharmacyId, 
      dispensedAt: new Date().toISOString() 
    });
    return true;
  }
  updatePrescription(id: string, updates: any) {
    this.prescriptions = this.prescriptions.map(p => p.id === id ? { ...p, ...updates } : p);
    this.saveToStorage();
  }
  deletePrescription(id: string) {
    this.prescriptions = this.prescriptions.filter(p => p.id !== id);
    this.saveToStorage();
  }

  // Clinics
  getClinics() { return this.clinics; }
  getClinicById(id: string) { return this.clinics.find(c => c.id === id); }
  addClinic(clinic: any) {
    const newClinic = { ...clinic, id: `c${Date.now()}` };
    this.clinics = [newClinic, ...this.clinics];
    this.saveToStorage();
    return newClinic;
  }
  updateClinic(id: string, updates: any) {
    this.clinics = this.clinics.map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveToStorage();
  }
  deleteClinic(id: string) {
    this.clinics = this.clinics.filter(c => c.id !== id);
    this.saveToStorage();
  }

  // Doctors
  getDoctors() { return this.doctors; }
  getDoctorById(id: string) { return this.doctors.find(d => d.id === id); }
  addDoctor(doctor: any) {
    const newDoctor = { ...doctor, id: `d${Date.now()}`, createdAt: new Date().toISOString() };
    this.doctors = [newDoctor, ...this.doctors];
    this.saveToStorage();
    return newDoctor;
  }
  updateDoctor(id: string, updates: any) {
    this.doctors = this.doctors.map(d => d.id === id ? { ...d, ...updates } : d);
    this.saveToStorage();
  }
  deleteDoctor(id: string) {
    this.doctors = this.doctors.filter(d => d.id !== id);
    this.saveToStorage();
  }

  // Medical Records
  getMedicalRecords() { return this.medicalRecords; }
  getRecordsByPatientYhid(yhid: string) {
    return this.medicalRecords.filter(r => r.patientYhid === yhid);
  }
  getPrescriptionsByPatientYhid(yhid: string) {
    return this.prescriptions.filter(p => p.yhid === yhid);
  }

  // AI Reports
  getAIReportsByPatientYhid(yhid: string) {
    return this.aiReports.filter(r => r.patientYhid === yhid);
  }
  addAIReport(report: any) {
    const newReport = { ...report, id: `ai${Date.now()}`, createdAt: new Date().toISOString() };
    this.aiReports = [newReport, ...this.aiReports];
    this.saveToStorage();
    return newReport;
  }
}

export const mockDataService = new MockDataService();
