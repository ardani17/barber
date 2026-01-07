import { prisma } from "@/lib/prisma"

async function verifySeedData() {
  console.log("🔍 Verifying seed data...")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

  const [todayTx, weekTx, monthTx, allTx] = await Promise.all([
    prisma.transaction.count({
      where: {
        date: {
          gte: today,
          lte: endOfToday
        }
      }
    }),
    prisma.transaction.count({
      where: {
        date: {
          gte: sevenDaysAgo,
          lte: endOfToday
        }
      }
    }),
    prisma.transaction.count({
      where: {
        date: {
          gte: thirtyDaysAgo,
          lte: endOfToday
        }
      }
    }),
    prisma.transaction.count()
  ])

  console.log("\n📊 Transaction Counts:")
  console.log(`   Today: ${todayTx} transactions`)
  console.log(`   Last 7 Days: ${weekTx} transactions`)
  console.log(`   Last 30 Days: ${monthTx} transactions`)
  console.log(`   Total: ${allTx} transactions`)

  const transactions = await prisma.transaction.findMany({
    orderBy: {
      date: "desc"
    },
    take: 10,
    include: {
      barber: true,
      cashier: true
    }
  })

  console.log("\n📅 Recent Transactions (Top 10):")
  transactions.forEach((tx, index) => {
    const dateStr = tx.date.toISOString().split("T")[0]
    console.log(`   ${index + 1}. ${dateStr} - ${tx.barber.name} - Rp ${tx.totalAmount}`)
  })

  await prisma.$disconnect()
}

verifySeedData().catch(console.error)
