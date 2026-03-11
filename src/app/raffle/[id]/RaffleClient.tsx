"use client";

import { useState } from "react";
import CheckoutModal from "@/components/CheckoutModal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Ticket {
  id: string;
  number: number;
  status: 'AVAILABLE' | 'RESERVED' | 'PAID';
}

interface Raffle {
  id: string;
  title: string;
  description: string | null;
  price: number;
  totalTickets: number;
  tickets: Ticket[];
}

export default function RaffleClient({ raffle }: { raffle: Raffle }) {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTicket = (number: number) => {
    // Only allow selecting available tickets
    const ticket = raffle.tickets.find(t => t.number === number);
    if (ticket?.status !== 'AVAILABLE') return;

    setSelectedTickets(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  return (
    <main className="min-h-screen pt-8 pb-32 px-4 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center text-primary hover:text-white transition-colors mb-8 text-sm font-semibold tracking-wider uppercase">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Link>
      
      <header className="mb-12">
        <div className="glass p-6 md:p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase">{raffle.title}</h1>
          <p className="text-gray-400 leading-relaxed max-w-2xl text-lg">
            {raffle.description || "Adquira já a sua cota e concorra a este prêmio exclusivo."}
          </p>
          <div className="mt-8 inline-block bg-primary/10 border border-primary/20 text-primary px-6 py-2 rounded-full font-bold text-lg">
            R$ {raffle.price.toFixed(2)} / cota
          </div>
        </div>
      </header>

      <section>
        <div className="flex justify-between items-end mb-6">
           <h2 className="text-2xl font-bold">Escolha seus números</h2>
           <span className="text-gray-500 text-sm">{selectedTickets.length} selecionado(s)</span>
        </div>
        
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
          {raffle.tickets.map((ticket) => {
            const isSelected = selectedTickets.includes(ticket.number);
            const isReserved = ticket.status === 'RESERVED';
            const isPaid = ticket.status === 'PAID';
            const isAvailable = ticket.status === 'AVAILABLE';

            return (
              <button
                key={ticket.id}
                disabled={!isAvailable}
                onClick={() => toggleTicket(ticket.number)}
                className={`
                  aspect-square rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center
                  ${isSelected ? 'bg-primary text-black scale-105 shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 
                    isPaid ? 'bg-accent/20 text-accent border border-accent/30 cursor-not-allowed opacity-50' :
                    isReserved ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-not-allowed opacity-50' :
                    'bg-secondary text-gray-300 hover:bg-white/10 border border-white/5'}
                `}
              >
                {ticket.number.toString().padStart(3, '0')}
              </button>
            );
          })}
        </div>
      </section>

      {/* Floating Checkout Bar */}
      {selectedTickets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 animate-in slide-in-from-bottom-5">
          <div className="max-w-4xl mx-auto glass rounded-2xl p-4 flex items-center justify-between border border-primary/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div>
              <p className="text-sm text-gray-400">Total a pagar</p>
              <p className="text-2xl font-black text-primary">R$ {(selectedTickets.length * raffle.price).toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-yellow-400 text-black font-black uppercase px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Reservar
            </button>
          </div>
        </div>
      )}

      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedTickets={selectedTickets}
        totalPrice={selectedTickets.length * raffle.price}
        raffleId={raffle.id}
      />
    </main>
  );
}
