import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, ShieldCheck, EyeOff, Check, AlertTriangle, MapPin, UserCheck, AlertCircle } from 'lucide-react';
import { AIT_LOCATIONS, CATEGORIES } from '../constants/aitData';

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

  // Mandatory genuine acknowledgement checkbox
  const [genuineAcknowledgement, setGenuineAcknowledgement] = useState(false);

  // Validation error banner
  const [formError, setFormError] = useState('');

  // Image & Privacy Redaction states
  const [uploadedImage, setUploadedImage] = useState(null);
  const [hasRedactedImage, setHasRedactedImage] = useState(false);
  const [redactionBoxes, setRedactionBoxes] = useState([
    { x: 25, y: 35, width: 50, height: 18 }
  ]);

  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('Image size must be less than 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setFormError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw on Canvas when uploaded image or redaction boxes change
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
      // Dark slate background for preview placeholder
      ctx.fillStyle = '#0f1118';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, width - 4, height - 4);

      // Header watermark
      ctx.fillStyle = '#E50914';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('AIT PUNE • CAMPUS SECURITY REGISTER', 16, 26);

      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(type === 'found' ? 'Compulsory Real Image Required for Found Property' : 'Optional Photo Surface for Lost Item', 16, 60);
      ctx.fillText(`Reporter: ${currentUser?.email || 'Unauthorized'}`, 16, 84);
      ctx.fillText(`Zone: ${location}`, 16, 108);

      drawRedactions(ctx, width, height);
    }
  }, [uploadedImage, redactionBoxes, hasRedactedImage, location, type, currentUser]);

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
      { x: 15 + Math.random() * 20, y: 25 + Math.random() * 30, width: 45, height: 16 }
    ]);
    setHasRedactedImage(true);
  };

  const clearMasks = () => {
    setRedactionBoxes([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // 1. Strict Account Verification
    if (!currentUser || !currentUser.email || !currentUser.email.toLowerCase().endsWith('@aitpune.edu.in')) {
      setFormError('Authentication Error: You must be logged in with an official @aitpune.edu.in account to submit a report.');
      return;
    }

    if (!currentUser.regId) {
      setFormError('Account Error: Missing student/employee registration ID. Please update your profile.');
      return;
    }

    // 2. Title validation
    if (!title.trim()) {
      setFormError('Please enter a descriptive item title.');
      return;
    }

    // 3. Mandatory Landmark from fixed list
    if (!location || !AIT_LOCATIONS.includes(location)) {
      setFormError('Please select a valid landmark from the official AIT Campus Landmark dropdown.');
      return;
    }

    // 4. Description length: min 25 characters
    if (description.trim().length < 25) {
      setFormError(`Description too brief: Minimum 25 characters required (current: ${description.trim().length}). Please provide specific details like color, desk/bench number, or marks.`);
      return;
    }

    // 5. Compulsory image upload for Found items
    if (type === 'found' && !uploadedImage) {
      setFormError('Real image upload is COMPULSORY for Found items to verify possession and prevent fraudulent reports.');
      return;
    }

    // 6. Mandatory genuine acknowledgement checkbox
    if (!genuineAcknowledgement) {
      setFormError('You must check the confirmation checkbox declaring that this information is genuine and adheres to AIT campus policy.');
      return;
    }

    const canvas = canvasRef.current;
    const finalImageData = uploadedImage && canvas ? canvas.toDataURL('image/jpeg', 0.8) : (uploadedImage || null);

    onSubmit({
      type,
      title: title.trim(),
      category,
      location,
      date,
      time,
      description: description.trim(),
      urgency,
      verificationQuestion: verificationQuestion.trim(),
      privateAnswerHint: privateAnswerHint.trim(),
      imagePlaceholder: category === 'ID Cards' ? 'id-card' : category === 'Electronics' ? 'calculator' : 'default',
      imageData: finalImageData,
      hasRedactedImage,
      genuineAcknowledgement: true,
      // Automatically bind authenticated user identity (no anonymous submissions)
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      reporterRegId: currentUser.regId,
      reporterRole: currentUser.role || 'Student'
    });
  };

  const descLength = description.trim().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#101218] text-white border border-white/10 rounded-3xl w-full max-w-3xl my-6 relative max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${type === 'found' ? 'bg-emerald-500' : 'bg-[#E50914]'}`}></span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {type === 'found' ? 'Report Found Campus Property' : 'File Lost Notice'}
              </h2>
              <p className="text-xs text-gray-400">
                Official AIT Pune Security &amp; Asset Recovery Register
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
          
          {/* Identity Binding Badge (Strict Account Verification) */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">
                  Authenticated Reporter (Account Bound)
                </span>
                <span className="text-xs font-bold text-white">
                  {currentUser?.name || 'Authorized Member'} 
                  <span className="text-gray-400 font-normal"> ({currentUser?.email || 'aitpune.edu.in'})</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-emerald-400 border border-emerald-500/20 font-bold">
                REG: {currentUser?.regId || 'N/A'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-gray-300 font-medium">
                {currentUser?.role || 'Student'}
              </span>
            </div>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-medium">{formError}</span>
            </div>
          )}

          {/* Toggle Type: Found vs Lost */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              onClick={() => {
                setType('found');
                setFormError('');
              }}
              className={`py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>I Found an Item (Photo Compulsory)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('lost');
                setFormError('');
              }}
              className={`py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                type === 'lost'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>I Lost an Item</span>
            </button>
          </div>

          {/* Section 1: Item Details */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">
                1. Item Manifest &amp; Campus Location
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
                  placeholder="e.g. AIT Student ID Card, Casio fx-991CW Calculator, Leather Wallet..."
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

              {/* Fixed Landmark Dropdown (Strict: No Custom Text) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>AIT Campus Landmark *</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">13 Fixed Zones</span>
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
                <span className="text-[10px] text-gray-400 block mt-1">
                  Select strictly from designated official campus landmarks.
                </span>
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

              {/* High-Detail Description (Min 25 Characters) */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    High-Detail Description *
                  </label>
                  <span className={`text-[11px] font-mono font-semibold ${
                    descLength >= 25 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {descLength} / 25 chars min {descLength >= 25 ? '✓ Valid' : '(Needs more detail)'}
                  </span>
                </div>
                <textarea
                  required
                  minLength={25}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise location context (e.g. Desk #12 near north reading window, red plastic pouch, initials inscribed, room number...)"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    descLength > 0 && descLength < 25 
                      ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-white/10 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]'
                  }`}
                />
                <span className="text-[10px] text-gray-400 block mt-1">
                  Spam Protection: Minimum 25 characters required. Vague or single-word descriptions are automatically rejected.
                </span>
              </div>

            </div>
          </div>

          {/* Section 2: Real Photo Upload & Privacy Redaction Tool */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="border-b border-white/10 pb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Photo Evidence &amp; Privacy Redaction</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                type === 'found' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400'
              }`}>
                {type === 'found' ? '★ Mandatory for Found Items' : 'Recommended'}
              </span>
            </div>

            {/* Custom File Upload Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div>
                <span className="text-xs font-semibold text-white block">
                  {type === 'found' ? 'Upload Actual Photo of Found Item *' : 'Upload Item Photo (Optional)'}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {type === 'found' 
                    ? 'Proof of custody is required to prevent fake claims. Mask roll numbers using the redaction tool below.' 
                    : 'Add photo to help students and security identify your item.'}
                </p>
              </div>

              <label className="btn-crimson px-4 py-2 text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadedImage ? 'Change Image' : 'Select Photo File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {uploadedImage ? (
              <div className="border border-white/10 bg-white/[0.02] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Real Photo Attached
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
                      {hasRedactedImage ? '✓ Privacy Mask Active' : 'Enable Privacy Mask'}
                    </button>
                  </div>

                  {hasRedactedImage && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addQuickMask}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium"
                      >
                        + Add Mask Box
                      </button>
                      <button
                        type="button"
                        onClick={clearMasks}
                        className="px-2.5 py-1 bg-red-600/20 text-red-300 rounded-lg text-xs font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Canvas Frame */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative border border-white/15 rounded-xl overflow-hidden shadow-2xl bg-black max-w-full">
                    <canvas
                      ref={canvasRef}
                      width={460}
                      height={200}
                      className="max-w-full h-auto block"
                    />
                    {hasRedactedImage && (
                      <div className="absolute bottom-2.5 right-2.5 bg-[#E50914] text-white text-[9px] uppercase px-2 py-0.5 rounded font-bold shadow-md">
                        Confidential // Redacted
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 text-center">
                    Sensitive personal details (roll numbers, student IDs, debit card numbers) should be redacted.
                  </p>
                </div>
              </div>
            ) : type === 'found' ? (
              <div className="p-4 rounded-xl border border-dashed border-red-500/40 bg-red-950/20 text-center text-xs text-red-300">
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-400" />
                <span className="font-bold">Real Image Upload Required:</span> You must attach a real photograph of the found equipment before you can submit.
              </div>
            ) : null}

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
                Anyone claiming this item must answer this question to verify genuine ownership.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Confidential Answer Hint (Only Visible to Security Desk)
              </label>
              <input
                type="text"
                value={privateAnswerHint}
                onChange={(e) => setPrivateAnswerHint(e.target.value)}
                placeholder="e.g. Wallpaper is AIT gate, initials AK 24, SBI card ending in 9012"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                Security Desk compares claimant answers against this hint before approving physical handoff.
              </span>
            </div>
          </div>

          {/* Mandatory Contact Disclosure & Genuine Declaration Checkbox */}
          <div className="pt-4 border-t border-white/10">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={genuineAcknowledgement}
                onChange={(e) => setGenuineAcknowledgement(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-600 text-[#E50914] focus:ring-[#E50914] focus:ring-offset-0 bg-[#121218] cursor-pointer"
              />
              <div className="text-xs text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                <strong className="text-white block font-semibold mb-0.5">
                  Campus Code of Conduct Acknowledgement *
                </strong>
                I confirm this information is genuine and understand that false reporting violates AIT campus policy. My registration details ({currentUser?.regId || 'N/A'}) and college email ({currentUser?.email || 'N/A'}) are bound to this report.
              </div>
            </label>
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
              disabled={!genuineAcknowledgement || (type === 'found' && !uploadedImage) || descLength < 25}
              className={`px-6 py-2.5 text-xs sm:text-sm rounded-xl font-bold transition-all shadow-lg ${
                !genuineAcknowledgement || (type === 'found' && !uploadedImage) || descLength < 25
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                  : 'btn-crimson'
              }`}
            >
              Submit &amp; Save to Campus Register
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
