import { MedicalRecord } from './types/fhir';

export interface Patient {
  id: string;
  yhid: string;
  name: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  nationalId: string;
  phone: string;
  address: string;
  bloodType: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  yhid: string;
  doctorId: string;
  doctorName?: string; // Keep for UI convenience
  patientName?: string; // Keep for UI convenience
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  notes: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'dispensed' | 'expired';
  qrHash: string;
}

export interface Clinic {
  id: string;
  name: string;
  type: string;
  location: string;
  phone: string;
  status: 'نشط' | 'غير نشط' | 'تحت الصيانة';
  lat: number;
  lng: number;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    yhid: 'YHID-2026-000123',
    name: 'أحمد محمد علي الحاشدي',
    age: 45,
    gender: 'ذكر',
    nationalId: '10123456789',
    phone: '777123456',
    address: 'صنعاء - حي حدة',
    bloodType: 'A+',
    emergencyContact: '777000111',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    yhid: 'YHID-2026-000456',
    name: 'فاطمة صالح عبدالله اليافعي',
    age: 32,
    gender: 'أنثى',
    nationalId: '20198765432',
    phone: '733987654',
    address: 'عدن - كريتر',
    bloodType: 'O-',
    emergencyContact: '733000222',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p3',
    yhid: 'YHID-2026-000789',
    name: 'خالد وليد سعيد باوزير',
    age: 28,
    gender: 'ذكر',
    nationalId: '10555444333',
    phone: '711222333',
    address: 'المكلا - حي السلام',
    bloodType: 'B+',
    emergencyContact: '711000333',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p4',
    yhid: 'YHID-2026-000999',
    name: 'ليلى حسن مصلح العنسي',
    age: 50,
    gender: 'أنثى',
    nationalId: '20888777666',
    phone: '700111222',
    address: 'ذمار - وسط المدينة',
    bloodType: 'AB+',
    emergencyContact: '700000444',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'pr1',
    yhid: 'YHID-2026-000123',
    patientName: 'أحمد محمد علي الحاشدي',
    doctorId: 'd1',
    doctorName: 'د. سامي العريقي',
    medications: [
      { name: 'أملوديبين', dosage: '5 ملجم', frequency: 'حبة يومياً' }
    ],
    notes: 'تجنب الموالح والدهون',
    issuedAt: '2026-03-20T10:00:00Z',
    expiresAt: '2026-06-20T10:00:00Z',
    status: 'active',
    qrHash: 'hash_pr1_secure_yhid'
  },
  {
    id: 'pr2',
    yhid: 'YHID-2026-000456',
    patientName: 'فاطمة صالح عبدالله اليافعي',
    doctorId: 'd2',
    doctorName: 'د. نادية المتوكل',
    medications: [
      { name: 'فيتامين د', dosage: '50000 وحدة', frequency: 'حبة أسبوعياً' }
    ],
    notes: 'التعرض لأشعة الشمس في الصباح الباكر',
    issuedAt: '2026-03-21T14:30:00Z',
    expiresAt: '2026-04-21T14:30:00Z',
    status: 'active',
    qrHash: 'hash_pr2_secure_yhid'
  }
];

export const MOCK_CLINICS: Clinic[] = [
  {
    id: 'c1',
    name: 'مستشفى الثورة العام',
    type: 'مستشفى حكومي',
    location: 'صنعاء - باب اليمن',
    phone: '01244444',
    status: 'نشط',
    lat: 15.3547,
    lng: 44.2191
  },
  {
    id: 'c2',
    name: 'مستشفى الجمهورية التعليمي',
    type: 'مستشفى حكومي',
    location: 'عدن - خور مكسر',
    phone: '02233333',
    status: 'نشط',
    lat: 12.8167,
    lng: 45.0333
  },
  {
    id: 'c3',
    name: 'مستشفى المتوكل التخصصي',
    type: 'مستشفى خاص',
    location: 'صنعاء - شارع بغداد',
    phone: '01444555',
    status: 'نشط',
    lat: 15.3400,
    lng: 44.1900
  },
  {
    id: 'c4',
    name: 'مركز الأمل للأورام',
    type: 'مركز تخصصي',
    location: 'تعز - المظفر',
    phone: '04211222',
    status: 'نشط',
    lat: 13.5800,
    lng: 44.0100
  }
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'mr1',
    patientYhid: 'YHID-2026-000123',
    date: '2026-03-15',
    doctorName: 'د. محمد القاضي',
    diagnosis: 'التهاب الشعب الهوائية',
    prescription: 'أوجمنتين 1جم - حبة كل 12 ساعة',
    hospitalName: 'مستشفى الثورة',
    type: 'Condition'
  },
  {
    id: 'mr2',
    patientYhid: 'YHID-2026-000123',
    date: '2026-02-10',
    doctorName: 'د. ريم الصبري',
    diagnosis: 'فحص دوري للسكري',
    prescription: 'جلوكوفاج 500 ملجم - حبة بعد العشاء',
    hospitalName: 'مركز السكري التخصصي',
    type: 'Observation'
  }
];

export const MOCK_DOCTORS = [
  {
    id: "d1",
    name: "د. خالد العبسي",
    specialty: "قلب وأوعية دموية",
    clinic: "مستشفى الثورة العام",
    phone: "777111222",
    location: "صنعاء",
    experience: "أكثر من 10 سنوات",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "d2",
    name: "د. سارة اليافعي",
    specialty: "باطنية",
    clinic: "مركز الأمل الطبي",
    phone: "777333444",
    location: "عدن",
    experience: "5-10 سنوات",
    createdAt: "2026-01-02T00:00:00Z"
  },
  {
    id: "d3",
    name: "د. محمد الحيمي",
    specialty: "أطفال",
    clinic: "مستشفى السبعين",
    phone: "777555666",
    location: "صنعاء",
    experience: "3-5 سنوات",
    createdAt: "2026-01-03T00:00:00Z"
  }
];
