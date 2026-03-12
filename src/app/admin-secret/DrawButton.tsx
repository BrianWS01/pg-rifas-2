"use client";

import { useState, useTransition } from "react";
import { drawWinner } from "@/app/actions/draw";
import { Trophy, Loader2 } from "lucide-react";

interface DrawButtonProps {
  raffleId: string;
  isFinished: boolean;
  winnerName?: string | null;
  winnerTicketId?: string | null;
}

export default function DrawButton({ raffleId, isFinished, winnerName, winnerTicketId }: DrawButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDraw = () => {
    if (!confirm("TEM CERTEZA absoluta que deseja realizar o sorteio agora? Esta ação não pode ser desfeita e apenas cotas PAGAS concorrem.")) {
      return;
    }

    startTransition(async () => {
      const result = await drawWinner(raffleId);
      if (result.success && result.winner) {
         alert(`🎉 SORTEIO REALIZADO COM SUCESSO!\n\nVencedor: ${result.winner.name}\nTicket: ${result.winner.ticketNumber}\nWhatsApp: ${result.winner.phone}`);
      } else {
         alert(`❌ Erro: ${result.error}`);
      }
    });
  };

  if (isFinished) {
    return (
      <div className="bg-brand/10 border-2 border-brand rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(212,0,0,0.2)]">
        <Trophy className="w-16 h-16 text-brand mx-auto mb-4" />
        <h3 className="font-heading text-2xl text-white uppercase tracking-tight mb-2">Rifa Finalizada!</h3>
        <p className="text-gray-400 mb-4">O grande vencedor desta rifa foi:</p>
        <div className="inline-block bg-[#0A0A0A] border border-white/10 rounded-xl px-8 py-4">
           <p className="font-heading text-3xl text-gold-gradient uppercase">{winnerName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
      <h3 className="font-heading text-2xl text-white uppercase tracking-tight mb-4">Realizar Sorteio</h3>
      <p className="text-gray-400 mb-8 max-w-lg">
        Atenção: Apenas cotas com status <strong>PAGO (PAID)</strong> participarão do sorteio. Esta ação encerra a rifa definitivamente.
      </p>
      <button 
        onClick={handleDraw}
        disabled={isPending}
        className="gold-gradient text-black font-heading text-xl md:text-2xl uppercase px-12 py-5 rounded-md box-glow-brand hover:scale-105 transition-all flex items-center justify-center gap-3 w-full md:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-black">Sorteando...</span>
          </>
        ) : (
          <>
            <Trophy className="w-6 h-6" />
            <span className="font-black">SORTEAR AGORA</span>
          </>
        )}
      </button>
    </div>
  );
}
