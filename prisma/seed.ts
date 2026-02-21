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

  console.log("\n👤 Creating users...")

  const hashedPassword = await bcrypt.hash("admin123", 10)
  const cashierPassword = await bcrypt.hash("kasir123", 10)
  const barberPassword = await bcrypt.hash("barber123", 10)

  const owner = await prisma.user.create({
    data: {
      username: "owner",
      email: "owner@barberbro.com",
      password: hashedPassword,
      role: "OWNER"
    }
  })

  const cashier = await prisma.user.create({
    data: {
      username: "kasir",
      email: "kasir@barberbro.com",
      password: cashierPassword,
      role: "CASHIER"
    }
  })

  console.log("✅ Users created!")

  console.log("\n💰 Creating cash accounts...")

  const cashAccount = await prisma.cashAccount.create({
    data: {
      name: "Kas Utama",
      type: "TUNAI",
      balance: 5000000,
      isActive: true,
      isDefault: true
    }
  })

  const bankAccount = await prisma.cashAccount.create({
    data: {
      name: "BCA",
      type: "BANK",
      accountNumber: "1234567890",
      balance: 10000000,
      isActive: true,
      isDefault: false
    }
  })

  const qrisAccount = await prisma.cashAccount.create({
    data: {
      name: "QRIS",
      type: "QRIS",
      balance: 3000000,
      isActive: true,
      isDefault: false
    }
  })

  console.log("✅ Cash accounts created!")

  console.log("\n💈 Creating barbers...")

  const barber1 = await prisma.barber.create({
    data: {
      name: "Andi",
      isActive: true,
      commissionRate: 0.3,
      baseSalary: 2000000,
      compensationType: "BOTH",
      password: barberPassword
    }
  })

  const barber2 = await prisma.barber.create({
    data: {
      name: "Budi",
      isActive: true,
      commissionRate: 0.25,
      baseSalary: 0,
      compensationType: "COMMISSION_ONLY",
      password: barberPassword
    }
  })

  const barber3 = await prisma.barber.create({
    data: {
      name: "Citra",
      isActive: true,
      commissionRate: 0,
      baseSalary: 3500000,
      compensationType: "BASE_ONLY",
      password: barberPassword
    }
  })

  const barber4 = await prisma.barber.create({
    data: {
      name: "Dodi",
      isActive: false,
      commissionRate: 0.2,
      baseSalary: 1500000,
      compensationType: "BOTH",
      password: barberPassword
    }
  })

  console.log("✅ Barbers created!")

  console.log("\n✂️ Creating services...")

  const services = await Promise.all([
    prisma.service.create({
      data: { name: "Potong Rambut", price: 35000, isActive: true }
    }),
    prisma.service.create({
      data: { name: "Cukur Jenggot", price: 20000, isActive: true }
    }),
    prisma.service.create({
      data: { name: "Cukur Kumis", price: 15000, isActive: true }
    }),
    prisma.service.create({
      data: { name: "Hair Spa", price: 50000, isActive: true }
    }),
    prisma.service.create({
      data: { name: "Creambath", price: 45000, isActive: true }
    }),
    prisma.service.create({
      data: { name: "Coloring", price: 150000, isActive: true }
    }),
    prisma.service.create({
      data: { name: "Paket Lengkap (Potong + Cukur + Hair Spa)", price: 85000, isActive: true }
    }),
    prisma.service.create({
      data: { name: "Potong Anak", price: 25000, isActive: true }
    })
  ])

  console.log("✅ Services created!")

  console.log("\n🧴 Creating products...")

  const products = await Promise.all([
    prisma.product.create({
      data: { name: "Pomade Strong Hold 100ml", buyPrice: 45000, sellPrice: 65000, stock: 20, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Hair Spray 200ml", buyPrice: 35000, sellPrice: 55000, stock: 15, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Shampoo Anti Dandruff 250ml", buyPrice: 25000, sellPrice: 40000, stock: 25, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Conditioner 250ml", buyPrice: 30000, sellPrice: 45000, stock: 20, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Hair Oil 50ml", buyPrice: 40000, sellPrice: 60000, stock: 18, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Beard Oil 30ml", buyPrice: 50000, sellPrice: 75000, stock: 12, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Clay Styling 75gr", buyPrice: 55000, sellPrice: 80000, stock: 10, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Hair Tonic 100ml", buyPrice: 20000, sellPrice: 35000, stock: 30, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Sisir Premium", buyPrice: 15000, sellPrice: 25000, stock: 50, isActive: true }
    }),
    prisma.product.create({
      data: { name: "Handuk Kecil", buyPrice: 25000, sellPrice: 40000, stock: 0, isActive: false }
    })
  ])

  console.log("✅ Products created!")

  console.log("\n" + "=".repeat(50))
  console.log("🎉 SEED COMPLETED SUCCESSFULLY!")
  console.log("=".repeat(50))

  console.log("\n📝 LOGIN CREDENTIALS:")
  console.log("─".repeat(30))
  console.log("👤 OWNER:")
  console.log("   Username: owner")
  console.log("   Email: owner@barberbro.com")
  console.log("   Password: admin123")
  console.log("")
  console.log("👤 CASHIER:")
  console.log("   Username: kasir")
  console.log("   Email: kasir@barberbro.com")
  console.log("   Password: kasir123")
  console.log("")
  console.log("👤 BARBER (untuk semua barber):")
  console.log("   Password: barber123")

  console.log("\n📊 DATA SUMMARY:")
  console.log("─".repeat(30))
  console.log(`   Users: 2 (1 owner, 1 cashier)`)
  console.log(`   Barbers: 4 (3 aktif, 1 non-aktif)`)
  console.log(`   Services: ${services.length}`)
  console.log(`   Products: ${products.length} (9 aktif, 1 non-aktif)`)
  console.log(`   Cash Accounts: 3 (Kas, Bank, QRIS)`)
  console.log("")
  console.log("💰 INITIAL BALANCES:")
  console.log(`   Kas Utama: Rp 5.000.000`)
  console.log(`   BCA: Rp 10.000.000`)
  console.log(`   QRIS: Rp 3.000.000`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
