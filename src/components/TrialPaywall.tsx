import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  X,
  Crown,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';

interface TrialPaywallProps {
  user: UserProfile;
  onActivateSubscription: (plan: 'monthly' | 'annual') => void;
  onSimulateExpireTrial?: () => void;
  onSimulateResetTrial?: () => void;
}

export const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days in MS

export function getTrialTimeRemaining(trialStartDateStr?: string): {
  msLeft: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  isExpired: boolean;
} {
  const startDate = trialStartDateStr ? new Date(trialStartDateStr).getTime() : Date.now();
  const endDate = startDate + TRIAL_DURATION_MS;
  const now = Date.now();
  const msLeft = Math.max(0, endDate - now);

  const totalSecs = Math.floor(msLeft / 1000);
  const daysLeft = Math.floor(totalSecs / (24 * 3600));
  const hoursLeft = Math.floor((totalSecs % (24 * 3600)) / 3600);
  const minutesLeft = Math.floor((totalSecs % 3600) / 60);
  const secondsLeft = totalSecs % 60;

  return {
    msLeft,
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    isExpired: msLeft <= 0,
  };
}

export const TrialBanner: React.FC<{
  user: UserProfile;
  onOpenPaywall: () => void;
  onSimulateExpireTrial?: () => void;
}> = ({ user, onOpenPaywall, onSimulateExpireTrial }) => {
  const [timeState, setTimeState] = useState(() => getTrialTimeRemaining(user.trialStartDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(getTrialTimeRemaining(user.trialStartDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [user.trialStartDate]);

  if (user.subscriptionStatus === 'active') {
    return null;
  }

  const { daysLeft, hoursLeft, minutesLeft, secondsLeft, isExpired } = timeState;

  if (isExpired) return null; // Expired lock modal will take over

  return (
    <div className="bg-gradient-to-r from-cyan-950/90 via-black to-purple-950/90 border border-cyan-500/30 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-mono shadow-lg shadow-cyan-950/50 relative overflow-hidden">
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0">
          <Clock className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
              3-DAY FREE TRIAL ACTIVE
            </span>
          </div>
          <div className="text-neutral-300 text-[11px] flex items-center gap-1.5 mt-0.5">
            <span>Time Left:</span>
            <span className="text-cyan-300 font-bold bg-black/50 px-1.5 py-0.5 rounded border border-white/10 font-mono">
              {daysLeft}d {hoursLeft}h {minutesLeft}m {secondsLeft}s
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {onSimulateExpireTrial && (
          <button
            type="button"
            onClick={onSimulateExpireTrial}
            className="text-[10px] text-neutral-400 hover:text-amber-400 underline font-mono px-2 py-1 transition-colors cursor-pointer"
            title="Demo Test: Instantly expire 3-day trial"
          >
            [Test Expire]
          </button>
        )}

        <button
          type="button"
          onClick={onOpenPaywall}
          className="w-full sm:w-auto py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:opacity-95 text-black font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>Subscribe Now</span>
        </button>
      </div>
    </div>
  );
};

export const PaywallModal: React.FC<
  TrialPaywallProps & {
    isOpen: boolean;
    isMandatoryLock: boolean;
    onClose?: () => void;
  }
> = ({
  user,
  onActivateSubscription,
  onSimulateResetTrial,
  isOpen,
  isMandatoryLock,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple'>('card');

  // Form fields for simulated card
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(user.name || 'Pro Operator');

  if (!isOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onActivateSubscription(selectedPlan);
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#090d14] border border-cyan-500/30 rounded-[32px] p-5 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden my-auto">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Optional Close button (only when user voluntarily opened paywall before expiration) */}
        {!isMandatoryLock && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {paymentSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Payment Successful!</h3>
            <p className="text-sm font-mono text-emerald-400">
              RebuildOS Pro Workspace Access Unlocked.
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              Redirecting to your restored dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Header Badge & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                {isMandatoryLock ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>3-DAY TRIAL EXPIRED</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ACTIVATE SUBSCRIPTION</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isMandatoryLock
                  ? 'Your Workspace Access is Locked'
                  : 'Unlock Full Operational Capacity'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                {isMandatoryLock
                  ? 'Your 3-day free trial has concluded. Activate a subscription to unlock your streak, focus missions, and identity analytics.'
                  : 'Get uninterrupted access to all daily deep focus sprints, AI coaching, recovery protocols, and full identity stats.'}
              </p>
            </div>

            {/* Preserved Stats Summary Card */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-mono font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{user.streak} Days</span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400 mt-0.5">Preserved Streak</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-mono font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Level {user.level}</span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400 mt-0.5">Saved Title</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-mono font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{user.xp} XP</span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400 mt-0.5">Total Momentum</div>
              </div>
            </div>

            {/* Plan Selection Toggle */}
            <div className="grid grid-cols-2 gap-3">
              {/* Annual Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('annual')}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'annual'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-black font-mono font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Save 38% • Best Value
                </div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Annual Founder
                </div>
                <div className="text-xl font-black text-white mt-1">
                  €59.99<span className="text-xs font-light text-neutral-400">/year</span>
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                  Equivalent to €4.99/mo
                </div>
              </button>

              {/* Monthly Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlan === 'monthly'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Monthly Pro
                </div>
                <div className="text-xl font-black text-white mt-1">
                  €7.99<span className="text-xs font-light text-neutral-400">/month</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Flexible • Cancel anytime
                </div>
              </button>
            </div>

            {/* Payment Method Switcher & Checkout */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Payment Method:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-white/10 text-white border-cyan-400'
                          : 'bg-black/30 text-neutral-400 border-white/10'
                      }`}
                    >
                      Credit / Debit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                        paymentMethod === 'apple'
                          ? 'bg-white/10 text-white border-cyan-400'
                          : 'bg-black/30 text-neutral-400 border-white/10'
                      }`}
                    >
                      Apple Pay
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-2 bg-black/50 border border-white/10 rounded-2xl p-3">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                          Expires (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-black/50 border border-white/10 rounded-2xl text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-white font-mono text-sm">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.1-3.23-2.63-7.14-7.24-11.73-13.83-6.8-9.72-12.1-20.91-15.89-33.56-3.79-12.66-5.69-24.81-5.69-36.46 0-15.42 3.96-28.16 11.89-38.22 7.93-10.06 18.04-15.19 30.33-15.39 4.35 0 9.38 1.15 15.1 3.44 5.72 2.29 9.87 3.44 12.45 3.44 2.3 0 6.44-1.15 12.43-3.44 5.99-2.29 10.87-3.35 14.65-3.18 10.23.63 18.79 4.34 25.68 11.13 6.89 6.79 11.12 15.01 12.69 24.66-11.45 6.9-17.06 16.48-16.83 28.74.22 9.61 3.86 17.58 10.92 23.91 4.5 4.03 9.69 7.02 15.57 8.98-2.48 7.37-5.68 14.49-9.6 21.36zM119.22 31.84c0-7.39 2.72-14.43 8.16-21.12 5.44-6.69 12.21-10.72 20.31-12.09.11 1.09.16 2.07.16 2.94 0 7.29-2.78 14.41-8.34 21.36-5.56 6.95-12.3 11.02-20.21 12.21-.08-.76-.08-1.85-.08-3.3z" />
                      </svg>
                      <span>Pay with Apple Pay</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Touch ID / Face ID authorized demo payment
                    </p>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:opacity-95 text-black font-mono text-xs font-bold transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Authorizing Subscription...</span>
                ) : (
                  <>
                    <span>
                      Activate Subscription ({selectedPlan === 'annual' ? '€59.99/yr' : '€7.99/mo'})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Features & Reset Trial Helper */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted • Cancel Anytime</span>
              </div>

              {onSimulateResetTrial && (
                <button
                  type="button"
                  onClick={onSimulateResetTrial}
                  className="text-neutral-500 hover:text-cyan-400 underline cursor-pointer"
                  title="Demo Test: Reset trial back to Day 1"
                >
                  [Reset Demo Trial]
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
