import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FeaturedCarousel from './components/FeaturedCarousel';
import StatsBanner from './components/StatsBanner';
import HotspotsFilter from './components/HotspotsFilter';
import FilterControls from './components/FilterControls';
import ItemCard from './components/ItemCard';
import TableView from './components/TableView';
import ReportModal from './components/ReportModal';
import ClaimModal from './components/ClaimModal';
import AdminClaimReviewModal from './components/AdminClaimReviewModal';
import GatePassModal from './components/GatePassModal';
import RadarAlertModal from './components/RadarAlertModal';
import AuthModal from './components/AuthModal';
import NotificationDrawer from './components/NotificationDrawer';
import ItemDetailModal from './components/ItemDetailModal';
import { SEEDED_ITEMS } from './constants/aitData.js';
import { Shield, RefreshCw, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export default function App() {
  // State: Data
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [alerts, setAlerts] = useState([
    { id: 'alt-1', keyword: 'Casio', email: 'priya.sharma_2311@aitpune.edu.in' },
    { id: 'alt-2', keyword: 'Keys', email: 'security@aitpune.edu.in' }
  ]);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-welcome',
      type: 'system',
      title: 'AIT RECOVERY SYSTEM ONLINE',
      message: 'Persistent campus database connected with official landmarks & spam prevention.',
      timestamp: new Date().toISOString(),
      read: false,
      refCode: 'AIT-CALL-SHEET'
    }
  ]);

  // Current User Context (Starts in logged-out guest state by default; persists via localStorage if user logs in)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ait_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // State: Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // State: Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportInitialType, setReportInitialType] = useState('found');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [selectedItemForGatePass, setSelectedItemForGatePass] = useState(null);
  const [isAdminClaimsOpen, setIsAdminClaimsOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // In-App Toast Alert banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch Items from API Backend (Global Feed Fetching)
  const fetchItems = async () => {
    try {
      const isAdmin = currentUser?.role === 'Staff / Other / Security';
      const url = isAdmin ? '/api/items?includeSpamHidden=true' : '/api/items';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.log('Unable to reach backend /api/items');
    }
  };

  // Fetch Claims
  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch (err) {
      console.log('Local claims state active');
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.log('Local notifications active');
    }
  };

  // Fetch Alerts
  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        if (data.alerts) {
          setAlerts(data.alerts);
        }
      }
    } catch (err) {
      console.log('Local alerts active');
    }
  };

  // Real-time Data Sync: Fetch on mount + Poll every 5 seconds for cross-user live updates
  useEffect(() => {
    fetchItems();
    fetchClaims();
    fetchNotifications();
    fetchAlerts();

    // Auto-polling so all users on any browser/tab see reported items instantly
    const pollInterval = setInterval(() => {
      fetchItems();
      fetchNotifications();
      fetchClaims();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [currentUser]);

  // Handle Report Item Submission (Strict Backend Database Persistence - No Client-Only Fake Items)
  const handleReportSubmit = async (newItemData) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData)
      });

      const data = await res.json();

      if (res.ok) {
        // Immediately prepend to local items feed and close modal
        setItems(prev => [data.item, ...prev.filter(i => i.id !== data.item.id)]);
        setIsReportOpen(false);
        showToast(`ITEM SAVED TO CAMPUS RECOVERY REGISTER // [${data.item.refCode}]`);
        fetchNotifications();
        // Trigger server refetch to ensure global sync
        fetchItems();
      } else {
        // Direct feedback on validation or rate-limiting error
        showToast(data.error || 'Failed to submit report. Please review form requirements.', 'warning');
      }
    } catch (err) {
      showToast('Network error: Unable to connect to campus database.', 'warning');
    }
  };

  // Handle Spam Flagging
  const handleFlagItem = async (item) => {
    if (!currentUser) {
      showToast('Please log in with your @aitpune.edu.in account to flag spam or inappropriate content.', 'warning');
      setIsAuthOpen(true);
      return;
    }

    const isConfirmed = window.confirm(
      `Flag "${item.title}" [${item.refCode}] as spam or inappropriate?\n\nIf this item receives 3 flags, it will be automatically quarantined from the public feed pending Security Desk review.`
    );

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/items/${item.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: currentUser.email })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.isSpamHidden) {
          showToast(`🚨 QUARANTINED: Item ${item.refCode} reached 3 flags and has been hidden from public feed for review.`, 'warning');
          // Hide from current public view
          setItems(prev => prev.filter(i => i.id !== item.id));
        } else {
          showToast(`Report submitted. Flag count: ${data.flagsCount} / 3. Thank you for keeping campus safe.`, 'info');
          // Update item flag count
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, flagsCount: data.flagsCount, flaggedBy: [...(i.flaggedBy || []), currentUser.email] } : i));
        }
        fetchNotifications();
        fetchItems();
      } else {
        showToast(data.error || 'Failed to flag item.', 'warning');
      }
    } catch (err) {
      showToast('Network error while flagging item.', 'warning');
    }
  };

  // Handle Security Desk Moderation (Approve/Unhide or Remove)
  const handleModerateItem = async (itemId, action) => {
    try {
      const res = await fetch(`/api/items/${itemId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        fetchItems();
        fetchNotifications();
      } else {
        showToast(data.error || 'Moderation action failed', 'warning');
      }
    } catch (err) {
      showToast('Network error during moderation', 'warning');
    }
  };

  // Handle Claim Submission
  const handleClaimSubmit = async (claimData) => {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      });

      const data = await res.json();

      if (res.ok) {
        setClaims(prev => [data.claim, ...prev]);
        setItems(prev => prev.map(i => i.id === claimData.itemId ? { ...i, status: 'Under Review' } : i));
        setSelectedItemForClaim(null);
        showToast('CLAIM TRANSMITTED // AWAITING AUDIT', 'info');
        fetchNotifications();
      } else {
        showToast(data.error || 'Failed to submit claim.', 'warning');
      }
    } catch (err) {
      showToast('Network error submitting claim.', 'warning');
    }
  };

  // Handle Claim Review
  const handleReviewClaim = async (claimId, status, reviewNotes, handoffLocation) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes, handoffLocation })
      });

      if (res.ok) {
        const data = await res.json();
        setClaims(prev => prev.map(c => c.id === claimId ? data.claim : c));
        if (data.item) {
          setItems(prev => prev.map(i => i.id === data.item.id ? data.item : i));
        }
        showToast(`CLAIM HAS BEEN ${status.toUpperCase()} // GATE PASS ISSUED`);
        fetchNotifications();
      } else {
        setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status, reviewNotes } : c));
      }
    } catch (err) {
      setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status, reviewNotes } : c));
    }
  };

  // Handle Add Radar Alert
  const handleAddAlert = async (keyword, email) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, email })
      });

      if (res.ok) {
        const data = await res.json();
        setAlerts(prev => [data.alert, ...prev]);
        showToast(`RADAR ARMED FOR // "${keyword.toUpperCase()}"`);
        fetchNotifications();
      } else {
        const newAlt = { id: `alt-${Date.now()}`, keyword, email, active: true };
        setAlerts(prev => [newAlt, ...prev]);
        showToast(`RADAR ARMED FOR // "${keyword.toUpperCase()}"`);
      }
    } catch (err) {
      const newAlt = { id: `alt-${Date.now()}`, keyword, email, active: true };
      setAlerts(prev => [newAlt, ...prev]);
      showToast(`RADAR ARMED FOR // "${keyword.toUpperCase()}"`);
    }
  };

  // Handle Delete Radar Alert
  const handleDeleteAlert = async (id) => {
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      setAlerts(prev => prev.filter(a => a.id !== id));
      showToast('RADAR WATCHWORD REMOVED');
    } catch (err) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  // Mark all notifications read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // Handle Dynamic Login
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('ait_auth_user', JSON.stringify(userData));
    } catch (e) {}
    showToast(`Welcome, ${userData.name}! Authenticated as ${userData.role}.`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ait_auth_user');
      localStorage.removeItem('ait_auth_token');
    } catch (e) {}
    showToast('You have been logged out of the session.', 'info');
  };

  // Action Guard: Report Item (requires login)
  const handleOpenReport = (type = 'found') => {
    if (!currentUser) {
      showToast('Please log in with your official @aitpune.edu.in account to report lost or found property.', 'warning');
      setIsAuthOpen(true);
      return;
    }
    setReportInitialType(type);
    setIsReportOpen(true);
  };

  // Action Guard: Claim Item (requires login)
  const handleOpenClaim = (item) => {
    if (!currentUser) {
      showToast('Please log in with your official @aitpune.edu.in account to submit a property claim.', 'warning');
      setIsAuthOpen(true);
      return;
    }
    setSelectedItemForClaim(item);
  };

  // Reset Mock Data
  const handleResetData = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      await fetchItems();
      await fetchClaims();
      await fetchNotifications();
      showToast('CAMPUS REGISTER RESTORED TO DEFAULT SEED INVENTORY.');
    } catch (err) {
      showToast('INVENTORY RESTORED.');
    }
  };

  // Compute Filtered Items
  const filteredItems = items.filter(item => {
    // If not admin, hide spam items
    if (item.isSpamHidden && currentUser?.role !== 'Staff / Other / Security') {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const match = 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.refCode && item.refCode.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (typeFilter !== 'all' && item.type && item.type.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }

    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    if (selectedLocation !== 'all' && item.location !== selectedLocation) {
      return false;
    }

    if (statusFilter !== 'all' && item.status && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  const stats = {
    total: items.length,
    found: items.filter(i => i.type === 'found').length,
    lost: items.filter(i => i.type === 'lost').length,
    claimed: items.filter(i => i.status?.toLowerCase() === 'claimed').length,
    underReview: items.filter(i => i.status?.toLowerCase() === 'under review').length
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-white selection:bg-[#E50914] selection:text-white relative overflow-x-hidden">
      
      {/* Ambient Radial Crimson Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.22)_0%,rgba(0,0,0,0)_70%)] blur-2xl pointer-events-none" />
        <div className="absolute top-[650px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(229,9,20,0.06)_0%,rgba(0,0,0,0)_70%)] blur-3xl pointer-events-none" />
      </div>

      {/* Top Banner Toast (Cinematic Dark Glass with Crimson Accent) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#12141c]/95 backdrop-blur-xl text-white px-5 py-3.5 border border-red-500/40 rounded-2xl flex items-center gap-3 text-xs shadow-2xl shadow-red-950/40 animate-in fade-in slide-in-from-top-3 max-w-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse shrink-0"></span>
          <span className="font-medium leading-relaxed">{toastMessage.msg}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-white/40 hover:text-white ml-auto transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenReport={() => handleOpenReport('found')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenRadar={() => setIsRadarOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAdminClaims={() => setIsAdminClaimsOpen(true)}
        unreadCount={unreadCount}
        activeAlertCount={alerts.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 relative z-10 space-y-10">
        
        {/* 3D Perspective Coverflow Carousel */}
        <FeaturedCarousel
          items={items.filter(i => !i.isSpamHidden)}
          onOpenDetail={(i) => setSelectedItemForDetail(i)}
          onOpenClaim={(i) => handleOpenClaim(i)}
          onOpenGatePass={(i) => setSelectedItemForGatePass(i)}
        />

        {/* Hero Split & Statistics Strip */}
        <StatsBanner
          stats={stats}
          onOpenReport={(type) => handleOpenReport(type)}
          onQuickFilterType={(type) => setTypeFilter(type)}
        />

        {/* 13 Monitored AIT Campus Zones */}
        <HotspotsFilter
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
          items={items}
        />

        {/* Search & Filter Controls */}
        <FilterControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={() => {
            setSearchQuery('');
            setTypeFilter('all');
            setCategoryFilter('all');
            setSelectedLocation('all');
            setStatusFilter('all');
          }}
          totalResults={filteredItems.length}
        />

        {/* Items Listing: Grid View vs Swiss Catalog Manifest Table View */}
        {filteredItems.length === 0 ? (
          <div className="bg-[#0e0f14] border border-white/10 rounded-3xl p-12 text-center my-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />
            <AlertCircle className="w-10 h-10 text-[#E50914] mx-auto mb-3" />
            <h3 className="font-extrabold text-lg text-white tracking-wide">
              NO CAMPUS ASSETS MATCH CURRENT FILTERS
            </h3>
            <p className="text-xs text-white/50 max-w-md mx-auto mt-2 mb-6 leading-relaxed">
              Adjust zone filters or keyword search. You can also arm the Keyword Radar to receive instant notifications when this gear is logged anywhere at AIT.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLocation('all');
                  setTypeFilter('all');
                }}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsRadarOpen(true)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#B81D24] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-red-500/20 transition-all"
              >
                Arm Radar Alert
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onOpenDetail={(i) => setSelectedItemForDetail(i)}
                onOpenClaim={(i) => handleOpenClaim(i)}
                onOpenGatePass={(i) => setSelectedItemForGatePass(i)}
                onFlagItem={handleFlagItem}
                currentUser={currentUser}
              />
            ))}
          </div>
        ) : (
          <TableView
            items={filteredItems}
            onOpenDetail={(i) => setSelectedItemForDetail(i)}
            onOpenClaim={(i) => handleOpenClaim(i)}
            onOpenGatePass={(i) => setSelectedItemForGatePass(i)}
            onFlagItem={handleFlagItem}
            currentUser={currentUser}
          />
        )}

        {/* Technical Call Sheet Toolbar Strip */}
        <div className="p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wide backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-amber-400'}`}></span>
            {currentUser ? (
              <span className="text-white/70">
                Active Session: <strong className="text-white font-semibold">{currentUser.name}</strong> [{currentUser.role}] • <span className="text-white/40 font-mono">ID: {currentUser.regId || 'Verified'}</span>
              </span>
            ) : (
              <span className="text-white/60">
                Guest View • <span className="text-white/40">Log in with your @aitpune.edu.in account to report or claim gear.</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                [Log Out]
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="text-[#ff4d58] hover:text-white font-bold transition-colors"
              >
                [Login / Register]
              </button>
            )}
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
              title="Reset inventory to default seed state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Catalog</span>
            </button>
          </div>
        </div>

      </main>

      {/* Cinematic Dark Footer */}
      <footer className="bg-[#050608] text-white border-t border-white/10 text-xs mt-12 relative z-10">
        
        {/* Service Benefit Row */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 border-b border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase block">
                [01] 13 AIT Zones
              </span>
              <p className="text-xs text-white/70 leading-relaxed">
                Audited location registry covering Raman Theater, Library, Mess, Labs, and Grounds.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase block">
                [02] Anti-Fraud Verification
              </span>
              <p className="text-xs text-white/70 leading-relaxed">
                Anti-theft identifying questions &amp; privacy redaction masks to protect student credentials.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase block">
                [03] Physical Gate Pass
              </span>
              <p className="text-xs text-white/70 leading-relaxed">
                Physical property releases require digital Gate Pass code GP-AIT-xxxx with college ID.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase block">
                [04] Anti-Spam Moderation
              </span>
              <p className="text-xs text-white/70 leading-relaxed">
                Account identity binding, rate limiting, and 3-flag community quarantine protection.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Link Matrix & Legal Row */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-[11px] tracking-wide">
          <div>
            Army Institute of Technology, Pune • Dighi Hills, Alandi Road, Pune 411015
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]"></span>
            <span>AIT Campus Recovery Portal • Full-Stack MERN</span>
          </div>
        </div>

      </footer>

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        initialType={reportInitialType}
        onSubmit={handleReportSubmit}
        currentUser={currentUser}
      />

      <ClaimModal
        isOpen={!!selectedItemForClaim}
        onClose={() => setSelectedItemForClaim(null)}
        item={selectedItemForClaim}
        onSubmitClaim={handleClaimSubmit}
        currentUser={currentUser}
      />

      <AdminClaimReviewModal
        isOpen={isAdminClaimsOpen}
        onClose={() => setIsAdminClaimsOpen(false)}
        claims={claims}
        items={items}
        onReviewClaim={handleReviewClaim}
        onOpenGatePass={(item) => setSelectedItemForGatePass(item)}
        onModerateItem={handleModerateItem}
      />

      <GatePassModal
        isOpen={!!selectedItemForGatePass}
        onClose={() => setSelectedItemForGatePass(null)}
        item={selectedItemForGatePass}
      />

      <RadarAlertModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeleteAlert}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onSelectItem={(item) => setSelectedItemForDetail(item)}
        onOpenGatePass={(item) => setSelectedItemForGatePass(item)}
      />

      <ItemDetailModal
        isOpen={!!selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        item={selectedItemForDetail}
        onOpenClaim={(item) => handleOpenClaim(item)}
        onOpenGatePass={(item) => setSelectedItemForGatePass(item)}
        onFlagItem={handleFlagItem}
        currentUser={currentUser}
      />

    </div>
  );
}
