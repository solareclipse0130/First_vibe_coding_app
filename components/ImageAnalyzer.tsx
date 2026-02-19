import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { analyzeImage, fileToBase64 } from '../services/geminiService';

export const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setImage(base64);
        setMimeType(file.type);
        setAnalysis('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysis('');
    try {
      const text = await analyzeImage(image, mimeType, prompt);
      setAnalysis(text);
    } catch (err) {
      setAnalysis("Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-900/30 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <h2 className="text-3xl font-bold text-blue-200 mb-2">Visual Intelligence</h2>
        <p className="text-slate-400">Powered by Gemini 3.0 Pro. Upload an image to detect objects, read text, or understand context.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           {/* Image Upload Area */}
            <div 
              className={`
                relative rounded-xl border-2 border-dashed h-80 flex flex-col items-center justify-center overflow-hidden transition-all
                ${image ? 'border-blue-500/50 bg-slate-900' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-blue-500 cursor-pointer'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <>
                  <img src={`data:${mimeType};base64,${image}`} alt="To Analyze" className="w-full h-full object-contain" />
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs text-white">Click to change</div>
                </>
              ) : (
                <div className="text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="font-medium text-slate-300">Upload Photo</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* Controls */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <label className="block text-sm font-medium text-slate-400 mb-2">Custom Question (Optional)</label>
               <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., What are the ingredients in this dish?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none mb-4"
               />
               <Button 
                onClick={handleAnalyze} 
                disabled={!image} 
                isLoading={loading}
                className="w-full"
                variant="primary"
              >
                {prompt ? 'Ask Gemini' : 'Analyze Image'}
              </Button>
            </div>
        </div>

        {/* Results Area */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 h-[500px] overflow-y-auto shadow-inner relative">
           <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4 sticky top-0 bg-slate-900 pb-2 border-b border-slate-800">
             Analysis Results
           </h3>
           
           {loading ? (
             <div className="space-y-4 animate-pulse mt-8">
               <div className="h-2 bg-slate-700 rounded w-3/4"></div>
               <div className="h-2 bg-slate-700 rounded w-full"></div>
               <div className="h-2 bg-slate-700 rounded w-5/6"></div>
               <div className="h-2 bg-slate-700 rounded w-4/5"></div>
               <div className="mt-8 flex justify-center">
                  <span className="text-blue-400 text-sm">Thinking...</span>
               </div>
             </div>
           ) : analysis ? (
             <div className="prose prose-invert prose-sm max-w-none">
               <p className="whitespace-pre-wrap leading-relaxed text-slate-200">
                 {analysis}
               </p>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.414l5 5a1 1 0 01.414 1.414V19a2 2 0 01-2 2z" /></svg>
                <p>Results will appear here</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
