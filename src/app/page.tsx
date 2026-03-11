import Link from "next/link";
import { Ticket } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const activeRaffles = await prisma.raffle.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen pt-20 pb-16 px-4 max-w-5xl mx-auto">
      <header className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary to-amber-600">
          Street Barber Shop
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light">
          A plataforma de prêmios premium
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Ticket className="text-accent" />
          Rifas Ativas
        </h2>
        
        {activeRaffles.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-white/5">
            <p className="text-gray-500 text-lg">Nenhuma rifa ativa no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRaffles.map((raffle: any) => (
              <Link key={raffle.id} href={`/raffle/${raffle.id}`} className="group relative block overflow-hidden rounded-2xl glass transition-all hover:scale-[1.02] hover:border-primary/50 duration-300">
                <div className="p-1">
                  <div className="h-48 rounded-xl bg-secondary/80 flex items-center justify-center relative overflow-hidden">
                     {/* Placeholder for real image */}
                     <span className="text-4xl font-black text-white/10 uppercase tracking-widest">{raffle.title.split(' ')[0]}</span>
                     <div className="absolute top-4 right-4 bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold border border-accent/30 tracking-wider">
                       ATIVO
                     </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{raffle.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6">{raffle.description}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-gray-500 text-sm">Por apenas</span>
                    <span className="text-2xl font-black text-primary">R$ {Number(raffle.price).toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
