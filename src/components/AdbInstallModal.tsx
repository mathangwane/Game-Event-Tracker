import React, { useState } from 'react';
import { Smartphone, Usb, CheckCircle2, Terminal, Copy, Check, ShieldCheck, X } from 'lucide-react';

interface AdbInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdbInstallModal: React.FC<AdbInstallModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-[28px] bg-[#16181F] border border-[#2B303C] text-slate-100 shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#1C1F28] border-b border-[#2A2F3D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">USB / ADB Direct Device Installation</h3>
              <p className="text-xs text-slate-400">Install directly to your connected Android phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* Status Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200">
              <span className="font-bold text-emerald-300">Signing Configurations Verified:</span>{' '}
              Debug & Release signing configs, Target SDK 34 (Android 14+), and Jetpack Compose BOM are fully configured in the build scripts.
            </div>
          </div>

          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-[#1D212B] border border-[#2B313F] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Step 1: Android Device Prep
              </span>
              <Smartphone className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300">
              On your Android device: open <strong>Settings &gt; About Phone</strong>, tap{' '}
              <strong>Build Number</strong> 7 times to enable Developer Options, then turn on{' '}
              <strong>USB Debugging</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-[#1D212B] border border-[#2B313F] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Step 2: Connect via USB
              </span>
              <Usb className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300">
              Plug your Android phone into your computer using a USB data cable. On your phone screen, tap{' '}
              <strong>Allow USB Debugging</strong> when prompted.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-[#1D212B] border border-[#2B313F] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Step 3: Direct ADB Command
              </span>
              <Terminal className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300">
              Execute ADB install directly to push and launch the app without manual APK extraction:
            </p>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#12141A] font-mono text-xs text-emerald-400 border border-[#262C38]">
              <code>adb install -r android/app/build/outputs/apk/debug/app-debug.apk</code>
              <button
                type="button"
                onClick={() =>
                  copyText('adb install -r android/app/build/outputs/apk/debug/app-debug.apk', 'cmd')
                }
                className="p-1 text-slate-400 hover:text-white"
              >
                {copiedStep === 'cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#14161D] border-t border-[#252A36] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
