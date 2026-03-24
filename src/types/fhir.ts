/**
 * YNHB Data Standard - HL7 FHIR Compliant Patient Record Schema
 * Supporting Arabic and English
 */

export interface FHIRPatient {
  resourceType: "Patient";
  id: string; // Internal ID
  yhid: string; // Yemen Health ID (YHID-YYYY-XXXXXX)
  nationalId: string; // National ID
  active: boolean;
  bloodType?: string;
  name: Array<{
    use: "official";
    text: string; // Full name in Arabic
    family: string;
    given: string[];
    extension?: Array<{
      url: "http://hl7.org/fhir/StructureDefinition/translation";
      valueString: string; // Translation in English
    }>;
  }>;
  telecom: Array<{
    system: "phone" | "email";
    value: string;
    use: "mobile" | "home" | "work";
  }>;
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string; // YYYY-MM-DD
  emergencyContact?: string;
  address: Array<{
    use: "home";
    type: "both";
    text: string;
    city: string;
    district: string;
    state: string; // Governorate (e.g., Sana'a, Aden)
  }>;
}

export interface FHIRCondition {
  resourceType: "Condition";
  id: string;
  subject: { reference: string }; // Patient/NationalID
  code: {
    coding: Array<{
      system: "http://hl7.org/fhir/sid/icd-10";
      code: string;
      display: string;
    }>;
    text: string; // Diagnosis in Arabic/English
  };
  clinicalStatus: { coding: [{ code: "active" | "resolved" }] };
  recordedDate: string;
  recorder: { display: string }; // Hospital Name
}

export interface FHIRObservation {
  resourceType: "Observation";
  id: string;
  status: "final" | "preliminary";
  category: [{ coding: [{ code: "laboratory" | "imaging" }] }];
  code: { text: string };
  subject: { reference: string };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
  };
  interpretation?: [{ text: string }];
  performer: [{ display: string }]; // Hospital/Lab Name
}

export interface FHIRImagingStudy {
  resourceType: "ImagingStudy";
  id: string;
  status: "available" | "registered";
  subject: { reference: string };
  started: string;
  description: string;
  series: Array<{
    uid: string;
    number: number;
    modality: { code: string };
    instance: Array<{
      uid: string;
      title: string;
      url: string; // Link to the image (Radiology Viewer)
    }>;
  }>;
}

export interface MedicalRecord {
  id: string;
  patientYhid: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  prescription: string;
  hospitalName: string;
  type: 'Condition' | 'Observation' | 'Procedure';
}

export interface PharmaInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  totalAmount: number;
  notes: string;
  linkedToFinancialDoc: boolean; // if true, totalAmount cannot be edited
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface FHIRAllergyIntolerance {
  resourceType: "AllergyIntolerance";
  id: string;
  patient: { reference: string }; // Patient/NationalID
  code: { text: string }; // Allergy name (Medication, Environment, Food)
  category: Array<"food" | "medication" | "environment" | "biologic">;
  criticality: "low" | "high" | "unable-to-assess";
  recordedDate: string;
}

export interface FHIRMedicationStatement {
  resourceType: "MedicationStatement";
  id: string;
  status: "active" | "completed" | "on-hold";
  medicationCodeableConcept: { text: string }; // Medication name
  subject: { reference: string }; // Patient/NationalID
  effectivePeriod?: { start: string; end?: string };
  note?: Array<{ text: string }>;
}

export interface FHIRProcedure {
  resourceType: "Procedure";
  id: string;
  status: "completed" | "on-hold" | "in-progress";
  code: { text: string }; // Surgery/Procedure name
  subject: { reference: string }; // Patient/NationalID
  performedDateTime: string;
  recorder?: { display: string }; // Hospital Name
}
