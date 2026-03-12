import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { paymentClient } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    const { name, phone, raffleId, ticketNumbers } = await req.json();

    if (!name || !phone || !raffleId || !ticketNumbers || ticketNumbers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find the raffle
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      return NextResponse.json({ error: 'Raffle not found' }, { status: 404 });
    }

    // 2. Start a transaction to reserve tickets and create the payment
    const result = await prisma.$transaction(async (tx: any) => {
      // Create or update user
      const user = await tx.user.upsert({
        where: { phone },
        update: { name },
        create: { name, phone },
      });

      // Check if all requested tickets are AVAILABLE
      const tickets = await tx.ticket.findMany({
        where: {
          raffleId,
          number: { in: ticketNumbers },
          status: 'AVAILABLE',
        },
      });

      if (tickets.length !== ticketNumbers.length) {
        throw new Error('Some tickets are already reserved or paid');
      }

      // Mark tickets as RESERVED
      await tx.ticket.updateMany({
        where: {
          raffleId,
          number: { in: ticketNumbers },
        },
        data: {
          status: 'RESERVED',
          userId: user.id,
        },
      });

      // Calculate total amount
      const totalAmount = Number(raffle.price) * ticketNumbers.length;

      // Create internal transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: totalAmount,
          userId: user.id,
          ticketIds: JSON.stringify(tickets.map((t: any) => t.id)),
          status: 'PENDING',
        },
      });

      return { user, transaction, totalAmount };
    });

    // Calculate expiration date (15 minutes from now)
    const expirationDate = new Date(Date.now() + 15 * 60 * 1000);

    // 3. Create Mercado Pago Payment (PIX)
    const payment = await paymentClient.create({
      body: {
        transaction_amount: result.totalAmount,
        description: `Rifa: ${raffle.title} - Tickets: ${ticketNumbers.join(', ')}`,
        payment_method_id: 'pix',
        date_of_expiration: expirationDate.toISOString(),
        payer: {
          email: 'test_user_123@testuser.com', // Mercado Pago requires an email
          first_name: result.user.name.split(' ')[0],
          last_name: result.user.name.split(' ').slice(1).join(' ') || 'User',
          identification: {
            type: 'CPF',
            number: '19100000000', // Mock CPF for testing
          },
        },
        notification_url: process.env.MP_WEBHOOK_URL,
        external_reference: result.transaction.id,
      },
    });

    // 4. Update transaction with external (MP) ID and PIX info
    await prisma.transaction.update({
      where: { id: result.transaction.id },
      data: { 
        externalId: String(payment.id),
        pixCode: payment.point_of_interaction?.transaction_data?.qr_code,
        pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code_base64
      },
    });

    return NextResponse.json({
      pix_code: payment.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      transactionId: result.transaction.id,
    });

  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
