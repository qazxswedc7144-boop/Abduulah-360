import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Video, 
  Image as ImageIcon, 
  Scan, 
  Mic, 
  Search, 
  MapPin, 
  Sparkles, 
  Brain, 
  Volume2,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Send,
  Upload,
  Play,
  Download,
  Settings
} from "lucide-react";
import { 
  chatWithAI, 
  fastAIResponse, 
  analyzeMedia, 
  generateImagePro, 
  nanoBananaEdit, 
  generateVideoVeo, 
  generateSpeech 
} from "../services/geminiService";
import AIVoiceLive from "./AIVoiceLive";

// API Key Selection Component
const APIKeySelector: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      onKeySelected();
    }
  };

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Settings size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">إعداد مفتاح API</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          تتطلب ميزات توليد الصور والفيديو المتقدمة استخدام مفتاح API مدفوع. يرجى اختيار مفتاحك للمتابعة.
        </p>
        <button 
          onClick={handleOpenSelector}
          className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          اختيار مفتاح API
        </button>
        <p className="mt-4 text-xs text-slate-400">
          يمكنك الحصول على مفتاح من <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-emerald-600 underline">وثائق الفوترة</a>.
        </p>
      </motion.div>
    </div>
  );
};

const AICenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hub' | 'chat' | 'video' | 'image' | 'vision' | 'voice'>('hub');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [input, setInput] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Chat Options
  const [chatOptions, setChatOptions] = useState({
    useSearch: false,
    useMaps: false,
    useThinking: false,
    isFast: false
  });

  // Image Options
  const [imageOptions, setImageOptions] = useState({
    aspectRatio: "1:1",
    isEdit: false
  });

  // Video Options
  const [videoOptions, setVideoOptions] = useState({
    aspectRatio: "16:9" as '16:9' | '9:16'
  });

  const [showVoiceLive, setShowVoiceLive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleChat = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (chatOptions.isFast) {
        const text = await fastAIResponse(input);
        setResult({ text });
      } else {
        const res = await chatWithAI(input, chatOptions);
        setResult(res);
      }
    } catch (error) {
      console.error(error);
      setResult({ error: "حدث خطأ أثناء معالجة الطلب." });
    } finally {
      setLoading(false);
    }
  };

  const handleVision = async () => {
    if (!input.trim() || !mediaFile) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(mediaFile);
      const text = await analyzeMedia(input, [{ data: base64, mimeType: mediaFile.type }]);
      setResult({ text });
    } catch (error) {
      console.error(error);
      setResult({ error: "حدث خطأ أثناء تحليل الوسائط." });
    } finally {
      setLoading(false);
    }
  };

  const handleImageGen = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      let base64;
      if (imageOptions.isEdit) {
        const baseImg = mediaFile ? { data: await fileToBase64(mediaFile), mimeType: mediaFile.type } : undefined;
        base64 = await nanoBananaEdit(input, baseImg);
      } else {
        base64 = await generateImagePro(input, imageOptions.aspectRatio);
      }
      setResult({ image: `data:image/png;base64,${base64}` });
    } catch (error) {
      console.error(error);
      setResult({ error: "حدث خطأ أثناء توليد الصورة." });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoGen = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const img = mediaFile ? { data: await fileToBase64(mediaFile), mimeType: mediaFile.type } : undefined;
      const videoUrl = await generateVideoVeo(input, { image: img, aspectRatio: videoOptions.aspectRatio });
      setResult({ video: videoUrl });
    } catch (error) {
      console.error(error);
      setResult({ error: "حدث خطأ أثناء توليد الفيديو." });
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async (text: string) => {
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.play();
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  const renderHub = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { id: 'chat', title: 'مساعد ذكي', desc: 'دردشة مع بحث وخرائط وتفكير عميق', icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
        { id: 'vision', title: 'تحليل الصور والفيديو', desc: 'افهم محتوى ملفاتك المرئية بدقة', icon: Scan, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'image', title: 'توليد الصور', desc: 'حول خيالك إلى صور واقعية بأبعاد مختلفة', icon: ImageIcon, color: 'bg-amber-50 text-amber-600' },
        { id: 'video', title: 'توليد الفيديو', desc: 'أنشئ فيديوهات سينمائية من النصوص أو الصور', icon: Video, color: 'bg-rose-50 text-rose-600' },
        { id: 'voice', title: 'المحادثة الصوتية', desc: 'تحدث مع الذكاء الاصطناعي في الوقت الفعلي', icon: Mic, color: 'bg-indigo-50 text-indigo-600', isLive: true }
      ].map((item) => (
        <motion.button
          key={item.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { 
            if ((item as any).isLive) {
              setShowVoiceLive(true);
            } else {
              setActiveTab(item.id as any); 
              setResult(null); 
              setInput(""); 
              setMediaFile(null); 
              setPreviewUrl(null); 
            }
          }}
          className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-right flex flex-col gap-4 group transition-all hover:shadow-md"
        >
          <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
            <item.icon size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">{item.desc}</p>
          </div>
          <div className="mt-auto pt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm">
            ابدأ الآن <ChevronRight size={16} />
          </div>
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-[80vh]">
      <APIKeySelector onKeySelected={() => window.location.reload()} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="text-emerald-500" />
            مركز الذكاء الاصطناعي (AI Hub)
          </h1>
          <p className="text-slate-500 mt-1">استخدم أحدث تقنيات Gemini لتعزيز تجربتك الصحية</p>
        </div>
        {activeTab !== 'hub' && (
          <button 
            onClick={() => setActiveTab('hub')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold"
          >
            <ArrowLeft size={18} /> العودة للمركز
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showVoiceLive && <AIVoiceLive onClose={() => setShowVoiceLive(false)} />}
        {activeTab === 'hub' ? (
          <motion.div key="hub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {renderHub()}
          </motion.div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
            {/* Sidebar / Options */}
            <div className="w-full lg:w-80 bg-slate-50 p-8 border-l border-slate-100 space-y-8">
              <h2 className="text-xl font-bold text-slate-900">إعدادات {activeTab === 'chat' ? 'الدردشة' : activeTab === 'image' ? 'الصور' : activeTab === 'video' ? 'الفيديو' : 'التحليل'}</h2>
              
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                    <input type="checkbox" checked={chatOptions.useSearch} onChange={e => setChatOptions({...chatOptions, useSearch: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Search size={18} className="text-blue-500" /> بحث جوجل
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                    <input type="checkbox" checked={chatOptions.useMaps} onChange={e => setChatOptions({...chatOptions, useMaps: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <MapPin size={18} className="text-emerald-500" /> خرائط جوجل
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                    <input type="checkbox" checked={chatOptions.useThinking} onChange={e => setChatOptions({...chatOptions, useThinking: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Brain size={18} className="text-indigo-500" /> تفكير عميق (High)
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                    <input type="checkbox" checked={chatOptions.isFast} onChange={e => setChatOptions({...chatOptions, isFast: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      استجابة سريعة (Lite)
                    </div>
                  </label>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-3">أبعاد الصورة</p>
                    <select 
                      value={imageOptions.aspectRatio} 
                      onChange={e => setImageOptions({...imageOptions, aspectRatio: e.target.value})}
                      className="w-full p-3 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(ratio => (
                        <option key={ratio} value={ratio}>{ratio}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-emerald-500 transition-all">
                    <input type="checkbox" checked={imageOptions.isEdit} onChange={e => setImageOptions({...imageOptions, isEdit: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      تعديل صورة موجودة
                    </div>
                  </label>
                </div>
              )}

              {activeTab === 'video' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-3">أبعاد الفيديو</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['16:9', '9:16'].map(ratio => (
                        <button 
                          key={ratio}
                          onClick={() => setVideoOptions({ aspectRatio: ratio as any })}
                          className={`p-3 rounded-xl border text-sm font-bold transition-all ${videoOptions.aspectRatio === ratio ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}
                        >
                          {ratio === '16:9' ? 'عرضي' : 'طولي'} ({ratio})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'vision' || (activeTab === 'image' && imageOptions.isEdit) || activeTab === 'video') && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-700">تحميل ملف</p>
                  <label className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden relative">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="text-slate-400" />
                        <span className="text-xs text-slate-500">اختر صورة أو فيديو</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                  </label>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 flex flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto max-h-[500px] p-4">
                {result ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {result.text && (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-800 leading-relaxed whitespace-pre-wrap relative group">
                        {result.text}
                        <button 
                          onClick={() => handleTTS(result.text)}
                          className="absolute top-4 left-4 p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>
                    )}
                    {result.image && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg">
                        <img src={result.image} alt="Generated" className="w-full h-auto" />
                        <a href={result.image} download="ai-image.png" className="flex items-center justify-center gap-2 p-4 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all">
                          <Download size={18} /> تحميل الصورة
                        </a>
                      </div>
                    )}
                    {result.video && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg">
                        <video src={result.video} controls className="w-full h-auto" />
                        <a href={result.video} download="ai-video.mp4" className="flex items-center justify-center gap-2 p-4 bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all">
                          <Download size={18} /> تحميل الفيديو
                        </a>
                      </div>
                    )}
                    {result.grounding?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">المصادر والمراجع</p>
                        <div className="flex flex-wrap gap-2">
                          {result.grounding.map((chunk: any, i: number) => (
                            chunk.web && (
                              <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition-all">
                                {chunk.web.title}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                    {result.error && (
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-bold text-center">
                        {result.error}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Sparkles size={64} className="opacity-20" />
                    <p className="font-medium">أدخل طلبك في الأسفل للبدء</p>
                  </div>
                )}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-emerald-600" size={48} />
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="اكتب طلبك هنا..."
                    className="w-full p-6 pr-16 bg-slate-50 rounded-[24px] border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none min-h-[100px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (activeTab === 'chat') handleChat();
                        if (activeTab === 'vision') handleVision();
                        if (activeTab === 'image') handleImageGen();
                        if (activeTab === 'video') handleVideoGen();
                      }
                    }}
                  />
                  <button 
                    disabled={loading || !input.trim()}
                    onClick={() => {
                      if (activeTab === 'chat') handleChat();
                      if (activeTab === 'vision') handleVision();
                      if (activeTab === 'image') handleImageGen();
                      if (activeTab === 'video') handleVideoGen();
                    }}
                    className="absolute bottom-4 left-4 w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICenter;
