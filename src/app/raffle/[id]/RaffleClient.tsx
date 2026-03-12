"use client";

import { useState } from "react";
import CheckoutModal from "@/components/CheckoutModal";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

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
  status: string;
  tickets: Ticket[];
}

export default function RaffleClient({ raffle }: { raffle: Raffle }) {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTicket = (number: number) => {
    const ticket = raffle.tickets.find(t => t.number === number);
    if (ticket?.status !== 'AVAILABLE') return;

    setSelectedTickets(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  return (
    <main className="min-h-screen pt-8 pb-40 px-4 max-w-7xl mx-auto">
      <Link href="/" className="inline-flex items-center text-[#D1D5DB] hover:text-white transition-colors mb-8 text-sm font-bold tracking-wider uppercase">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Link>

      {raffle.status === "FINISHED" && (
        <div className="bg-brand/10 border-2 border-brand rounded-2xl p-8 text-center mb-12 shadow-[0_0_30px_rgba(212,0,0,0.2)]">
          <h2 className="font-heading text-3xl md:text-5xl text-white uppercase tracking-tight mb-4 text-glow-brand">
            Sorteio Finalizado!
          </h2>
          <p className="text-[#D1D5DB] text-lg mb-4">Esta rifa já foi encerrada. Fique ligado na próxima!</p>
        </div>
      )}
      
      <header className={`mb-16 text-center ${raffle.status === "FINISHED" ? 'opacity-50' : ''}`}>
        <h1 className="font-heading text-4xl md:text-6xl text-white tracking-tight mb-4 uppercase">
          Escolha Suas <span className="text-brand">Cotas</span>
        </h1>
        <p className="text-[#D1D5DB] text-lg max-w-2xl mx-auto mb-8 font-sans">
          Selecione seus números da sorte abaixo. Quanto mais cotas você comprar, maiores as suas chances de levar o prêmio principal.
        </p>
        <div className="inline-block border-2 border-accent bg-accent/10 text-accent font-heading px-8 py-3 rounded-md text-xl md:text-2xl uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          Valor da cota: R$ {raffle.price.toFixed(2)}
        </div>
      </header>

      <section className="mb-20">
        <div className="flex justify-between items-end mb-6">
           <h2 className="text-xl text-[#D1D5DB] uppercase tracking-widest font-heading font-black">Números Disponíveis</h2>
           <span className="text-brand font-bold">{selectedTickets.length} selecionado(s)</span>
        </div>
        
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-2 md:gap-3">
          {raffle.tickets.map((ticket) => {
            const isSelected = selectedTickets.includes(ticket.number);
            const isReserved = ticket.status === 'RESERVED';
            const isPaid = ticket.status === 'PAID';
            const isAvailable = ticket.status === 'AVAILABLE';

            return (
              <button
                key={ticket.id}
                disabled={!isAvailable || raffle.status === "FINISHED"}
                onClick={() => toggleTicket(ticket.number)}
                className={`
                  relative aspect-square rounded-md font-bold text-sm md:text-base transition-all duration-300 flex items-center justify-center overflow-hidden
                  ${isSelected ? 'bg-brand text-white scale-110 shadow-[0_0_20px_rgba(212,0,0,0.6)] z-10 border-brand' : 
                    isPaid ? 'bg-[#0A0A0A] text-[#D1D5DB] border border-white/5 cursor-not-allowed opacity-50' :
                    isReserved ? 'bg-accent/10 text-accent border border-accent/40 cursor-not-allowed' :
                    raffle.status === "FINISHED" ? 'bg-[#111] text-gray-700 border-white/5 cursor-not-allowed opacity-30' :
                    'bg-[#161616] text-[#D1D5DB] hover:bg-[#222] border border-[#333] hover:border-white/30'}
                `}
              >
                <span className="relative z-10">{ticket.number.toString().padStart(3, '0')}</span>
                {/* Diagonal Strike for paid tickets */}
                {isPaid && (
                  <div className="absolute inset-0 w-full h-[2px] bg-brand top-1/2 -translate-y-1/2 rotate-45 z-20"></div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Final CTA Section */}
      {raffle.status !== "FINISHED" && (
        <section className="bg-[#111] border-t border-white/5 rounded-2xl p-10 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl text-white uppercase tracking-tight mb-6">
            Não Deixe Sua Chance <span className="text-brand">Passar</span>
          </h2>
          <p className="text-[#D1D5DB] flex flex-col items-center text-lg mb-10 font-sans">
            Garanta agora mesmo suas cotas e participe do sorteio.
          </p>
          <button 
            onClick={() => {
               if (selectedTickets.length === 0) {
                   alert("Selecione pelo menos uma cota acima.");
                   return;
               }
               setIsModalOpen(true);
            }}
            className="bg-brand text-white font-heading text-xl px-12 py-5 rounded-md box-glow-brand hover:scale-105 transition-all uppercase tracking-wider animate-pulse"
          >
            Comprar Agora
          </button>
        </section>
      )}

      {/* Floating Checkout Bar */}
      {selectedTickets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-[#0A0A0A] border-t-[2px] border-accent p-4 shadow-[0_-10px_40px_rgba(212,175,55,0.1)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-[#D1D5DB] uppercase tracking-widest font-heading font-black mb-1">
                  {selectedTickets.length} Cotas Selecionadas
                </p>
                <p className="text-2xl md:text-4xl font-heading text-gold-gradient leading-none">
                  R$ {(selectedTickets.length * raffle.price).toFixed(2)}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="gold-gradient text-black font-heading tracking-tight text-sm md:text-2xl uppercase px-8 py-4 rounded-md transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <ShoppingCart className="w-5 h-5 md:w-8 md:h-8" />
                <span className="hidden sm:inline font-black">Fechar Compra</span>
              </button>
            </div>
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

