import Link from "next/link";
import { Ticket, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let activeRaffles: any[] = [];
  try {
    activeRaffles = await prisma.raffle.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("DB error on home page:", error);
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#1a0000] via-[#0a0000] to-transparent -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand bg-brand/10 text-brand font-bold text-sm tracking-wider uppercase animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand"></span>
            Sorteio Especial da Barbearia
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl xl:text-8xl tracking-tighter uppercase leading-none">
            GANHE UM <span className="text-gold-gradient">PS5</span> OU <br/>
            <span className="text-gold-gradient">R$ 1.500</span> NO PIX
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A oportunidade perfeita de levar o console mais desejado da geração ou dinheiro vivo direto na sua conta.
          </p>

          <div className="pt-8">
            <Link href="#rifas" className="inline-flex items-center gap-2 bg-brand text-white font-heading text-xl px-10 py-5 rounded-md box-glow-brand hover:scale-105 transition-all">
              VER COTAS DISPONÍVEIS <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Raffles Section */}
      <section id="rifas" className="px-4 max-w-7xl mx-auto mt-12 bg-[#111] border-t border-white/5 pt-20">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-tight text-glow-brand text-white">
            Rifas <span className="text-brand">Ativas</span>
          </h2>
        </div>
        
        {activeRaffles.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-white/5">
            <p className="text-gray-500 text-lg">Nenhuma rifa ativa no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeRaffles.map((raffle: any) => (
              <Link key={raffle.id} href={`/raffle/${raffle.id}`} className="group relative block rounded-2xl border-2 border-brand bg-[#0A0A0A] overflow-hidden transition-all hover:-translate-y-2 box-glow-brand">
                <div className="relative h-64 bg-[#111] flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-brand/20 blur-2xl group-hover:bg-brand/40 transition-colors"></div>
                   {/* Fallback image if PS5 image is missing */}
                   <img src="/ps5.png" alt="PS5" className="relative z-10 w-4/5 object-contain group-hover:scale-110 transition-transform duration-500" />
                   
                   <div className="absolute top-4 right-4 bg-accent text-black px-3 py-1 text-xs font-bold uppercase tracking-wider z-20">
                     Apenas R$ {Number(raffle.price).toFixed(2)}
                   </div>

                   {/* Footer gradient */}
                   <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10"></div>
                   <div className="absolute bottom-4 left-4 z-20">
                      <span className="font-heading text-xl text-white tracking-tight uppercase">PS5 1TB</span>
                   </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-heading text-2xl text-white mb-2 uppercase tracking-tight group-hover:text-brand transition-colors">{raffle.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{raffle.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
