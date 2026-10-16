import React from 'react';
import { X, Bell, CheckCheck, Award, AlertCircle, Radio } from 'lucide-react';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onSelectItem,
  onOpenGatePass
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0e0f14]/95 backdrop-blur-xl text-white border-l border-white/10 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#14151c] to-[#0a0b0e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E50914] to-[#800] flex items-center justify-center shadow-lg shadow-red-500/25">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white tracking-wide">
                Dispatch Alerts
              </h2>
              <p className="text-xs text-white/50">
                Real-Time Campus Recovery Activity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between text-xs">
          <span className="text-white/60">
            Total Notices: <strong className="text-white font-bold">{notifications.length}</strong>
          </span>
          <button
            onClick={onMarkAllRead}
            className="text-red-400 hover:text-red-300 transition-colors font-medium hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-xs text-white/40">
              No dispatch notices recorded.
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read;

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnread
                      ? 'bg-gradient-to-br from-red-950/20 via-white/5 to-white/5 border-red-500/40 shadow-sm'
                      : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white">
                      {notif.title}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#E50914] shadow-sm shadow-red-500 shrink-0 mt-1"></span>
                    )}
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10 text-[10px] text-white/40">
                    <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {notif.refCode && (
                      <span className="font-mono font-medium text-white/60">[{notif.refCode}]</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Dismiss */}
        <div className="p-4 border-t border-white/10 bg-[#0a0b0e] text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Dismiss Panel
          </button>
        </div>

      </div>
    </div>
  );
}
