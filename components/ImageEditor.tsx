import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { editImage, fileToBase64 } from '../services/geminiService';

export const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setOriginalImage(base64);
        setMimeType(file.type);
        setEditedImage(null);
        setError(null);
      } catch (err) {
        setError("Failed to read file.");
      }
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) return;

    setLoading(true);
    setError(null);

    try {
      const result = await editImage(originalImage, mimeType, prompt);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong while editing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-purple-900/30 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <h2 className="text-3xl font-bold text-purple-200 mb-2">Magic Image Editor</h2>
        <p className="text-slate-400">Powered by Gemini 2.5 Flash Image. Describe how you want to change your photo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Input Section */}
        <div className="space-y-4">
            <div className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all h-[300px] flex flex-col items-center justify-center
              ${originalImage ? 'border-purple-500/50 bg-slate-800/50' : 'border-slate-600 hover:border-purple-500 hover:bg-slate-800/30 cursor-pointer'}
            `} onClick={() => !originalImage && fileInputRef.current?.click()}>
              
              {originalImage ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg group">
                   <img src={`data:${mimeType};base64,${originalImage}`} alt="Original" className="max-w-full max-h-full object-contain" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Change Image</Button>
                   </div>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-slate-300 font-medium">Click to upload an image</p>
                  <p className="text-slate-500 text-sm mt-1">JPG, PNG supported</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-2">Instructions</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 'Make it look like a van gogh painting', 'Add a cat in the foreground', 'Turn the day into night'..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none h-24 resize-none"
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleGenerate} 
                  disabled={!originalImage || !prompt.trim()} 
                  isLoading={loading}
                  className="w-full md:w-auto"
                >
                  Generate Edit
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                Error: {error}
              </div>
            )}
        </div>

        {/* Output Section */}
        <div className="flex flex-col h-full">
            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[300px] lg:h-auto min-h-[300px]">
              <div className="bg-slate-800/80 p-3 border-b border-slate-700 flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-300">Result</span>
                 {editedImage && (
                   <a href={editedImage} download="gemini-edit.png" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     Download
                   </a>
                 )}
              </div>
              <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-purple-300 animate-pulse">Dreaming up your image...</p>
                  </div>
                ) : editedImage ? (
                  <img src={editedImage} alt="Edited" className="max-w-full max-h-full rounded shadow-lg object-contain" />
                ) : (
                  <div className="text-center text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>Edited image will appear here</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
