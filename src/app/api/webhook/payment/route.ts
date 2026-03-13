import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { paymentClient } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

    console.log(`Webhook received: ID=${id}, Type=${type}`);

    // Mercado Pago sends different types of notifications. We care about 'payment'.
    if (type === 'payment' && id) {
      // 1. Fetch the payment details from Mercado Pago to verify status
      const payment = await paymentClient.get({ id: String(id) });
      
      const externalId = String(payment.id);
      const status = payment.status;

      console.log(`Payment verify: ID=${externalId}, Status=${status}`);

      if (status === 'approved') {
        // Find our transaction using externalId
        const transaction = await prisma.transaction.findUnique({
          where: { externalId },
        });

        if (transaction && transaction.status !== 'APPROVED') {
          // Update transaction and tickets in a batch
          const ticketIds = JSON.parse(transaction.ticketIds);
          
          await prisma.$transaction([
            prisma.transaction.update({
              where: { id: transaction.id },
              data: { status: 'APPROVED' },
            }),
            prisma.ticket.updateMany({
              where: {
                id: { in: ticketIds },
              },
              data: { status: 'PAID' },
            }),
          ]);
          console.log(`SUCCESS: Payment ${externalId} approved. Tickets ${ticketIds.length} updated to PAID.`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
