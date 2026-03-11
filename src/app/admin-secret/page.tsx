import prisma from "@/lib/prisma";
import { ArrowLeft, Users, CreditCard, Ticket as TicketIcon, DollarSign } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  // Puxar a última rifa ativa (ou a única, no nosso caso atual)
  const activeRaffle = await prisma.raffle.findFirst({
    where: { status: "ACTIVE" },
    include: {
      tickets: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!activeRaffle) {
    return (
      <main className="min-h-screen pt-24 px-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Admin Dashboard</h1>
        <p className="text-gray-400">Nenhuma rifa ativa encontrada.</p>
      </main>
    );
  }

  // Estatísticas Rápidas
  const totalCotts = activeRaffle.totalTickets;
  const pricePerCota = Number(activeRaffle.price);
  
  const availableCotts = activeRaffle.tickets.filter(t => t.status === "AVAILABLE").length;
  const reservedCotts = activeRaffle.tickets.filter(t => t.status === "RESERVED").length;
  const paidCotts = activeRaffle.tickets.filter(t => t.status === "PAID").length;

  const totalRevenueExpected = totalCotts * pricePerCota;
  const revenueConfirmed = paidCotts * pricePerCota;
  const revenuePending = reservedCotts * pricePerCota;

  // Agrupar compradores
  const buyersMap = new Map();
  activeRaffle.tickets.forEach(ticket => {
    if (ticket.user && ticket.status !== 'AVAILABLE') {
      const u = ticket.user;
      if (!buyersMap.has(u.id)) {
        buyersMap.set(u.id, {
          name: u.name,
          phone: u.phone,
          reserved: [],
          paid: []
        });
      }
      
      if (ticket.status === 'RESERVED') {
          buyersMap.get(u.id).reserved.push(ticket.number);
      } else if (ticket.status === 'PAID') {
          buyersMap.get(u.id).paid.push(ticket.number);
      }
    }
  });

  const buyersList = Array.from(buyersMap.values()).sort((a, b) => {
      // Sort by whoever has paid or reserved more tickets
      const totalA = a.paid.length + a.reserved.length;
      const totalB = b.paid.length + b.reserved.length;
      return totalB - totalA;
  });

  return (
    <main className="min-h-screen pb-32 pt-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-bold tracking-wider uppercase">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Site
        </Link>
        <h1 className="font-heading text-3xl text-white uppercase tracking-tight">
          Painel de <span className="text-brand">Gestão</span>
        </h1>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{activeRaffle.title}</h2>
        <p className="text-gray-400">Visão geral e relatórios de vendas.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TicketIcon className="w-16 h-16 text-white" />
          </div>
          <p className="text-gray-400 font-bold tracking-wider uppercase text-xs mb-2">Total de Cotas</p>
          <p className="text-4xl font-heading text-white">{totalCotts}</p>
          <div className="mt-4 text-sm flex justify-between text-gray-500">
             <span>Disponíveis:</span>
             <span className="text-white font-bold">{availableCotts}</span>
          </div>
        </div>

        <div className="bg-[#111] border border-accent/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-16 h-16 text-accent" />
          </div>
          <p className="text-accent font-bold tracking-wider uppercase text-xs mb-2">Cotas Reservadas (Aguardando PIX)</p>
          <p className="text-4xl font-heading text-accent">{reservedCotts}</p>
          <div className="mt-4 text-sm flex justify-between text-gray-500">
             <span>Receita Pendente:</span>
             <span className="text-accent font-bold">R$ {revenuePending.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 relative overflow-hidden box-glow-brand" style={{ boxShadow: '0 0 15px rgba(34,197,94,0.1)' }}>
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-green-500 font-bold tracking-wider uppercase text-xs mb-2">Cotas Pagas</p>
          <p className="text-4xl font-heading text-green-500">{paidCotts}</p>
          <div className="mt-4 text-sm flex justify-between text-gray-500">
             <span>Progresso:</span>
             <span className="text-green-500 font-bold">{((paidCotts / totalCotts) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-brand/10 border border-brand/30 rounded-2xl p-6 relative overflow-hidden text-brand">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign className="w-16 h-16" />
          </div>
          <p className="font-bold tracking-wider uppercase text-xs mb-2">Receita Confirmada</p>
          <p className="text-4xl font-heading">R$ {revenueConfirmed.toFixed(2)}</p>
           <div className="mt-4 text-sm flex justify-between opacity-70">
             <span>Meta Total:</span>
             <span className="font-bold">R$ {totalRevenueExpected.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tabela de Compradores */}
      <h3 className="font-heading text-2xl text-white uppercase tracking-tight mb-6 flex items-center gap-3">
        Últimos <span className="text-accent">Compradores</span>
      </h3>
      
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        {buyersList.length === 0 ? (
           <div className="p-8 text-center text-gray-500">
             Nenhum comprador registrado ainda.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-bold">Nome</th>
                  <th className="p-4 font-bold">WhatsApp</th>
                  <th className="p-4 font-bold">Cotas Pagas</th>
                  <th className="p-4 font-bold">Cotas Reservadas</th>
                  <th className="p-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {buyersList.map((buyer, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">{buyer.name}</td>
                    <td className="p-4 text-gray-300 font-mono">{buyer.phone}</td>
                    <td className="p-4">
                      {buyer.paid.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {buyer.paid.map((num: number) => (
                            <span key={num} className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-xs font-bold">
                              {num.toString().padStart(3, '0')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {buyer.reserved.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {buyer.reserved.map((num: number) => (
                            <span key={num} className="bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded text-xs font-bold">
                               {num.toString().padStart(3, '0')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                       <a 
                          href={`https://wa.me/${buyer.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(buyer.name)},%20vi%20que%20você%20reservou%20cotas%20na%20nossa%20rifa!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-black font-bold px-4 py-2 rounded transition-colors text-xs uppercase tracking-wider"
                       >
                         Chamar no Whats
                       </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
