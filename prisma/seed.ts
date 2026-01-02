import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️  Cleaning database...")

  await prisma.transactionItem.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.salaryPayment.deleteMany({})
  await prisma.salaryDebt.deleteMany({})
  await prisma.salaryAdjustment.deleteMany({})
  await prisma.salaryPeriod.deleteMany({})
  await prisma.expense.deleteMany({})
  await prisma.cashTransaction.deleteMany({})
  await prisma.attendance.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.service.deleteMany({})
  await prisma.barber.deleteMany({})
  await prisma.cashAccount.deleteMany({})
  await prisma.user.deleteMany({})

  console.log("✅ Database cleaned!")

  console.log("👤 Creating owner user...")

  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.create({
    data: {
      username: "owner",
      email: "owner@barberbro.com",
      password: hashedPassword,
      role: "OWNER"
    }
  })

  console.log("✅ Owner user created!")

  console.log("\n📝 Login credentials:")
  console.log("  👤 Owner:")
  console.log("    Username: owner")
  console.log("    Email: owner@barberbro.com")
  console.log("    Password: admin123")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
