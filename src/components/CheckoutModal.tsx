"use client";

import { useState } from "react";

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

  if (!isOpen) return null;

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
          Você selecionou {selectedTickets.length} cota(s) por <strong className="text-primary">R$ {totalPrice.toFixed(2)}</strong>.
        </p>

        {pixCode ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-white rounded-lg flex items-center justify-center">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${pixCode}`} alt="QR Code PIX" className="w-48 h-48" />
            </div>
            <div className="relative">
              <input readOnly value={pixCode} className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-300 font-mono focus:outline-none" />
              <button 
                onClick={() => navigator.clipboard.writeText(pixCode)}
                className="absolute right-2 top-2 bg-primary text-black px-4 py-1.5 rounded-md text-xs font-bold hover:bg-yellow-400 transition"
              >
                COPIAR
              </button>
            </div>
            <p className="text-center text-accent text-sm font-semibold mt-4">Aguardando pagamento...</p>
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
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
              <input
                type="tel"
                required
                value={process.env.NEXT_PUBLIC_MOCK ? "11999999999" : phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition"
                placeholder="(11) 99999-9999"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-primary text-black font-bold py-4 rounded-lg mt-6 hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Gerando PIX..." : "Gerar PIX Copia e Cola"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
