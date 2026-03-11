import prisma from "@/lib/prisma";
import RaffleClient from "./RaffleClient";
import { notFound } from "next/navigation";

export default async function RaffleDetails({ params }: { params: { id: string } }) {
  const { id } = await params;

  const raffle = await prisma.raffle.findUnique({
    where: { id },
    include: {
      tickets: {
        orderBy: { number: 'asc' }
      }
    }
  });

  if (!raffle) {
    notFound();
  }

  // Pass only plain data to the Client Component
  const plainRaffle = {
    ...raffle,
    price: Number(raffle.price),
    tickets: raffle.tickets.map((t: any) => ({
      ...t,
      // number is already Int
    }))
  };

  return <RaffleClient raffle={plainRaffle} />;
}
