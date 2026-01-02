import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"
import { ToasterProvider } from "@/components/toaster-provider"

export default async function OwnerLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== "OWNER") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <DashboardSidebar />
      <main className="flex-1">
        <header className="border-b border-yellow-500 bg-card sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-end gap-4">
            <span className="text-foreground">
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
                className="border-yellow-500 text-black hover:bg-yellow-100"
              >
                Keluar
              </Button>
            </form>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
      <ToasterProvider />
    </div>
  )
}
