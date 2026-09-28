import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Lock,
  CheckCircle2,
  Printer,
  Loader2,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Invoice, PaymentMethod, PaymentTransaction } from '../types';

interface PaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, isOpen, onClose }) => {
  const { processPayment } = useHospital();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit/Debit Card');
  const [cardholderName, setCardholderName] = useState(invoice?.patientName || '');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('883');
  const [payAmount, setPayAmount] = useState<number>(
    invoice ? Number(invoice.balanceDue) || 0 : 0
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const balanceDue = Number(invoice.balanceDue) || 0;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const result = await processPayment(invoice.id, {
        amount: Number(payAmount),
        method: paymentMethod,
        cardLast4: cardNumber.replace(/\D/g, '').slice(-4) || '4242',
      });
      if (result.success) {
        setCompletedTx(result.transaction);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-xs flex flex-col max-h-[92vh]">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                  Billing & Settlement
                </span>
              </div>
              <h2 className="font-bold text-sm text-white mt-0.5">PCI-DSS Payment Gateway</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {completedTx ? (
          <div className="p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Payment Cleared Successfully</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Amount of ${(Number(completedTx.amountPaid) || 0).toFixed(2)} charged to {completedTx.method}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-left space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Transaction ID</span>
                <span className="font-bold text-slate-800">{completedTx.transactionId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Authorization Code</span>
                <span className="font-bold text-emerald-700">{completedTx.authCode}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Invoice Linked</span>
                <span>{invoice.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Timestamp</span>
                <span>{new Date(completedTx.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={handlePrintReceipt}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs cursor-pointer"
              >
                Return to Ledger
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-4 space-y-3.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">{invoice.patientName}</div>
                <div className="text-[10px] text-slate-400 font-mono">Invoice: {invoice.id}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Due</div>
                <div className="text-base font-bold font-mono text-slate-900">
                  ${(Number(balanceDue) || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  'Credit/Debit Card',
                  'HSA/FSA',
                  'Direct Insurance',
                  'Cash',
                ].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method as PaymentMethod)}
                    className={`p-2 rounded border text-left font-medium transition cursor-pointer ${
                      paymentMethod === method
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod !== 'Direct Insurance' && paymentMethod !== 'Cash' && (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                    Card Number (Tokenized)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 pl-8 pr-3 text-xs font-mono font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Expires</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">CVV / CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Amount to Process ($)
              </label>
              <input
                type="number"
                step="0.01"
                max={balanceDue}
                min={1}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> AES-256 GCM
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authorizing...
                    </>
                  ) : (
                    <>Authorize ${(Number(payAmount) || 0).toFixed(2)}</>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
