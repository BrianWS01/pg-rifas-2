import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Encontrar tickets RESERVADOS há mais de 30 minutos
    // Ou tickets RESERVADOS que não tem transação (reservas órfãs)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Tickets expirados (mais de 30 min)
    const expiredTickets = await prisma.ticket.findMany({
      where: {
        status: 'RESERVED',
        updatedAt: { lte: thirtyMinutesAgo }
      }
    });

    if (expiredTickets.length > 0) {
      await prisma.ticket.updateMany({
        where: {
          id: { in: expiredTickets.map(t => t.id) }
        },
        data: {
          status: 'AVAILABLE',
          userId: null
        }
      });
    }

    // EXTRA: Limpar tickets RESERVADOS que o usuário "excluiu" manualmente a transação no banco
    // Buscamos todos os RESERVED e vemos se existe transação PENDING para eles
    const allReserved = await prisma.ticket.findMany({
      where: { status: 'RESERVED' }
    });

    const cleanedOrphaned = [];
    for (const ticket of allReserved) {
        const hasTransaction = await prisma.transaction.findFirst({
            where: {
                ticketIds: { contains: ticket.id },
                status: 'PENDING'
            }
        });

        if (!hasTransaction) {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: { status: 'AVAILABLE', userId: null }
            });
            cleanedOrphaned.push(ticket.number);
        }
    }

    return NextResponse.json({ 
        success: true, 
        expiredReset: expiredTickets.length,
        orphanedReset: cleanedOrphaned.length,
        numbers: cleanedOrphaned
    });

  } catch (error: any) {
    console.error('Cleanup Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
