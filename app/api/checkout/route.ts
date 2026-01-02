import { NextRequest } from "next/server"
import { checkoutTransaction } from "@/actions/pos"
import { handleApiError, handleValidationError } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, barberId, paymentMethod } = body

    if (!items || items.length === 0) {
      return handleValidationError("Item tidak boleh kosong")
    }

    if (!barberId) {
      return handleValidationError("Barber harus dipilih")
    }

    if (!paymentMethod || !["TUNAI", "QRIS"].includes(paymentMethod)) {
      return handleValidationError("Metode pembayaran tidak valid")
    }

    const result = await checkoutTransaction({ items, barberId, paymentMethod })

    if (result.success) {
      return Response.json(result)
    } else {
      return handleApiError(new Error(result.error || "Checkout failed"), "Checkout")
    }
  } catch (error) {
    return handleApiError(error, "Checkout API")
  }
}
