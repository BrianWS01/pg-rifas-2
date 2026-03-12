"use client";

import { useState, useTransition } from "react";
import { fetchUserTickets } from "@/app/actions/tickets";
import { ArrowLeft, Search, Ticket, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

type TicketInfo = {
  id: string;
  number: number;
  status: string;
  raffleTitle: string;
  raffleStatus: string;
  createdAt: Date;
};

// Função para mascarar o telefone: (99) 99999-9999
const formatPhone = (value: string) => {
  if (!value) return "";
  const phone = value.replace(/\D/g, "");
  const match = phone.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  
  if (!match) return value;
  
  if (match[3]) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  } else if (match[2]) {
    return `(${match[1]}) ${match[2]}`;
  } else if (match[1]) {
    // Apenas se o usuário já digitou algo, adicionamos os parênteses
    return phone.length >= 2 ? `(${match[1]}) ` : `(${match[1]}`;
  }
  return phone;
};

export default function MeusNumerosClient() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ user: string; tickets: TicketInfo[] } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    // Limita o tamanho máximo da string formatada "(11) 99999-9999" = 15 chars
    if (formatted.length <= 15) {
      setPhone(formatted);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setHasSearched(true);
    
    // Validar mínimo de caracteres numéricos do celular
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
        setError("Por favor, digite um número de WhatsApp válido com DDD.");
        setResult(null);
        return;
    }

    startTransition(async () => {
      const response = await fetchUserTickets(cleanPhone);
      if (response.success) {
        setResult({ user: response.user!, tickets: response.tickets! as TicketInfo[] });
      } else {
        setError(response.error || "Erro ao buscar números.");
        setResult(null);
      }
    });
  };

  return (
    <main className="min-h-screen pt-8 pb-32 px-4 max-w-3xl mx-auto">
      <Link href="/" className="inline-flex items-center text-[#D1D5DB] hover:text-white transition-colors mb-12 text-sm font-bold tracking-wider uppercase">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
      </Link>

      <header className="text-center mb-12">
        <div className="w-16 h-16 bg-brand/10 border border-brand/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand">
          <Ticket className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-4xl text-white tracking-tight mb-4 uppercase">
          Meus <span className="text-brand">Números</span>
        </h1>
        <p className="text-[#D1D5DB] font-sans text-lg">
          Digite seu WhatsApp abaixo para consultar suas cotas pagas e reservadas.
        </p>
      </header>

      {/* Busca */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 mb-12">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-4 text-white font-mono text-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-gray-600"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isPending || phone.replace(/\D/g, "").length < 10}
            className="gold-gradient text-black font-heading tracking-widest px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:scale-105 transition-all uppercase disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Consultar
          </button>
        </form>
        {error && (
            <p className="text-brand font-bold mt-4 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
            </p>
        )}
      </div>

      {/* Resultados */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center">
            <h2 className="text-xl text-white">
              Olá, <span className="font-bold text-accent">{result.user}</span>!
            </h2>
            {result.tickets.length === 0 ? (
                <p className="text-gray-400 mt-2">Você ainda não tem cotas pagas ou reservadas nesta plataforma.</p>
            ) : (
                <p className="text-gray-400 mt-2">Encontramos {result.tickets.length} cota(s) vinculada(s) ao seu número.</p>
            )}
          </div>

          {result.tickets.length > 0 && (
            <div className="space-y-4">
              {result.tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className={`
                    flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border 
                    ${ticket.status === 'PAID' 
                      ? 'bg-green-500/5 border-green-500/20 box-glow-brand shadow-[0_0_15px_rgba(34,197,94,0.05)]' 
                      : 'bg-accent/5 border-accent/20'}
                  `}
                >
                  <div className="flex items-center gap-6 mb-4 sm:mb-0">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-heading text-2xl
                      ${ticket.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-accent/20 text-accent'}
                    `}>
                      {ticket.number.toString().padStart(3, '0')}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{ticket.raffleTitle}</h3>
                      <p className="text-sm text-gray-400">
                        Adquirido em {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end gap-2">
                    {ticket.status === 'PAID' ? (
                      <div className="flex items-center text-green-500 font-bold text-sm bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Aprovado
                      </div>
                    ) : (
                      <div className="flex flex-col sm:items-end">
                        <div className="flex items-center text-accent font-bold text-sm bg-accent/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          Aguardando PIX
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.tickets.some(t => t.status === "RESERVED") && (
             <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 flex items-start gap-4 mt-8">
               <AlertCircle className="w-6 h-6 text-brand shrink-0 mt-0.5" />
               <p className="text-sm text-gray-300 leading-relaxed">
                 Você possui cotas <strong className="text-brand">AGUARDANDO PIX</strong>. Lembre-se que as reservas expiram rapidamente. 
                 Se você não pagou o código PIX gerado anteriormente, essas cotas voltarão a ficar disponíveis para outras pessoas.
                 Para garantir seus números, volte à página da rifa e refaça a compra ou pague o PIX pendente.
               </p>
             </div>
          )}
        </div>
      )}
    </main>
  );
}
