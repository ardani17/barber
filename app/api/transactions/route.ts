import { NextRequest } from "next/server"
import { getTransactions } from "@/actions/transactions"
import { handleApiError, handleValidationError } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, barberId, cashierId, paymentMethod, search } = body

    if (!startDate || !endDate) {
      return handleValidationError("Start date and end date are required")
    }

    const transactions = await getTransactions({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      barberId,
      cashierId,
      paymentMethod,
      search
    })

    return Response.json(transactions)
  } catch (error) {
    return handleApiError(error, "Fetch transactions")
  }
}
