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

  const hashedOwnerPassword = await bcrypt.hash("admin123", 10)
  const hashedCashierPassword = await bcrypt.hash("kasir123", 10)

  const owner = await prisma.user.create({
    data: {
      username: "owner",
      email: "owner@barberbro.com",
      password: hashedOwnerPassword,
      role: "OWNER"
    }
  })

  const cashier = await prisma.user.create({
    data: {
      username: "kasir",
      email: "kasir@barberbro.com",
      password: hashedCashierPassword,
      role: "CASHIER"
    }
  })

  console.log("✅ Users created!")

  console.log("\n💰 Creating cash accounts...")

  const cashTunai = await prisma.cashAccount.create({
    data: {
      name: "Kas Tunai",
      type: "TUNAI",
      balance: 15000000,
      accountNumber: "KAS-001",
      isActive: true,
      isDefault: true
    }
  })

  const cashBank = await prisma.cashAccount.create({
    data: {
      name: "Bank BCA",
      type: "BANK",
      balance: 25000000,
      accountNumber: "1234567890",
      isActive: true
    }
  })

  const cashQris = await prisma.cashAccount.create({
    data: {
      name: "QRIS",
      type: "QRIS",
      balance: 8000000,
      accountNumber: "QRIS-001",
      isActive: true
    }
  })

  console.log("✅ Cash accounts created!")

  console.log("\n✂️  Creating barbers...")

  const barberPassword = await bcrypt.hash("barber123", 10)

  const barber1 = await prisma.barber.create({
    data: {
      name: "Ahmad Supriadi",
      isActive: true,
      commissionRate: 30,
      baseSalary: null,
      compensationType: "COMMISSION_ONLY",
      password: barberPassword
    }
  })

  const barber2 = await prisma.barber.create({
    data: {
      name: "Budi Santoso",
      isActive: true,
      commissionRate: 25,
      baseSalary: 3000000,
      compensationType: "BOTH",
      password: barberPassword
    }
  })

  const barber3 = await prisma.barber.create({
    data: {
      name: "Cahyo Pratama",
      isActive: true,
      commissionRate: 35,
      baseSalary: null,
      compensationType: "COMMISSION_ONLY",
      password: barberPassword
    }
  })

  const barber4 = await prisma.barber.create({
    data: {
      name: "Dedi Kurniawan",
      isActive: true,
      commissionRate: 20,
      baseSalary: 2500000,
      compensationType: "BOTH",
      password: barberPassword
    }
  })

  const barber5 = await prisma.barber.create({
    data: {
      name: "Eko Prasetyo",
      isActive: false,
      commissionRate: 28,
      baseSalary: null,
      compensationType: "COMMISSION_ONLY",
      password: barberPassword
    }
  })

  console.log("✅ Barbers created!")

  console.log("\n💇 Creating services...")

  const service1 = await prisma.service.create({
    data: {
      name: "Haircut Basic",
      price: 50000,
      isActive: true
    }
  })

  const service2 = await prisma.service.create({
    data: {
      name: "Haircut Premium",
      price: 75000,
      isActive: true
    }
  })

  const service3 = await prisma.service.create({
    data: {
      name: "Haircut + Wash",
      price: 80000,
      isActive: true
    }
  })

  const service4 = await prisma.service.create({
    data: {
      name: "Haircut + Wash + Styling",
      price: 120000,
      isActive: true
    }
  })

  const service5 = await prisma.service.create({
    data: {
      name: "Beard Trim",
      price: 30000,
      isActive: true
    }
  })

  const service6 = await prisma.service.create({
    data: {
      name: "Full Shave",
      price: 45000,
      isActive: true
    }
  })

  const service7 = await prisma.service.create({
    data: {
      name: "Hair Coloring",
      price: 150000,
      isActive: true
    }
  })

  const service8 = await prisma.service.create({
    data: {
      name: "Hair Treatment",
      price: 100000,
      isActive: true
    }
  })

  const service9 = await prisma.service.create({
    data: {
      name: "Kids Haircut",
      price: 40000,
      isActive: true
    }
  })

  const service10 = await prisma.service.create({
    data: {
      name: "Senior Haircut",
      price: 35000,
      isActive: true
    }
  })

  console.log("✅ Services created!")

  console.log("\n🧴 Creating products...")

  const product1 = await prisma.product.create({
    data: {
      name: "Pomade Water Based",
      buyPrice: 45000,
      sellPrice: 75000,
      stock: 25,
      isActive: true
    }
  })

  const product2 = await prisma.product.create({
    data: {
      name: "Pomade Oil Based",
      buyPrice: 50000,
      sellPrice: 85000,
      stock: 20,
      isActive: true
    }
  })

  const product3 = await prisma.product.create({
    data: {
      name: "Hair Gel",
      buyPrice: 35000,
      sellPrice: 60000,
      stock: 30,
      isActive: true
    }
  })

  const product4 = await prisma.product.create({
    data: {
      name: "Hair Wax",
      buyPrice: 40000,
      sellPrice: 70000,
      stock: 18,
      isActive: true
    }
  })

  const product5 = await prisma.product.create({
    data: {
      name: "Hair Spray",
      buyPrice: 30000,
      sellPrice: 55000,
      stock: 22,
      isActive: true
    }
  })

  const product6 = await prisma.product.create({
    data: {
      name: "Shampoo",
      buyPrice: 25000,
      sellPrice: 45000,
      stock: 40,
      isActive: true
    }
  })

  const product7 = await prisma.product.create({
    data: {
      name: "Conditioner",
      buyPrice: 28000,
      sellPrice: 50000,
      stock: 35,
      isActive: true
    }
  })

  const product8 = await prisma.product.create({
    data: {
      name: "Hair Tonic",
      buyPrice: 20000,
      sellPrice: 35000,
      stock: 50,
      isActive: true
    }
  })

  const product9 = await prisma.product.create({
    data: {
      name: "Hair Oil",
      buyPrice: 22000,
      sellPrice: 40000,
      stock: 28,
      isActive: true
    }
  })

  const product10 = await prisma.product.create({
    data: {
      name: "Comb Set",
      buyPrice: 15000,
      sellPrice: 30000,
      stock: 60,
      isActive: true
    }
  })

  const product11 = await prisma.product.create({
    data: {
      name: "Razor Blade Pack",
      buyPrice: 10000,
      sellPrice: 20000,
      stock: 100,
      isActive: true
    }
  })

  const product12 = await prisma.product.create({
    data: {
      name: "Towel",
      buyPrice: 35000,
      sellPrice: 60000,
      stock: 45,
      isActive: true
    }
  })

  const product13 = await prisma.product.create({
    data: {
      name: "Apron",
      buyPrice: 45000,
      sellPrice: 75000,
      stock: 15,
      isActive: true
    }
  })

  const product14 = await prisma.product.create({
    data: {
      name: "Hair Dryer Mini",
      buyPrice: 150000,
      sellPrice: 250000,
      stock: 8,
      isActive: true
    }
  })

  const product15 = await prisma.product.create({
    data: {
      name: "Styling Cape",
      buyPrice: 55000,
      sellPrice: 90000,
      stock: 20,
      isActive: true
    }
  })

  console.log("✅ Products created!")

  console.log("\n📅 Creating salary periods...")

  const today = new Date()
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber1.id,
      name: "Periode Desember 2025",
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
      isActive: false
    }
  })

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber1.id,
      name: "Periode Januari 2026",
      startDate: currentMonthStart,
      endDate: today,
      isActive: true
    }
  })

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber2.id,
      name: "Periode Desember 2025",
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
      isActive: false
    }
  })

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber2.id,
      name: "Periode Januari 2026",
      startDate: currentMonthStart,
      endDate: today,
      isActive: true
    }
  })

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber3.id,
      name: "Periode Desember 2025",
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
      isActive: false
    }
  })

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber3.id,
      name: "Periode Januari 2026",
      startDate: currentMonthStart,
      endDate: today,
      isActive: true
    }
  })

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber4.id,
      name: "Periode Desember 2025",
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
      isActive: false
    }
  })

  await prisma.salaryPeriod.create({
    data: {
      barberId: barber4.id,
      name: "Periode Januari 2026",
      startDate: currentMonthStart,
      endDate: today,
      isActive: true
    }
  })

  console.log("✅ Salary periods created!")

  console.log("\n💸 Creating salary payments...")

  await prisma.salaryPayment.create({
    data: {
      barberId: barber1.id,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
      baseSalaryAmount: 0,
      commissionAmount: 4500000,
      bonusAmount: 500000,
      deductionAmount: 0,
      totalAmount: 5000000,
      cashAmount: 2000000,
      bankAmount: 2000000,
      qrisAmount: 1000000,
      cashAccountId: cashTunai.id,
      bankAccountId: cashBank.id,
      qrisAccountId: cashQris.id,
      paymentDate: new Date(today.getFullYear(), today.getMonth(), 5),
      notes: "Gaji Desember 2025 + bonus performa"
    }
  })

  await prisma.salaryPayment.create({
    data: {
      barberId: barber2.id,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
      baseSalaryAmount: 3000000,
      commissionAmount: 2000000,
      bonusAmount: 0,
      deductionAmount: 300000,
      totalAmount: 4700000,
      cashAmount: 2000000,
      bankAmount: 1700000,
      qrisAmount: 1000000,
      cashAccountId: cashTunai.id,
      bankAccountId: cashBank.id,
      qrisAccountId: cashQris.id,
      paymentDate: new Date(today.getFullYear(), today.getMonth(), 5),
      notes: "Gaji Desember 2025 - potongan terlambat 3x"
    }
  })

  await prisma.salaryPayment.create({
    data: {
      barberId: barber3.id,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
      baseSalaryAmount: 0,
      commissionAmount: 3800000,
      bonusAmount: 200000,
      deductionAmount: 0,
      totalAmount: 4000000,
      cashAmount: 2000000,
      bankAmount: 1000000,
      qrisAmount: 1000000,
      cashAccountId: cashTunai.id,
      bankAccountId: cashBank.id,
      qrisAccountId: cashQris.id,
      paymentDate: new Date(today.getFullYear(), today.getMonth(), 5),
      notes: "Gaji Desember 2025 + bonus tahun baru"
    }
  })

  await prisma.salaryPayment.create({
    data: {
      barberId: barber4.id,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
      baseSalaryAmount: 2500000,
      commissionAmount: 1500000,
      bonusAmount: 0,
      deductionAmount: 0,
      totalAmount: 4000000,
      cashAmount: 1500000,
      bankAmount: 1500000,
      qrisAmount: 1000000,
      cashAccountId: cashTunai.id,
      bankAccountId: cashBank.id,
      qrisAccountId: cashQris.id,
      paymentDate: new Date(today.getFullYear(), today.getMonth(), 5),
      notes: "Gaji Desember 2025"
    }
  })

  console.log("✅ Salary payments created!")

  console.log("\n💳 Creating salary debts...")

  await prisma.salaryDebt.create({
    data: {
      barberId: barber2.id,
      amount: 1000000,
      reason: "Pinjaman untuk keperluan keluarga",
      isPaid: true,
      paidDate: new Date(today.getFullYear(), today.getMonth(), 10),
      createdAt: new Date(today.getFullYear(), today.getMonth() - 1, 15),
      paidAt: new Date(today.getFullYear(), today.getMonth(), 10)
    }
  })

  await prisma.salaryDebt.create({
    data: {
      barberId: barber3.id,
      amount: 1500000,
      reason: "Pinjaman untuk biaya rumah",
      isPaid: false,
      createdAt: new Date(today.getFullYear(), today.getMonth(), 5)
    }
  })

  await prisma.salaryDebt.create({
    data: {
      barberId: barber4.id,
      amount: 500000,
      reason: "Pinjaman kecil untuk tambahan modal",
      isPaid: false,
      createdAt: new Date(today.getFullYear(), today.getMonth(), 2)
    }
  })

  console.log("✅ Salary debts created!")

  console.log("\n📊 Creating salary adjustments...")

  await prisma.salaryAdjustment.create({
    data: {
      barberId: barber1.id,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
      type: "BONUS",
      amount: 500000,
      reason: "Bonus performa terbaik bulan ini"
    }
  })

  await prisma.salaryAdjustment.create({
    data: {
      barberId: barber2.id,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
      type: "DEDUCTION",
      amount: 300000,
      reason: "Potongan terlambat hadir 3x"
    }
  })

  await prisma.salaryAdjustment.create({
    data: {
      barberId: barber3.id,
      periodStart: lastMonthStart,
      periodEnd: lastMonthEnd,
      type: "BONUS",
      amount: 200000,
      reason: "Bonus tahun baru"
    }
  })

  await prisma.salaryAdjustment.create({
    data: {
      barberId: barber1.id,
      periodStart: currentMonthStart,
      periodEnd: today,
      type: "BONUS",
      amount: 300000,
      reason: "Bonus minggu pertama"
    }
  })

  console.log("✅ Salary adjustments created!")

  console.log("\n📝 Creating attendances...")

  const createAttendance = async (barberId: string, type: string, date: Date) => {
    await prisma.attendance.create({
      data: {
        barberId,
        type: type as any,
        timestamp: date
      }
    })
  }

  const weekDates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    weekDates.push(date)
  }

  for (const date of weekDates) {
    const dayOfWeek = date.getDay()

    if (dayOfWeek !== 0) {
      await createAttendance(barber1.id, "CHECK_IN", new Date(date.setHours(9, 0, 0)))
      await createAttendance(barber1.id, "CHECK_OUT", new Date(date.setHours(17, 0, 0)))
    }

    if (dayOfWeek !== 0 && dayOfWeek !== 3) {
      await createAttendance(barber2.id, "CHECK_IN", new Date(date.setHours(9, 30, 0)))
      await createAttendance(barber2.id, "CHECK_OUT", new Date(date.setHours(17, 30, 0)))
    }

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      await createAttendance(barber3.id, "CHECK_IN", new Date(date.setHours(8, 30, 0)))
      await createAttendance(barber3.id, "CHECK_OUT", new Date(date.setHours(16, 30, 0)))
    }

    if (dayOfWeek !== 0) {
      await createAttendance(barber4.id, "CHECK_IN", new Date(date.setHours(10, 0, 0)))
      await createAttendance(barber4.id, "CHECK_OUT", new Date(date.setHours(18, 0, 0)))
    }
  }

  await createAttendance(barber2.id, "SICK", new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000))
  await createAttendance(barber4.id, "PERMISSION", new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000))

  console.log("✅ Attendances created!")

  console.log("\n🧾 Creating transactions...")

  const createTransaction = async (
    transactionNumber: number,
    date: Date,
    barberId: string,
    paymentMethod: string,
    items: Array<{ type: string; id: string; quantity: number; price: number }>
  ) => {
    let totalAmount = 0
    let totalCommission = 0
    const barber = await prisma.barber.findUnique({ where: { id: barberId } })
    const commissionRate = barber?.commissionRate || 0

    const transactionItems = items.map((item) => {
      const subtotal = item.quantity * item.price
      totalAmount += subtotal
      if (item.type === "SERVICE") {
        totalCommission += subtotal * (Number(commissionRate) / 100)
      }
      return item
    })

    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,
        date,
        totalAmount,
        totalCommission,
        paymentMethod: paymentMethod as any,
        cashierId: cashier.id,
        barberId,
        items: {
          create: transactionItems.map((item) => ({
            type: item.type as any,
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal: item.quantity * item.price,
            serviceId: item.type === "SERVICE" ? item.id : null,
            productId: item.type === "PRODUCT" ? item.id : null
          }))
        }
      }
    })

    return transaction
  }

  let transactionCounter = 1000

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const fourDaysAgo = new Date(today)
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

  const fiveDaysAgo = new Date(today)
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

  const sixDaysAgo = new Date(today)
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)

  await createTransaction(
    transactionCounter++,
    today,
    barber1.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service1.id, quantity: 1, price: 50000 },
      { type: "PRODUCT", id: product1.id, quantity: 1, price: 75000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    today,
    barber2.id,
    "QRIS",
    [
      { type: "SERVICE", id: service3.id, quantity: 1, price: 80000 },
      { type: "PRODUCT", id: product6.id, quantity: 1, price: 45000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    today,
    barber3.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service4.id, quantity: 1, price: 120000 },
      { type: "PRODUCT", id: product2.id, quantity: 1, price: 85000 },
      { type: "PRODUCT", id: product3.id, quantity: 1, price: 60000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    today,
    barber1.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service1.id, quantity: 1, price: 50000 },
      { type: "SERVICE", id: service5.id, quantity: 1, price: 30000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    today,
    barber4.id,
    "QRIS",
    [
      { type: "SERVICE", id: service2.id, quantity: 1, price: 75000 },
      { type: "PRODUCT", id: product4.id, quantity: 1, price: 70000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    yesterday,
    barber1.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service3.id, quantity: 1, price: 80000 },
      { type: "SERVICE", id: service5.id, quantity: 1, price: 30000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    yesterday,
    barber2.id,
    "QRIS",
    [
      { type: "SERVICE", id: service4.id, quantity: 1, price: 120000 },
      { type: "PRODUCT", id: product5.id, quantity: 1, price: 55000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    yesterday,
    barber3.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service7.id, quantity: 1, price: 150000 },
      { type: "PRODUCT", id: product1.id, quantity: 2, price: 75000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    yesterday,
    barber4.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service1.id, quantity: 2, price: 50000 },
      { type: "PRODUCT", id: product6.id, quantity: 1, price: 45000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    twoDaysAgo,
    barber1.id,
    "QRIS",
    [
      { type: "SERVICE", id: service2.id, quantity: 1, price: 75000 },
      { type: "SERVICE", id: service6.id, quantity: 1, price: 45000 },
      { type: "PRODUCT", id: product7.id, quantity: 1, price: 50000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    twoDaysAgo,
    barber3.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service8.id, quantity: 1, price: 100000 },
      { type: "PRODUCT", id: product8.id, quantity: 2, price: 35000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    twoDaysAgo,
    barber4.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service9.id, quantity: 1, price: 40000 },
      { type: "SERVICE", id: service5.id, quantity: 1, price: 30000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    threeDaysAgo,
    barber1.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service4.id, quantity: 1, price: 120000 },
      { type: "PRODUCT", id: product9.id, quantity: 1, price: 40000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    threeDaysAgo,
    barber2.id,
    "QRIS",
    [
      { type: "SERVICE", id: service3.id, quantity: 1, price: 80000 },
      { type: "SERVICE", id: service6.id, quantity: 1, price: 45000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    threeDaysAgo,
    barber3.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service1.id, quantity: 3, price: 50000 },
      { type: "PRODUCT", id: product10.id, quantity: 1, price: 30000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    fourDaysAgo,
    barber1.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service7.id, quantity: 1, price: 150000 },
      { type: "PRODUCT", id: product1.id, quantity: 1, price: 75000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    fourDaysAgo,
    barber4.id,
    "QRIS",
    [
      { type: "SERVICE", id: service2.id, quantity: 1, price: 75000 },
      { type: "SERVICE", id: service5.id, quantity: 1, price: 30000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    fiveDaysAgo,
    barber2.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service8.id, quantity: 1, price: 100000 },
      { type: "PRODUCT", id: product11.id, quantity: 2, price: 20000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    fiveDaysAgo,
    barber3.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service3.id, quantity: 1, price: 80000 },
      { type: "SERVICE", id: service6.id, quantity: 1, price: 45000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    sixDaysAgo,
    barber1.id,
    "QRIS",
    [
      { type: "SERVICE", id: service4.id, quantity: 1, price: 120000 },
      { type: "PRODUCT", id: product12.id, quantity: 1, price: 60000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    sixDaysAgo,
    barber2.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service1.id, quantity: 2, price: 50000 },
      { type: "PRODUCT", id: product13.id, quantity: 1, price: 75000 }
    ]
  )

  await createTransaction(
    transactionCounter++,
    sixDaysAgo,
    barber4.id,
    "TUNAI",
    [
      { type: "SERVICE", id: service10.id, quantity: 2, price: 35000 },
      { type: "PRODUCT", id: product14.id, quantity: 1, price: 250000 }
    ]
  )

  console.log("✅ Transactions created!")

  console.log("\n💵 Creating expenses...")

  await prisma.expense.create({
    data: {
      title: "Sewa Tempat Bulanan",
      amount: 5000000,
      date: new Date(today.getFullYear(), today.getMonth(), 1),
      category: "RENT",
      accountId: cashBank.id
    }
  })

  await prisma.expense.create({
    data: {
      title: "Listrik & Air",
      amount: 750000,
      date: new Date(today.getFullYear(), today.getMonth(), 5),
      category: "UTILITIES",
      accountId: cashBank.id
    }
  })

  await prisma.expense.create({
    data: {
      title: "Internet Bulanan",
      amount: 300000,
      date: new Date(today.getFullYear(), today.getMonth(), 1),
      category: "UTILITIES",
      accountId: cashBank.id
    }
  })

  await prisma.expense.create({
    data: {
      title: "Beli Suplemen Pomade & Shampoo",
      amount: 850000,
      date: new Date(today.getFullYear(), today.getMonth(), 3),
      category: "SUPPLIES",
      accountId: cashTunai.id
    }
  })

  await prisma.expense.create({
    data: {
      title: "Beli Handuk Baru",
      amount: 300000,
      date: new Date(today.getFullYear(), today.getMonth(), 4),
      category: "SUPPLIES",
      accountId: cashTunai.id
    }
  })

  await prisma.expense.create({
    data: {
      title: "Beli Razor Blade",
      amount: 150000,
      date: new Date(today.getFullYear(), today.getMonth(), 6),
      category: "SUPPLIES",
      accountId: cashTunai.id
    }
  })

  await prisma.expense.create({
    data: {
      title: "Perbaikan AC",
      amount: 500000,
      date: new Date(today.getFullYear(), today.getMonth(), 2),
      category: "OTHER",
      accountId: cashTunai.id
    }
  })

  await prisma.expense.create({
    data: {
      title: "Snack & Minuman",
      amount: 200000,
      date: new Date(today.getFullYear(), today.getMonth(), 5),
      category: "OTHER",
      accountId: cashTunai.id
    }
  })

  console.log("✅ Expenses created!")

  console.log("\n💳 Creating cash transactions...")

  await prisma.cashTransaction.create({
    data: {
      accountId: cashTunai.id,
      type: "DEPOSIT",
      amount: 5000000,
      description: "Setoran awal minggu",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
    }
  })

  await prisma.cashTransaction.create({
    data: {
      accountId: cashBank.id,
      type: "WITHDRAW",
      amount: 1000000,
      description: "Tarik tunai untuk operasional",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3)
    }
  })

  await prisma.cashTransaction.create({
    data: {
      fromAccountId: cashTunai.id,
      toAccountId: cashBank.id,
      type: "TRANSFER",
      amount: 2000000,
      description: "Transfer kas tunai ke bank",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2)
    }
  })

  await prisma.cashTransaction.create({
    data: {
      accountId: cashTunai.id,
      type: "DEPOSIT",
      amount: 3000000,
      description: "Setoran mingguan",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
    }
  })

  await prisma.cashTransaction.create({
    data: {
      accountId: cashQris.id,
      type: "DEPOSIT",
      amount: 1500000,
      description: "Setoran QRIS",
      date: today
    }
  })

  console.log("✅ Cash transactions created!")

  console.log("\n📊 Seed Summary:")
  console.log("  👤 Users: 2 (1 owner, 1 cashier)")
  console.log("  ✂️  Barbers: 5 (4 active, 1 inactive)")
  console.log("  💇 Services: 10")
  console.log("  🧴 Products: 15")
  console.log("  💰 Cash Accounts: 3 (Tunai, Bank, QRIS)")
  console.log("  📅 Salary Periods: 8")
  console.log("  💸 Salary Payments: 4")
  console.log("  💳 Salary Debts: 3")
  console.log("  📊 Salary Adjustments: 4")
  console.log("  📝 Attendances: 60+")
  console.log("  🧾 Transactions: 25")
  console.log("  💵 Expenses: 8")
  console.log("  💳 Cash Transactions: 5")

  console.log("\n📝 Login credentials:")
  console.log("  👤 Owner:")
  console.log("    Username: owner")
  console.log("    Email: owner@barberbro.com")
  console.log("    Password: admin123")
  console.log("\n  🧑‍💼 Cashier:")
  console.log("    Username: kasir")
  console.log("    Email: kasir@barberbro.com")
  console.log("    Password: kasir123")
  console.log("\n  ✂️  Barbers:")
  console.log("    Password: barber123 (untuk semua barber)")

  console.log("\n✅ Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
