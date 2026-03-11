import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Clean up existing data (optional, useful for testing)
  // await prisma.ticket.deleteMany({})
  // await prisma.raffle.deleteMany({})
  
  // 2. Create the initial Raffle
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
  })

  console.log(`Raffle created: ${raffle.title}`)

  // 3. Generate 100 tickets for this raffle if they don't exist
  const existingTickets = await prisma.ticket.count({
    where: { raffleId: raffle.id }
  })

  if (existingTickets === 0) {
    console.log('Generating 350 tickets...')
    const ticketsData = Array.from({ length: 350 }).map((_, i) => ({
      number: i + 1,
      raffleId: raffle.id,
      status: 'AVAILABLE' as const,
    }))

    await prisma.ticket.createMany({
      data: ticketsData,
    })
    console.log('350 tickets generated successfully.')
  } else {
    console.log(`${existingTickets} tickets already exist for this raffle.`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
