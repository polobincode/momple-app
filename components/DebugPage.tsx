import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, RefreshCw, Terminal, Server, MessageCircle } from 'lucide-react';
import { getParentingAdvice } from '../services/geminiService';
import { auth } from '../services/firebaseConfig';

const DebugPage = () => {
  const navigate = useNavigate();
  const [geminiStatus, setGeminiStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [geminiMsg, setGeminiMsg] = useState('');
  
  const [kakaoStatus, setKakaoStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [kakaoMsg, setKakaoMsg] = useState('');

  const [firebaseStatus, setFirebaseStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [firebaseMsg, setFirebaseMsg] = useState('');

  const [hostname, setHostname] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setHostname(window.location.hostname);
    setOrigin(window.location.origin);
    runTests();
  }, []);

  const runTests = async () => {
    // 1. Firebase Config Check
    try {
        if (auth.app.options.apiKey) {
            setFirebaseStatus('success');
            setFirebaseMsg(`API Key present. Project: ${auth.app.options.projectId}`);
        } else {
            setFirebaseStatus('error');
            setFirebaseMsg('API Key missing in config');
        }
    } catch (e: any) {
        setFirebaseStatus('error');
        setFirebaseMsg(e.message);
    }

    // 2. Kakao SDK Check
    try {
        if (window.Kakao && window.Kakao.isInitialized()) {
            setKakaoStatus('success');
            setKakaoMsg('Kakao SDK Initialized');
        } else {
            setKakaoStatus('error');
            setKakaoMsg('Window.Kakao not found or not initialized');
        }
    } catch (e: any) {
        setKakaoStatus('error');
        setKakaoMsg(e.message);
    }

    // 3. Gemini API Check (Actual Call)
    setGeminiStatus('pending');
    try {
        const res = await getParentingAdvice("테스트");
        if (res && !res.includes("오류") && !res.includes("필요")) {
            setGeminiStatus('success');
            setGeminiMsg('Response received: ' + res.substring(0, 20) + '...');
        } else {
            setGeminiStatus('error');
            setGeminiMsg(res);
        }
    } catch (e: any) {
        setGeminiStatus('error');
        setGeminiMsg(e.message);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
      if (status === 'pending') return <RefreshCw size={18} className="animate-spin text-gray-400" />;
      if (status === 'success') return <Check size={18} className="text-green-500" />;
      return <X size={18} className="text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-mono text-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white"><ArrowLeft /></button>
            <h1 className="font-bold text-lg flex items-center gap-2">
                <Terminal size={20} /> System Debug
            </h1>
        </div>

        <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xs font-bold text-gray-500 uppercase mb-2">Environment</h2>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span>Hostname</span>
                        <span className="text-yellow-400 font-bold">{hostname}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-xs">Full Origin (Register this in Kakao):</span>
                        <span className="text-blue-300 font-bold break-all bg-gray-900 p-2 rounded">{origin}</span>
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-3 border-t border-gray-700 pt-2">
                    * If login fails with KOE009, add the Origin above to: <br/>
                    Kakao Developers > My App > Platform > Web > Site Domain
                </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xs font-bold text-gray-500 uppercase mb-4">Integrations Status</h2>
                
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                <Server size={14} /> Firebase Auth
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{firebaseMsg}</p>
                        </div>
                        <StatusIcon status={firebaseStatus} />
                    </div>
                    <hr className="border-gray-700" />
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                <MessageCircle size={14} /> Kakao SDK
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{kakaoMsg}</p>
                        </div>
                        <StatusIcon status={kakaoStatus} />
                    </div>
                    <hr className="border-gray-700" />

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                <span>🤖</span> Gemini API
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{geminiMsg}</p>
                        </div>
                        <StatusIcon status={geminiStatus} />
                    </div>
                </div>
            </div>

            <button 
                onClick={runTests} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                <RefreshCw size={16} /> Re-run Tests
            </button>
        </div>
    </div>
  );
};

export default DebugPage;