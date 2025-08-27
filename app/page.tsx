import { redirect } from "next/navigation"

export default function HomePage() {
  // TODO: Add logic to check if user is authenticated and redirect to dashboard
  redirect("/login")
}
