import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"
import Link from "next/link"

export default async function CashierLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-white">
      <header className="border-b border-yellow-500 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/pos">
            <h1 className="text-2xl font-bold text-black">BARBERBRO</h1>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 hidden sm:block">
              {session.user?.name}
            </span>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}
            >
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-yellow-500 text-black hover:bg-yellow-200"
              >
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main id="main-content" role="main" aria-label="Konten utama" className="p-4">
        {children}
      </main>
    </div>
  )
}
