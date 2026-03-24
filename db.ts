import Database from 'better-sqlite3';

const db = new Database('yemen_health.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    id_number TEXT UNIQUE,
    birth_date DATE,
    gender TEXT,
    phone TEXT,
    address TEXT,
    blood_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT,
    phone TEXT,
    email TEXT,
    clinic_address TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    appointment_date DATETIME,
    status TEXT DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT,
    prescription TEXT,
    lab_results TEXT,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS clinics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT, -- Hospital, Clinic, Health Center
    latitude REAL,
    longitude REAL,
    address TEXT
  );
`);

// Seed initial data if empty
const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
if (patientCount.count === 0) {
  db.prepare('INSERT INTO patients (name, id_number, birth_date, gender, phone, address, blood_type) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'أحمد محمد علي', '1012345678', '1985-05-15', 'Male', '777123456', 'صنعاء - شارع حدة', 'A+'
  );
  db.prepare('INSERT INTO patients (name, id_number, birth_date, gender, phone, address, blood_type) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'سارة عبدالله حسن', '2023456789', '1992-10-20', 'Female', '733987654', 'عدن - المنصورة', 'O-'
  );
  
  db.prepare('INSERT INTO doctors (name, specialty, phone, email, clinic_address) VALUES (?, ?, ?, ?, ?)').run(
    'د. خالد اليافعي', 'قلب وأوعية دموية', '711223344', 'khaled@health.ye', 'مستشفى الثورة - صنعاء'
  );
  db.prepare('INSERT INTO doctors (name, specialty, phone, email, clinic_address) VALUES (?, ?, ?, ?, ?)').run(
    'د. منى الصبري', 'نساء وتوليد', '700556677', 'muna@health.ye', 'مجمع عدن الطبي'
  );

  db.prepare('INSERT INTO clinics (name, type, latitude, longitude, address) VALUES (?, ?, ?, ?, ?)').run(
    'مستشفى الثورة العام', 'Hospital', 15.3533, 44.2075, 'صنعاء'
  );
  db.prepare('INSERT INTO clinics (name, type, latitude, longitude, address) VALUES (?, ?, ?, ?, ?)').run(
    'مستشفى الجمهورية', 'Hospital', 12.8256, 45.0353, 'عدن'
  );
}

export default db;
