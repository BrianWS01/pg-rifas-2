import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Clean up existing data (optional, useful for testing)
  // await prisma.ticket.deleteMany({})
  // await prisma.raffle.deleteMany({})
  
  // 2. Create the initial Raffle
  const raffle = await prisma.raffle.upsert({
    where: { id: 'iphone-15-pro-max' },
    update: {},
    create: {
      id: 'iphone-15-pro-max',
      title: 'iPhone 15 Pro Max 256GB',
      description: 'Sorteio do novo iPhone 15 Pro Max na caixa lacrado com garantia de 1 ano. Participe e concorra!',
      price: 0.50,
      totalTickets: 100,
      status: 'ACTIVE',
    },
  })

  console.log(`Raffle created: ${raffle.title}`)

  // 3. Generate 100 tickets for this raffle if they don't exist
  const existingTickets = await prisma.ticket.count({
    where: { raffleId: raffle.id }
  })

  if (existingTickets === 0) {
    console.log('Generating 100 tickets...')
    const ticketsData = Array.from({ length: 100 }).map((_, i) => ({
      number: i + 1,
      raffleId: raffle.id,
      status: 'AVAILABLE' as const,
    }))

    await prisma.ticket.createMany({
      data: ticketsData,
    })
    console.log('100 tickets generated successfully.')
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
