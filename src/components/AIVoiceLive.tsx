import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, VolumeX, Loader2, X, Sparkles } from "lucide-react";

const AIVoiceLive: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [aiTranscription, setAiTranscription] = useState("");
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const API_KEY = process.env.GEMINI_API_KEY || "";

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "أنت مساعد طبي ذكي في نظام جسر الصحة اليمني. تحدث باللغة العربية بوضوح وودية. ساعد المستخدمين في استفساراتهم الطبية والصحية.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Audio);
              const bytes = new Int16Array(binaryString.length / 2);
              for (let i = 0; i < bytes.length; i++) {
                bytes[i] = (binaryString.charCodeAt(i * 2) & 0xFF) | (binaryString.charCodeAt(i * 2 + 1) << 8);
              }
              audioQueueRef.current.push(bytes);
              if (!isPlayingRef.current) playNextChunk();
            }

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }

            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              setAiTranscription(prev => prev + " " + message.serverContent?.modelTurn?.parts[0]?.text);
            }
          },
          onclose: () => {
            stopMic();
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to connect to Live API:", error);
      setIsConnecting(false);
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      console.error("Mic Error:", error);
    }
  };

  const stopMic = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
  };

  const playNextChunk = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;
    const floatData = new Float32Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      floatData[i] = chunk[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = playNextChunk;
    source.start();
  };

  useEffect(() => {
    startSession();
    return () => {
      sessionRef.current?.close();
      stopMic();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[40px] p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-all">
          <X size={24} />
        </button>

        <div className="mb-8">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            {isConnected && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-indigo-400 rounded-full"
              />
            )}
            <Mic size={40} className="relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">المحادثة الصوتية المباشرة</h2>
          <p className="text-slate-500 mt-2">تحدث مع المساعد الذكي في الوقت الفعلي</p>
        </div>

        <div className="min-h-[120px] bg-slate-50 rounded-3xl p-6 mb-8 text-right overflow-y-auto max-h-[200px]">
          {isConnecting ? (
            <div className="flex items-center justify-center h-full gap-3 text-slate-400">
              <Loader2 className="animate-spin" /> جاري الاتصال...
            </div>
          ) : (
            <div className="space-y-4">
              {aiTranscription && (
                <div className="text-indigo-600 font-medium leading-relaxed">
                  <Sparkles size={14} className="inline mr-1" /> {aiTranscription}
                </div>
              )}
              {!aiTranscription && !transcription && (
                <p className="text-slate-300 italic text-center py-4">ابدأ التحدث الآن...</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
          
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
          >
            إنهاء المحادثة
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AIVoiceLive;
