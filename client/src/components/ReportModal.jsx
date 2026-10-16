import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, ShieldCheck, EyeOff, Check, AlertTriangle, MapPin } from 'lucide-react';
import { AIT_LOCATIONS, CATEGORIES } from '../constants/aitData';

const SAMPLE_PRESETS = [
  { id: 'id-card', label: 'Student ID Card', category: 'ID Cards', title: 'AIT Student ID Card', hint: 'Specify roll number ending & sticker color.' },
  { id: 'calculator', label: 'Casio Calculator', category: 'Electronics', title: 'Casio fx-991CW Calculator', hint: 'Marker inscription inside lid.' },
  { id: 'wallet', label: 'Leather Wallet', category: 'Keys & Wallets', title: 'Leather Bi-Fold Wallet', hint: 'Card names and rupee denominations.' },
  { id: 'keys', label: 'Hostel/Bike Keys', category: 'Keys & Wallets', title: 'Set of Brass Keys with Tag', hint: 'Carabiner color and room number tag.' },
  { id: 'earbuds', label: 'Earbuds Case', category: 'Electronics', title: 'boAt Earbuds Charging Case', hint: 'Decal sticker and case color.' },
  { id: 'sports', label: 'Sports Equipment', category: 'Sports Gear', title: 'Yonex Badminton Racket', hint: 'Grip color and string tension mark.' }
];

export default function ReportModal({ isOpen, onClose, initialType = 'found', onSubmit, currentUser }) {
  if (!isOpen) return null;

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(AIT_LOCATIONS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  
  // Anti-fraud questions
  const [verificationQuestion, setVerificationQuestion] = useState('What private identifying marks, sticker, or engraving is on this item?');
  const [privateAnswerHint, setPrivateAnswerHint] = useState('');

  // Image & Privacy Redaction states
  const [selectedPreset, setSelectedPreset] = useState('id-card');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [hasRedactedImage, setHasRedactedImage] = useState(true);
  const [redactionBoxes, setRedactionBoxes] = useState([
    { x: 25, y: 35, width: 50, height: 18 }
  ]);

  const canvasRef = useRef(null);

  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setTitle(preset.title);
    setCategory(preset.category);
    setVerificationQuestion(`What private identifying mark or detail exists on this ${preset.label}?`);
    setUploadedImage(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setSelectedPreset('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (uploadedImage) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawRedactions(ctx, width, height);
      };
      img.src = uploadedImage;
    } else {
      // Cinematic dark canvas
      ctx.fillStyle = '#101016';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, width - 4, height - 4);

      // Header
      ctx.fillStyle = '#E50914';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`AIT PUNE • [${selectedPreset.toUpperCase()}]`, 16, 26);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Campus Item Photo Surface', 24, 60);
      ctx.fillText('Student Roll No: 231049 (Confidential)', 24, 84);
      ctx.fillText('Serial No: FX-991CW-884210', 24, 108);

      drawRedactions(ctx, width, height);
    }
  }, [uploadedImage, selectedPreset, redactionBoxes, hasRedactedImage]);

  const drawRedactions = (ctx, width, height) => {
    if (!hasRedactedImage) return;

    redactionBoxes.forEach(box => {
      ctx.fillStyle = '#08080A';
      ctx.fillRect((box.x / 100) * width, (box.y / 100) * height, (box.width / 100) * width, (box.height / 100) * height);
      ctx.strokeStyle = '#E50914';
      ctx.lineWidth = 1.5;
      ctx.strokeRect((box.x / 100) * width, (box.y / 100) * height, (box.width / 100) * width, (box.height / 100) * height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('■ REDACTED', (box.x / 100) * width + 6, (box.y / 100) * height + 13);
    });
  };

  const addQuickMask = () => {
    setRedactionBoxes(prev => [
      ...prev,
      { x: 10 + Math.random() * 20, y: 20 + Math.random() * 40, width: 45, height: 16 }
    ]);
    setHasRedactedImage(true);
  };

  const clearMasks = () => {
    setRedactionBoxes([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the title and description.');
      return;
    }

    const canvas = canvasRef.current;
    const finalImageData = (uploadedImage || hasRedactedImage) && canvas ? canvas.toDataURL('image/jpeg', 0.8) : null;

    onSubmit({
      type,
      title,
      category,
      location,
      date,
      time,
      description,
      urgency,
      verificationQuestion,
      privateAnswerHint,
      imagePlaceholder: selectedPreset,
      imageData: finalImageData,
      hasRedactedImage,
      reporterName: currentUser?.name || 'AIT Member',
      reporterEmail: currentUser?.email || 'student@aitpune.edu.in',
      reporterRole: currentUser?.role || 'Student'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#121218] text-white border border-white/10 rounded-3xl w-full max-w-3xl my-6 relative max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]"></span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {type === 'found' ? 'Report Found Equipment' : 'File Lost Notice'}
              </h2>
              <p className="text-xs text-gray-400">
                AIT Pune Campus Recovery Register • Official Entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Toggle Type: Found vs Lost */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              onClick={() => setType('found')}
              className={`py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ✓ I Found an Item
            </button>
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                type === 'lost'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚠ I Lost an Item
            </button>
          </div>

          {/* Section 1: Item Details */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">
                1. Item Details &amp; Campus Location
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AIT Student ID Card, Casio fx-991CW Calculator, Wildhorn Wallet..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-dropdown text-sm text-white focus:outline-none focus:border-[#E50914]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#141419] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>AIT Campus Landmark *</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-dropdown text-sm text-white font-semibold focus:outline-none focus:border-[#E50914]"
                >
                  {AIT_LOCATIONS.map(loc => (
                    <option key={loc} value={loc} className="bg-[#141419] text-white">{loc}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Date Incident Occurred *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Approximate Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise location context (desk number, bench, room ID, color, markings, etc.)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Photo & Privacy Redaction Tool */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Photo &amp; Privacy Redaction Tool</span>
              </span>
              <span className="text-[10px] text-gray-400">
                Student Data Protection
              </span>
            </div>

            {/* Presets */}
            <div>
              <span className="block text-xs text-gray-400 mb-2">
                Choose Sample Preset or Upload Custom Image:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedPreset === p.id && !uploadedImage
                        ? 'border-[#E50914] bg-red-600/10 text-white font-bold'
                        : 'border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[10px] text-gray-400 truncate">{p.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload */}
            <div className="flex items-center gap-3">
              <label className="btn-glass px-4 py-2 text-xs rounded-xl cursor-pointer">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {uploadedImage && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Custom Image Loaded
                </span>
              )}
            </div>

            {/* Redaction Canvas Box */}
            <div className="border border-white/10 bg-white/[0.02] p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-200">
                    Privacy Redaction:
                  </span>
                  <button
                    type="button"
                    onClick={() => setHasRedactedImage(!hasRedactedImage)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      hasRedactedImage
                        ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/40'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {hasRedactedImage ? '✓ Mask Active' : 'Off (Public)'}
                  </button>
                </div>

                {hasRedactedImage && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addQuickMask}
                      className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      + Add Mask Bar
                    </button>
                    <button
                      type="button"
                      onClick={clearMasks}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Canvas Frame */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative border border-white/15 rounded-xl overflow-hidden shadow-2xl bg-black">
                  <canvas
                    ref={canvasRef}
                    width={460}
                    height={180}
                    className="max-w-full h-auto block"
                  />
                  {hasRedactedImage && (
                    <div className="absolute bottom-2.5 right-2.5 bg-[#E50914] text-white text-[9px] uppercase px-2 py-0.5 rounded font-bold shadow-md">
                      Confidential // Masked
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  Notice: Roll numbers, phone numbers, and hardware serial numbers are masked to prevent fraudulent claims.
                </p>
              </div>
            </div>

          </div>

          {/* Section 3: Anti-Fraud Questionnaire */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">
                3. Anti-Fraud Questionnaire
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Public Identifying Question *
              </label>
              <input
                type="text"
                required
                value={verificationQuestion}
                onChange={(e) => setVerificationQuestion(e.target.value)}
                placeholder="e.g. What is the lockscreen wallpaper? What initials are inscribed inside?"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                This question will be shown to anyone claiming ownership of this item.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Confidential Answer Hint (Only Visible to Security Desk &amp; You)
              </label>
              <input
                type="text"
                value={privateAnswerHint}
                onChange={(e) => setPrivateAnswerHint(e.target.value)}
                placeholder="e.g. Wallpaper is AIT gate, initials AK 24, SBI card ending in 9012"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                Stored privately on server to evaluate anti-fraud claim submissions.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-glass px-5 py-2.5 text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-crimson px-6 py-2.5 text-xs sm:text-sm rounded-xl font-bold"
            >
              Submit &amp; Catalog Item
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
