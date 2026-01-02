import { create } from "zustand"
import Decimal from "decimal.js"

export interface CartItem {
  id: string
  type: "service" | "product"
  name: string
  price: number
  quantity: number
  barberId?: string
  barberName?: string
}

interface CartState {
  items: CartItem[]
  selectedBarber: { id: string; name: string; commissionRate: string } | null
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setBarber: (barber: { id: string; name: string; commissionRate: string } | null) => void
  clearCart: () => void
  removeItemsByTypeAndIds: (type: "service" | "product", ids: string[]) => void
  getTotal: () => Decimal
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedBarber: null,
  
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(
      (i) => i.id === item.id && i.barberId === item.barberId
    )
    
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.id === item.id && i.barberId === item.barberId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
    }
    
    return {
      items: [...state.items, { ...item, quantity: 1 }]
    }
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
  
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ).filter((item) => item.quantity > 0)
  })),
  
  setBarber: (barber) => set({ selectedBarber: barber }),

  clearCart: () => set({ items: [] }),

  removeItemsByTypeAndIds: (type, ids) => set((state) => ({
    items: state.items.filter((item) => !(item.type === type && ids.includes(item.id)))
  })),

  getTotal: () => {
    const state = get()
    return state.items.reduce((total, item) => {
      return total.add(new Decimal(item.price).mul(item.quantity))
    }, new Decimal(0))
  },
  
  getItemCount: () => {
    const state = get()
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }
}))
