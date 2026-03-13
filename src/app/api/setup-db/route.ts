import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const setupSecret = process.env.SETUP_DB_SECRET || 'RifasPg2026';

  // Segurança simples para evitar acessos indesejados
  if (secret !== setupSecret) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const results: any = {
    steps: []
  };

  try {
    // 1. Sincronizar o Banco (Tabelas)
    results.steps.push({ name: 'DB Push', status: 'Iniciando...' });
    const pushOutput = execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    }).toString();
    results.steps[0].status = 'Sucesso';
    results.steps[0].output = pushOutput;

    // 2. Rodar o Seed (Dados)
    results.steps.push({ name: 'Seed', status: 'Iniciando...' });
    
    // Deletar o que existir para garantir um fresh start (mesma lógica do seed.ts)
    await prisma.transaction.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.raffle.deleteMany({});
    await prisma.user.deleteMany({});

    const raffle = await prisma.raffle.upsert({
      where: { id: 'ps5-ou-1500-pix' },
      update: {},
      create: {
        id: 'ps5-ou-1500-pix',
        title: 'PS5 + 2 Controles e 1TB ou R$ 1.500 no PIX',
        description: 'Participe e concorra a um PlayStation 5 com 2 controles e 1TB de armazenamento, ou leve R$ 1.500 direto no seu PIX se preferir!',
        price: 15.00,
        totalTickets: 350,
        status: 'ACTIVE',
      },
    });

    // Gerar os 350 números
    const ticketsData = Array.from({ length: 350 }).map((_, i) => ({
      number: i + 1,
      raffleId: 'ps5-ou-1500-pix',
      status: 'AVAILABLE' as const,
    }));

    await prisma.ticket.createMany({
      data: ticketsData,
    });

    results.steps[1].status = 'Sucesso';
    results.steps[1].details = `Rifa criada: ${raffle.title}. 350 números gerados.`;

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message, 
      stack: err.stack,
      partialResults: results 
    }, { status: 500 });
  }
}
