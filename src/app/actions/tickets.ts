"use server";

import prisma from "@/lib/prisma";

export async function fetchUserTickets(phone: string) {
  try {
    // Busca o usuário pelo telefone (removendo caracteres não numéricos caso venham)
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (!cleanPhone) {
        return { success: false, error: "Telefone inválido." };
    }

    const user = await prisma.user.findFirst({
      where: { 
        phone: { contains: cleanPhone.slice(-8) } 
      },
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
        },
        transactions: {
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
      tickets: activeTickets.map((t: any) => {
        // Encontrar a transação mais recente associada a este ticket
        const transaction = user.transactions.find((tr: any) => {
          try {
            const ticketIds = JSON.parse(tr.ticketIds);
            return Array.isArray(ticketIds) && ticketIds.includes(t.id);
          } catch(e) {
            return false;
          }
        });

        return {
          id: t.id,
          number: t.number,
          status: t.status,
          raffleTitle: t.raffle.title,
          raffleStatus: t.raffle.status,
          createdAt: t.createdAt,
          pixCode: t.status === "RESERVED" && transaction ? transaction.pixCode : null,
          pixQrCode: t.status === "RESERVED" && transaction ? transaction.pixQrCode : null
        };
      })
    };

  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return { success: false, error: "Erro interno ao buscar cotas." };
  }
}
