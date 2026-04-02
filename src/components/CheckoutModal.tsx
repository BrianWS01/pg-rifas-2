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
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    if (!pixCode || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [pixCode, timeLeft]);

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
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass w-full max-w-md rounded-2xl p-6 shadow-2xl border border-primary/20">
        
        <h2 className="text-2xl font-bold mb-2">Finalizar Reserva</h2>
        <p className="text-gray-400 mb-6 font-light">
          Você selecionou {selectedTickets.length} cota(s) por <strong className="text-brand">R$ {totalPrice.toFixed(2)}</strong>.
        </p>

        {pixCode ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-white rounded-lg flex items-center justify-center">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${pixCode}`} alt="QR Code PIX" className="w-48 h-48" />
            </div>
            <div className="flex flex-col space-y-3">
              <input readOnly value={pixCode} className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-300 font-mono focus:outline-none text-center" />
              <button 
                type="button"
                onClick={() => navigator.clipboard.writeText(pixCode)}
                className="w-full bg-brand text-white py-4 rounded-lg font-bold uppercase tracking-wider text-sm hover:scale-105 transition-all box-glow-brand"
              >
                COPIAR CÓDIGO PIX
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
