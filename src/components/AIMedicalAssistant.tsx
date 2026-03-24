import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Send, 
  User, 
  AlertCircle, 
  Activity, 
  Stethoscope, 
  MapPin, 
  History, 
  ChevronLeft, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Search,
  IdCard,
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI, Type } from "@google/genai";
import { mockDataService } from "../services/mockDataService";

const AIMedicalAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const commonSymptoms = [
    "صداع", "حمى", "سعال", "ألم في الصدر", "ضيق تنفس", 
    "غثيان", "إرهاق", "ألم مفاصل", "طفح جلدي", "إسهال"
  ];

  useEffect(() => {
    if (selectedPatient) {
      fetchHistory();
    }
  }, [selectedPatient]);

  const fetchHistory = () => {
    if (!selectedPatient) return;
    const reports = mockDataService.getAIReportsByPatientYhid(selectedPatient.yhid);
    setHistory(reports);
  };

  const handlePatientSearch = (val: string) => {
    setPatientSearch(val);
    if (val.length > 1) {
      const results = mockDataService.searchPatients(val);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
    setShowSearchResults(false);
    setAnalysisResult(null);
    setInput("");
    setSelectedSymptoms([]);
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = async () => {
    if (!input && selectedSymptoms.length === 0) return;
    if (!selectedPatient) {
      alert('يرجى اختيار مريض أولاً للبدء بالتحليل.');
      return;
    }
    
    if (!isOnline) {
      alert('التحليل الذكي يتطلب اتصالاً بالإنترنت. يرجى التحقق من اتصالك.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Fetch patient context
      const patientRecords = mockDataService.getRecordsByPatientYhid(selectedPatient.yhid);
      const patientPrescriptions = mockDataService.getPrescriptionsByPatientYhid(selectedPatient.yhid);
      
      const context = `
        Patient Context (YHID: ${selectedPatient.yhid}):
        Name: ${selectedPatient.name}
        Age: ${selectedPatient.age}
        Gender: ${selectedPatient.gender}
        Blood Type: ${selectedPatient.bloodType}
        
        Medical History:
        ${patientRecords.map(r => `- ${r.date}: ${r.diagnosis} (${r.type})`).join('\n')}
        
        Current/Recent Prescriptions:
        ${patientPrescriptions.map(p => `- ${new Date(p.issuedAt).toLocaleDateString('ar-YE')}: ${p.notes} - Medications: ${p.medications.map((m: any) => m.name).join(', ')}`).join('\n')}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `
        Analyze the following symptoms for a patient in Yemen, considering their medical history.
        
        ${context}
        
        Current Symptoms: ${input}
        Selected Symptoms: ${selectedSymptoms.join(", ")}
        
        Provide a structured medical analysis in Arabic.
        Include:
        1. Top 3 possible conditions.
        2. Risk level (low, medium, high).
        3. Urgency (normal, urgent, emergency).
        4. Recommended specialty.
        5. Brief advice considering their history.
        
        IMPORTANT: Add a clear warning that this is not a final diagnosis.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["name", "description"]
                }
              },
              riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
              urgency: { type: Type.STRING, enum: ["normal", "urgent", "emergency"] },
              specialty: { type: Type.STRING },
              advice: { type: Type.STRING }
            },
            required: ["conditions", "riskLevel", "urgency", "specialty", "advice"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setAnalysisResult(result);

      // Save to Mock Service
      const reportData = {
        patientYhid: selectedPatient.yhid,
        patientName: selectedPatient.name,
        symptoms: input,
        selectedSymptoms,
        result,
        timestamp: new Date().toISOString()
      };
      mockDataService.addAIReport(reportData);
      fetchHistory();

    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency": return "bg-rose-500 text-white";
      case "urgent": return "bg-amber-500 text-white";
      default: return "bg-emerald-500 text-white";
    }
  };

  return (
    <div className="flex flex-col" dir="rtl">
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8 overflow-y-auto pb-32">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Bot size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">المساعد الطبي الذكي</h2>
              <p className="text-xs text-slate-500 font-bold">تحليل الأعراض المدعوم بالذكاء الاصطناعي و YHID</p>
            </div>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            disabled={!selectedPatient}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 relative disabled:opacity-30"
          >
            <History size={24} />
            {history.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />}
          </button>
        </div>

        {/* Patient Selection */}
        <div className="relative">
          <div className="gov-card p-6 space-y-4">
            <div className="flex items-center gap-3 text-gov-blue mb-2">
              <IdCard size={20} />
              <h3 className="font-black text-sm">اختيار المريض (YHID)</h3>
            </div>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                value={patientSearch}
                onChange={(e) => handlePatientSearch(e.target.value)}
                placeholder="ابحث عن المريض بالاسم أو رقم YHID..."
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gov-blue transition-all font-bold"
              />
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className="w-full text-right p-4 hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="font-black text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{p.yhid}</p>
                    </div>
                    <ChevronLeft size={16} className="text-slate-300" />
                  </button>
                ))}
              </div>
            )}

            {selectedPatient && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-indigo-900">{selectedPatient.name}</p>
                    <p className="text-xs text-indigo-600 font-mono">{selectedPatient.yhid}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-white rounded-lg text-indigo-400"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Safety Warning */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <p className="text-xs font-bold text-amber-900 leading-relaxed">
            تنبيه: هذا النظام يقدم اقتراحات طبية أولية بناءً على الذكاء الاصطناعي فقط. لا يعتبر هذا تشخيصاً نهائياً ولا يغني عن استشارة الطبيب المختص. في الحالات الطارئة، يرجى التوجه فوراً لأقرب مستشفى.
          </p>
        </div>

        {/* Input Section */}
        <section className={`space-y-6 transition-opacity ${!selectedPatient ? "opacity-30 pointer-events-none" : ""}`}>
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900">بماذا يشعر المريض؟</h2>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="صف الأعراض بالتفصيل..."
              className="w-full p-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px] font-bold text-slate-700"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-500">أعراض شائعة (اختر ما ينطبق):</h3>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={analyzeSymptoms}
            disabled={isAnalyzing || (!input && selectedSymptoms.length === 0)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                جاري تحليل الأعراض مع السجل الطبي...
              </>
            ) : (
              <>
                <Activity size={20} />
                بدء التحليل الذكي المتكامل
              </>
            )}
          </button>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {analysisResult && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">نتائج التحليل لـ {selectedPatient?.name}</h2>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getUrgencyColor(analysisResult.urgency)}`}>
                  {analysisResult.urgency === "emergency" ? "حالة طارئة" : analysisResult.urgency === "urgent" ? "حالة عاجلة" : "حالة عادية"}
                </div>
              </div>

              {analysisResult.urgency === "emergency" && (
                <div className="bg-rose-600 text-white p-6 rounded-2xl space-y-4 shadow-xl shadow-rose-900/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={32} />
                    <h3 className="text-xl font-black">⚠️ توجه فوراً إلى أقرب مستشفى</h3>
                  </div>
                  <p className="font-bold text-sm opacity-90">
                    الأعراض التي ذكرتها تشير إلى حالة قد تكون خطيرة. يرجى عدم الانتظار والتوجه لأقرب قسم طوارئ.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="gov-card p-6 space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <Stethoscope size={24} />
                    <h3 className="font-black">الحالات المحتملة</h3>
                  </div>
                  <div className="space-y-4">
                    {analysisResult.conditions.map((c: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-black text-slate-900 text-sm">{c.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="gov-card p-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <User size={24} />
                      <h3 className="font-black">التخصص الموصى به</h3>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="font-black text-emerald-900">{analysisResult.specialty}</p>
                    </div>
                  </div>

                  <div className="gov-card p-6 space-y-4">
                    <div className="flex items-center gap-3 text-blue-600">
                      <Info size={24} />
                      <h3 className="font-black">نصيحة مخصصة</h3>
                    </div>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed">
                      {analysisResult.advice}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900">سجل التحليلات لـ {selectedPatient?.name}</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <History className="mx-auto text-slate-300" size={48} />
                    <p className="text-sm font-bold text-slate-400">لا يوجد سجلات سابقة لهذا المريض</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setAnalysisResult(item.result);
                        setInput(item.symptoms);
                        setSelectedSymptoms(item.selectedSymptoms || []);
                        setShowHistory(false);
                      }}
                      className="w-full text-right p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('ar-YE')}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getUrgencyColor(item.result.urgency)}`} />
                      </div>
                      <p className="text-sm font-black text-slate-800 line-clamp-1">{item.symptoms || item.selectedSymptoms?.join(", ")}</p>
                      <p className="text-xs text-indigo-600 font-bold mt-1">{item.result.specialty}</p>
                    </button>
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIMedicalAssistant;
