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

  const owner = await prisma.user.create({
    data: {
      username: "owner",
      email: "owner@barberbro.com",
      password: hashedPassword,
      role: "OWNER"
    }
  })

  console.log("✅ Owner user created!")

  console.log("👤 Creating cashier users...")

  const cashier1 = await prisma.user.create({
    data: {
      username: "kasir1",
      email: "kasir1@barberbro.com",
      password: await bcrypt.hash("kasir123", 10),
      role: "CASHIER"
    }
  })

  const cashier2 = await prisma.user.create({
    data: {
      username: "kasir2",
      email: "kasir2@barberbro.com",
      password: await bcrypt.hash("kasir123", 10),
      role: "CASHIER"
    }
  })

  console.log("✅ Cashier users created!")

  console.log("💰 Creating cash accounts...")

  const cashAccount = await prisma.cashAccount.create({
    data: {
      name: "Kas Utama",
      type: "TUNAI",
      balance: 5000000,
      isDefault: true
    }
  })

  const bankAccount = await prisma.cashAccount.create({
    data: {
      name: "BCA",
      type: "BANK",
      balance: 10000000,
      accountNumber: "1234567890"
    }
  })

  const qrisAccount = await prisma.cashAccount.create({
    data: {
      name: "QRIS",
      type: "QRIS",
      balance: 3000000
    }
  })

  console.log("✅ Cash accounts created!")

  console.log("💇 Creating barbers...")

  const barber1 = await prisma.barber.create({
    data: {
      name: "Andi Pratama",
      isActive: true,
      commissionRate: 20,
      baseSalary: 2000000,
      compensationType: "BOTH",
      password: await bcrypt.hash("barber123", 10)
    }
  })

  const barber2 = await prisma.barber.create({
    data: {
      name: "Budi Santoso",
      isActive: true,
      commissionRate: 25,
      baseSalary: 1800000,
      compensationType: "BOTH",
      password: await bcrypt.hash("barber123", 10)
    }
  })

  const barber3 = await prisma.barber.create({
    data: {
      name: "Cahyo Wibowo",
      isActive: true,
      commissionRate: 20,
      compensationType: "COMMISSION_ONLY",
      password: await bcrypt.hash("barber123", 10)
    }
  })

  const barber4 = await prisma.barber.create({
    data: {
      name: "Dedi Kurniawan",
      isActive: false,
      commissionRate: 18,
      baseSalary: 2500000,
      compensationType: "BOTH",
      password: await bcrypt.hash("barber123", 10)
    }
  })

  console.log("✅ Barbers created!")

  console.log("✂️  Creating services...")

  const services = await prisma.service.createMany({
    data: [
      { name: "Potong Rambut Reguler", price: 35000, isActive: true },
      { name: "Potong Rambut Premium", price: 50000, isActive: true },
      { name: "Cuci Rambut", price: 15000, isActive: true },
      { name: "Styling Rambut", price: 40000, isActive: true },
      { name: "Pewarnaan Rambut", price: 100000, isActive: true },
      { name: "Creambath", price: 60000, isActive: true },
      { name: "Hair Mask", price: 75000, isActive: true },
      { name: "Potong Anak", price: 30000, isActive: true },
      { name: "Potong Lansia", price: 25000, isActive: true },
      { name: "Shaving / Kumis", price: 20000, isActive: true }
    ]
  })

  console.log("✅ Services created!")

  console.log("🧴 Creating products...")

  const products = await prisma.product.createMany({
    data: [
      { name: "Pomade Classic", buyPrice: 25000, sellPrice: 45000, stock: 50, isActive: true },
      { name: "Pomade Water-Based", buyPrice: 30000, sellPrice: 55000, stock: 35, isActive: true },
      { name: "Gel Rambut", buyPrice: 20000, sellPrice: 40000, stock: 60, isActive: true },
      { name: "Wax Rambut", buyPrice: 35000, sellPrice: 65000, stock: 25, isActive: true },
      { name: "Hair Spray", buyPrice: 18000, sellPrice: 35000, stock: 45, isActive: true },
      { name: "Shampoo Premium", buyPrice: 28000, sellPrice: 50000, stock: 40, isActive: true },
      { name: "Conditioner", buyPrice: 25000, sellPrice: 45000, stock: 30, isActive: true },
      { name: "Sisir Kayu", buyPrice: 10000, sellPrice: 20000, stock: 80, isActive: true },
      { name: "Sisir Plastik", buyPrice: 5000, sellPrice: 10000, stock: 100, isActive: true },
      { name: "Aksesori Rambut", buyPrice: 15000, sellPrice: 30000, stock: 55, isActive: true },
      { name: "Handuk", buyPrice: 35000, sellPrice: 60000, stock: 20, isActive: true },
      { name: "Apron Barber", buyPrice: 50000, sellPrice: 80000, stock: 15, isActive: true }
    ]
  })

  console.log("✅ Products created!")

  console.log("📊 Creating sample transactions...")

  const allServices = await prisma.service.findMany()
  const allProducts = await prisma.product.findMany()
  const activeBarbers = await prisma.barber.findMany({ where: { isActive: true } })

  const sampleTransactions = [
    {
      transactionNumber: 1001,
      date: new Date("2025-12-25T10:30:00"),
      totalAmount: 50000,
      totalCommission: 10000,
      paymentMethod: "TUNAI",
      cashierId: cashier1.id,
      barberId: barber1.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 50000, subtotal: 50000, serviceId: allServices[1].id }
      ]
    },
    {
      transactionNumber: 1002,
      date: new Date("2025-12-25T11:15:00"),
      totalAmount: 80000,
      totalCommission: 16000,
      paymentMethod: "QRIS",
      cashierId: cashier1.id,
      barberId: barber2.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 35000, subtotal: 35000, serviceId: allServices[0].id },
        { type: "PRODUCT", quantity: 1, unitPrice: 45000, subtotal: 45000, productId: allProducts[0].id }
      ]
    },
    {
      transactionNumber: 1003,
      date: new Date("2025-12-25T13:00:00"),
      totalAmount: 125000,
      totalCommission: 25000,
      paymentMethod: "TUNAI",
      cashierId: cashier2.id,
      barberId: barber1.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 100000, subtotal: 100000, serviceId: allServices[4].id },
        { type: "PRODUCT", quantity: 1, unitPrice: 25000, subtotal: 25000, productId: allProducts[1].id }
      ]
    },
    {
      transactionNumber: 1004,
      date: new Date("2025-12-25T14:30:00"),
      totalAmount: 35000,
      totalCommission: 8750,
      paymentMethod: "TUNAI",
      cashierId: cashier2.id,
      barberId: barber3.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 35000, subtotal: 35000, serviceId: allServices[0].id }
      ]
    },
    {
      transactionNumber: 1005,
      date: new Date("2025-12-25T15:45:00"),
      totalAmount: 150000,
      totalCommission: 30000,
      paymentMethod: "QRIS",
      cashierId: cashier1.id,
      barberId: barber2.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 60000, subtotal: 60000, serviceId: allServices[5].id },
        { type: "PRODUCT", quantity: 2, unitPrice: 45000, subtotal: 90000, productId: allProducts[0].id }
      ]
    },
    {
      transactionNumber: 1006,
      date: new Date("2025-12-26T09:00:00"),
      totalAmount: 40000,
      totalCommission: 10000,
      paymentMethod: "TUNAI",
      cashierId: cashier1.id,
      barberId: barber3.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 40000, subtotal: 40000, serviceId: allServices[3].id }
      ]
    },
    {
      transactionNumber: 1007,
      date: new Date("2025-12-26T10:30:00"),
      totalAmount: 95000,
      totalCommission: 19000,
      paymentMethod: "TUNAI",
      cashierId: cashier2.id,
      barberId: barber1.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 50000, subtotal: 50000, serviceId: allServices[1].id },
        { type: "PRODUCT", quantity: 1, unitPrice: 45000, subtotal: 45000, productId: allProducts[0].id }
      ]
    },
    {
      transactionNumber: 1008,
      date: new Date("2025-12-26T13:15:00"),
      totalAmount: 135000,
      totalCommission: 33750,
      paymentMethod: "QRIS",
      cashierId: cashier1.id,
      barberId: barber2.id,
      items: [
        { type: "SERVICE", quantity: 1, unitPrice: 75000, subtotal: 75000, serviceId: allServices[6].id },
        { type: "PRODUCT", quantity: 2, unitPrice: 30000, subtotal: 60000, productId: allProducts[2].id }
      ]
    }
  ]

  for (const tx of sampleTransactions) {
    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber: tx.transactionNumber,
        date: tx.date,
        totalAmount: tx.totalAmount,
        totalCommission: tx.totalCommission,
        paymentMethod: tx.paymentMethod,
        cashierId: tx.cashierId,
        barberId: tx.barberId
      }
    })

    for (const item of tx.items) {
      await prisma.transactionItem.create({
        data: {
          type: item.type,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          transactionId: transaction.id,
          serviceId: item.serviceId,
          productId: item.productId
        }
      })
    }
  }

  console.log("✅ Sample transactions created!")

  console.log("💸 Creating sample expenses...")

  await prisma.expense.createMany({
    data: [
      {
        title: "Sewa Tempat Bulan Desember",
        amount: 5000000,
        date: new Date("2025-12-01"),
        category: "RENT",
        accountId: bankAccount.id
      },
      {
        title: "Listrik & Air",
        amount: 800000,
        date: new Date("2025-12-05"),
        category: "UTILITIES",
        accountId: bankAccount.id
      },
      {
        title: "Beli Alat Cukur Baru",
        amount: 1500000,
        date: new Date("2025-12-10"),
        category: "SUPPLIES",
        accountId: cashAccount.id
      },
      {
        title: "Restock Pomade",
        amount: 750000,
        date: new Date("2025-12-15"),
        category: "SUPPLIES",
        accountId: cashAccount.id
      },
      {
        title: "Internet Bulanan",
        amount: 350000,
        date: new Date("2025-12-20"),
        category: "UTILITIES",
        accountId: bankAccount.id
      },
      {
        title: "Lain-lain",
        amount: 200000,
        date: new Date("2025-12-22"),
        category: "OTHER",
        accountId: cashAccount.id
      }
    ]
  })

  console.log("✅ Sample expenses created!")

  console.log("📝 Creating sample attendance records...")

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  await prisma.attendance.createMany({
    data: [
      { barberId: barber1.id, type: "CHECK_IN", timestamp: new Date(yesterday.setHours(8, 0, 0)) },
      { barberId: barber1.id, type: "CHECK_OUT", timestamp: new Date(yesterday.setHours(17, 0, 0)) },
      { barberId: barber2.id, type: "CHECK_IN", timestamp: new Date(yesterday.setHours(8, 30, 0)) },
      { barberId: barber2.id, type: "CHECK_OUT", timestamp: new Date(yesterday.setHours(17, 30, 0)) },
      { barberId: barber3.id, type: "CHECK_IN", timestamp: new Date(yesterday.setHours(9, 0, 0)) },
      { barberId: barber3.id, type: "CHECK_OUT", timestamp: new Date(yesterday.setHours(16, 30, 0)) },
      { barberId: barber1.id, type: "CHECK_IN", timestamp: new Date(today.setHours(8, 0, 0)) },
      { barberId: barber2.id, type: "CHECK_IN", timestamp: new Date(today.setHours(8, 30, 0)) },
      { barberId: barber3.id, type: "CHECK_IN", timestamp: new Date(today.setHours(9, 0, 0)) },
      { barberId: barber2.id, type: "PERMISSION", timestamp: new Date(today.setHours(12, 0, 0)) }
    ]
  })

  console.log("✅ Sample attendance records created!")

  console.log("📅 Creating sample salary periods...")

  await prisma.salaryPeriod.createMany({
    data: [
      {
        barberId: barber1.id,
        name: "Periode Desember 2025",
        startDate: new Date("2025-12-01"),
        endDate: new Date("2025-12-31"),
        isActive: true
      },
      {
        barberId: barber2.id,
        name: "Periode Desember 2025",
        startDate: new Date("2025-12-01"),
        endDate: new Date("2025-12-31"),
        isActive: true
      },
      {
        barberId: barber3.id,
        name: "Periode Desember 2025",
        startDate: new Date("2025-12-01"),
        endDate: new Date("2025-12-31"),
        isActive: true
      }
    ]
  })

  console.log("✅ Sample salary periods created!")

  console.log("\n📊 Summary:")
  console.log("  👤 Users: 3 (1 owner, 2 cashiers)")
  console.log("  💇 Barbers: 4 (3 active, 1 inactive)")
  console.log("  💰 Cash Accounts: 3 (Tunai, Bank, QRIS)")
  console.log("  ✂️  Services: 10")
  console.log("  🧴 Products: 12")
  console.log("  📊 Transactions: 8")
  console.log("  💸 Expenses: 6")
  console.log("  📝 Attendance records: 10")
  console.log("  📅 Salary periods: 3")
  console.log("\n📝 Login credentials:")
  console.log("  👤 Owner:")
  console.log("    Username: owner")
  console.log("    Email: owner@barberbro.com")
  console.log("    Password: admin123")
  console.log("\n  💼 Cashier 1:")
  console.log("    Username: kasir1")
  console.log("    Email: kasir1@barberbro.com")
  console.log("    Password: kasir123")
  console.log("\n  💼 Cashier 2:")
  console.log("    Username: kasir2")
  console.log("    Email: kasir2@barberbro.com")
  console.log("    Password: kasir123")
  console.log("\n  💇 Barbers (password sama):")
  console.log("    Password: barber123")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
