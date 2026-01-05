import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import PublicPage from "./(public)/page"

export default async function Home() {
  const session = await auth()

  if (session) {
    if (session.user.role === "OWNER") {
      redirect("/dashboard")
    }
    redirect("/pos")
  }

  return <PublicPage />
}
