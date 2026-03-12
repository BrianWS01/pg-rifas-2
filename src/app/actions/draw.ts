"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function drawWinner(raffleId: string) {
  try {
    // 1. Get the raffle and its PAID tickets
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        tickets: {
          where: { status: "PAID" },
          include: { user: true }
        }
      }
    });

    if (!raffle) {
      return { success: false, error: "Rifa não encontrada." };
    }

    if (raffle.status === "FINISHED") {
      return { success: false, error: "Esta rifa já foi sorteada!" };
    }

    if (raffle.tickets.length === 0) {
      return { success: false, error: "Não há cotas PAGAS para realizar o sorteio." };
    }

    // 2. Draw a random ticket from the PAID ones
    const randomIndex = Math.floor(Math.random() * raffle.tickets.length);
    const winningTicket = raffle.tickets[randomIndex];

    if (!winningTicket || !winningTicket.user) {
      return { success: false, error: "Erro ao sortear cota. Comprador não identificado." };
    }

    // 3. Update the Raffle status and winner info
    await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        status: "FINISHED",
        winnerTicketId: winningTicket.id,
        winnerName: winningTicket.user.name,
      }
    });

    // Revalidate paths to update UI
    revalidatePath("/");
    revalidatePath("/admin-secret");
    revalidatePath(`/raffle/${raffleId}`);

    return { 
      success: true, 
      winner: {
        name: winningTicket.user.name,
        ticketNumber: winningTicket.number,
        phone: winningTicket.user.phone
      }
    };

  } catch (error) {
    console.error("Error drawing winner:", error);
    return { success: false, error: "Erro interno ao realizar sorteio." };
  }
}
