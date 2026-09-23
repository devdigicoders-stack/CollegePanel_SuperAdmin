import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

// High-fidelity web audio chime fallback
const playWebAudioChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Tone 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    // Tone 2: B5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.7);
  } catch (e) {
    // Audio unsupported or blocked
  }
};

// Play audio notification using /notification.mp3 with synth fallback
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 1.0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        playWebAudioChime();
      });
    }
  } catch (e) {
    playWebAudioChime();
  }
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Pre-unlock audio on user interaction to comply with browser autoplay policies
    let unlocked = false;
    const unlockAudio = () => {
      if (unlocked) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
        }
        const dummy = new Audio('/notification.mp3');
        dummy.volume = 0.001;
        dummy.play().then(() => {
          dummy.pause();
          dummy.currentTime = 0;
          unlocked = true;
        }).catch(() => {});
      } catch (e) {}
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('pointerdown', unlockAudio);

    // Get SuperAdmin auth credentials
    const token = localStorage.getItem('superadmin_token');
    const adminInfo = JSON.parse(localStorage.getItem('superadmin_info') || '{}');

    // Deduplication tracker so an alert is never spammed twice
    const seenAlertKeys = new Set();
    const shouldDisplayAlert = (key) => {
      if (!key) return true;
      if (seenAlertKeys.has(key)) return false;
      seenAlertKeys.add(key);
      setTimeout(() => seenAlertKeys.delete(key), 12000);
      return true;
    };

    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const baseUrl = isLocal 
      ? 'http://localhost:5003' 
      : (import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://collegeerp.thedigicoders.com');

    const newSocket = io(baseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ SuperAdmin connected to Socket Server:', newSocket.id);
      if (adminInfo?._id) {
        newSocket.emit('register', adminInfo._id);
      }
      newSocket.emit('join_superadmin');
    });

    // Handle incoming website lead enquiry
    const handleNewEnquiry = (enquiry) => {
      const alertKey = `enquiry_${enquiry._id || enquiry.email || enquiry.phone}`;
      if (!shouldDisplayAlert(alertKey)) return;

      playNotificationSound();

      // Dispatch event for instant table refresh and unread count update
      window.dispatchEvent(new CustomEvent('enquiries_updated', { detail: enquiry }));
      window.dispatchEvent(new CustomEvent('new_enquiry_received', { detail: enquiry }));

      // Show rich toast notification
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 border-2 border-emerald-500 p-4 transition-all duration-300`}
        >
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xl shadow-md">
                  🚀
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    NEW LEAD
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Just now</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900 leading-snug">
                  {enquiry.fullName}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {enquiry.collegeName}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>📞 {enquiry.phone}</span>
                  {enquiry.studentStrength && (
                    <span>• {enquiry.studentStrength}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center ml-3 pl-3 border-l border-slate-100 gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = '/enquiries';
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              View Lead
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 12000, position: 'top-right' });
    };

    newSocket.on('new_enquiry', handleNewEnquiry);

    // Generic SuperAdmin notification
    newSocket.on('superadmin_notification', (data) => {
      if (data?.type === 'enquiry') {
        // Handled by handleNewEnquiry
        return;
      }
      playNotificationSound();
      toast(data.message || data.title, {
        icon: '🔔',
        duration: 8000,
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '500'
        }
      });
      window.dispatchEvent(new CustomEvent('superadmin_notification', { detail: data }));
    });

    setSocket(newSocket);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
