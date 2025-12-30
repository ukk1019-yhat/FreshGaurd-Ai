import React, { useState, useRef } from 'react';
import { Camera, Mic, Type as TypeIcon, Loader2, Save, X } from 'lucide-react';
import { parseItemFromText, parseItemFromImage } from '../services/geminiService';
import { InventoryItem, Category } from '../types';
import { v4 as uuidv4 } from 'uuid'; // We'll implement a simple ID generator in utils actually, but for now assuming uuid-like strings

interface AddItemProps {
  onAdd: (item: InventoryItem) => void;
  onCancel: () => void;
}

const AddItem: React.FC<AddItemProps> = ({ onAdd, onCancel }) => {
  const [mode, setMode] = useState<'manual' | 'voice' | 'camera'>('manual');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Other');
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Helper to generate IDs (simplified)
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const handleSmartParse = (data: Partial<InventoryItem>) => {
    if (data.name) setName(data.name);
    if (data.category) setCategory(data.category);
    if (data.expiryDate) setDate(data.expiryDate);
    if (data.quantity) setQuantity(data.quantity);
    if (data.notes) setNotes(data.notes);
    setConfidence(data.confidenceLevel);
    setMode('manual'); // Switch to manual for review
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error", err);
      alert("Unable to access camera.");
      setMode('manual');
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    
    // Stop stream
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    
    setPreviewImage(base64);
    setLoading(true);
    
    const result = await parseItemFromImage(base64.split(',')[1]);
    setLoading(false);
    handleSmartParse(result);
  };

  const handleVoiceInput = async () => {
    // Simulating voice recording by using window.prompt or a simple text area for "transcribed" text 
    // since actual Speech-to-Text requires more complex browser API handling or cloud services.
    // For this demo, we assume the transcription is passed to the AI.
    const text = prompt("Speak now (or type what you would say):", "I bought 2 liters of Milk today, it expires next Friday.");
    if (text) {
        setLoading(true);
        const results = await parseItemFromText(text);
        setLoading(false);
        if (results.length > 0) handleSmartParse(results[0]);
    } else {
        setMode('manual');
    }
  };

  // Effect to manage camera stream lifecycle
  React.useEffect(() => {
    if (mode === 'camera') startCamera();
    else {
      stream?.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    return () => stream?.getTracks().forEach(t => t.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: generateId(),
      name,
      category,
      quantity,
      addedDate: new Date().toISOString(),
      expiryDate: date,
      status: 'Fresh', // Initial status
      confidenceLevel: confidence,
      notes
    };
    onAdd(newItem);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm min-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Add Item</h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600"><X /></button>
      </div>

      {/* Mode Switcher */}
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${mode === 'manual' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <TypeIcon size={18} /> <span>Manual</span>
        </button>
        <button 
          onClick={() => setMode('camera')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${mode === 'camera' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <Camera size={18} /> <span>Scan</span>
        </button>
        <button 
          onClick={() => { setMode('voice'); handleVoiceInput(); }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${mode === 'voice' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <Mic size={18} /> <span>Voice</span>
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary mb-2" size={48} />
          <p className="text-slate-500 animate-pulse">AI is analyzing...</p>
        </div>
      )}

      {mode === 'camera' && !loading && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] mb-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <button 
            onClick={captureImage}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-lg flex items-center justify-center hover:bg-slate-50"
          >
            <div className="w-12 h-12 bg-primary rounded-full" />
          </button>
        </div>
      )}

      {mode === 'manual' && !loading && (
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g., Milk"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              >
                {['Dairy', 'Vegetable', 'Fruit', 'Meat', 'Pantry', 'Beverage', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input 
                type="text" 
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g., 1L"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
            <div className="relative">
              <input 
                required
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${confidence && confidence < 0.7 ? 'border-orange-300 bg-orange-50' : 'border-slate-200'}`}
              />
              {confidence !== undefined && (
                <span className={`absolute right-3 top-3 text-xs px-2 py-0.5 rounded-full ${confidence > 0.8 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {confidence > 0.8 ? 'High Confidence' : 'Estimated'}
                </span>
              )}
            </div>
            {notes && <p className="text-xs text-slate-500 mt-1">AI Tip: {notes}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 mt-auto"
          >
            <Save size={20} />
            <span>Save Item</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default AddItem;