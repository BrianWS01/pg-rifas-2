"use server";

import prisma from "@/lib/prisma";

export async function fetchUserTickets(phone: string) {
  try {
    // Busca o usuário pelo telefone (removendo caracteres não numéricos caso venham)
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (!cleanPhone) {
        return { success: false, error: "Telefone inválido." };
    }

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: {
        tickets: {
          include: {
            raffle: {
              select: {
                title: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return { success: false, error: "Nenhum comprador encontrado com este número." };
    }

    // Filtrar apenas tickets que importam para o usuário (PAID e RESERVED)
    const activeTickets = user.tickets.filter(t => t.status === "PAID" || t.status === "RESERVED");

    if (activeTickets.length === 0) {
       return { success: true, user: user.name, tickets: [] };
    }

    return { 
      success: true, 
      user: user.name,
      tickets: activeTickets.map(t => ({
        id: t.id,
        number: t.number,
        status: t.status,
        raffleTitle: t.raffle.title,
        raffleStatus: t.raffle.status,
        createdAt: t.createdAt
      }))
    };

  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return { success: false, error: "Erro interno ao buscar cotas." };
  }
}
