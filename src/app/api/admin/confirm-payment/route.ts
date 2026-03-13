import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { ticketNumbers, phone } = await req.json();

    if (!ticketNumbers || !phone) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    // 1. Encontrar o usuário
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // 2. Marcar tickets como PAID
    await prisma.ticket.updateMany({
      where: {
        number: { in: ticketNumbers },
        userId: user.id
      },
      data: {
        status: 'PAID'
      }
    });

    // 3. Opcional: Marcar transação vinculada como APPROVED se existir
    // (Simplificado para o admin)
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Confirm Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
