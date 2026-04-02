"use client";

import { useState, useEffect } from "react";

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedTickets,
  totalPrice,
  raffleId
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedTickets: number[];
  totalPrice: number;
  raffleId: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [qrBase64, setQrBase64] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [transactionId, setTransactionId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Load saved user info
  useEffect(() => {
    const savedName = localStorage.getItem("rifa_user_name");
    const savedPhone = localStorage.getItem("rifa_user_phone");
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
  }, []);

  useEffect(() => {
    if (!pixCode || timeLeft <= 0 || isPaid) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [pixCode, timeLeft, isPaid]);

  // Polling for transaction status
  useEffect(() => {
    if (!transactionId || isPaid || timeLeft <= 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transaction/${transactionId}`);
        const data = await res.json();
        if (data.status === 'APPROVED') {
          setIsPaid(true);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [transactionId, isPaid, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    if (val.length > 7) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    }
    
    setPhone(formatted);
  };

  const handleCloseModal = () => {
    // If they generated a PIX, the backend marked tickets as reserved.
    // If they just close without paying, we must reload the page so they see the real ticket status
    // and don't accidentally try to re-buy the same tickets.
    if (pixCode && !isPaid) {
      window.location.reload();
    } else {
      onClose();
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          raffleId,
          ticketNumbers: selectedTickets,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar reserva");
      }

      setPixCode(data.pix_code);
      setQrBase64(data.qr_code_base64);
      setTransactionId(data.transactionId);
      
      // Save info for future purchases
      localStorage.setItem("rifa_user_name", name);
      localStorage.setItem("rifa_user_phone", phone);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal} />
      <div className="relative glass w-full max-w-md rounded-2xl p-6 shadow-2xl border border-brand/20">
        
        <h2 className="text-2xl font-bold mb-2">Finalizar Reserva</h2>
        <p className="text-gray-400 mb-6 font-light">
          Você selecionou {selectedTickets.length} cota(s) por <strong className="text-brand">R$ {totalPrice.toFixed(2)}</strong>.
        </p>

        {isPaid ? (
          <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 box-glow-brand shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 uppercase">Pagamento Aprovado!</h3>
            <p className="text-gray-400 mb-6 font-light">Seu PIX foi processado com sucesso. Seus números já estão garantidos.</p>
            <button 
              onClick={() => window.location.href = '/meus-numeros'}
              className="w-full bg-green-500 text-black font-bold uppercase tracking-widest text-sm py-4 rounded-lg hover:scale-105 transition-transform"
            >
              Ver Meus Números
            </button>
          </div>
        ) : pixCode ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-white rounded-lg flex items-center justify-center">
               <img src={qrBase64 ? `data:image/png;base64,${qrBase64}` : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`} alt="QR Code PIX" className="w-48 h-48" />
            </div>
            <div className="flex flex-col space-y-3">
              <input readOnly value={pixCode} className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-300 font-mono focus:outline-none text-center" />
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(pixCode);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 3000);
                }}
                className={`w-full text-white py-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all box-glow-brand ${isCopied ? 'bg-green-500 text-black scale-95' : 'bg-brand hover:scale-105'}`}
              >
                {isCopied ? "COPIADO! ✔️" : "COPIAR CÓDIGO PIX"}
              </button>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 mt-4">
              <p className="text-center text-accent text-sm font-semibold">Aguardando pagamento...</p>
              <div className="bg-brand/10 border border-brand/20 px-4 py-1 rounded-full">
                <p className="text-brand font-mono font-bold text-lg">
                  {timeLeft > 0 ? formatTime(timeLeft) : "EXPIRADO"}
                </p>
              </div>
              {timeLeft <= 0 && (
                <p className="text-red-500 text-xs text-center animate-pulse">
                  Sua reserva expirou. Se já pagou, aguarde 1 min.
                </p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand transition"
                placeholder="SEU NOME E SOBRENOME COMPLETO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
              <input
                type="tel"
                required
                value={process.env.NEXT_PUBLIC_MOCK ? "(11) 99999-9999" : phone}
                onChange={handlePhoneChange}
                maxLength={15}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand transition"
                placeholder="(11) 99999-9999"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-brand text-white font-bold py-4 rounded-lg mt-6 hover:scale-105 transition-all box-glow-brand disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-8"
            >
              {isProcessing ? "Gerando PIX..." : "Gerar PIX Copia e Cola"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
