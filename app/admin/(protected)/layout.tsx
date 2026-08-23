import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import "../admin.css";

/**
 * Guards every page in this route group. `/admin/login` deliberately lives
 * outside the group so it can render without a session.
 */
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="admin">
      <header className="admin__bar">
        <nav className="admin__brand">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/messages">Messages</Link>
          <Link href="/">View site</Link>
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <span className="admin__who">{session.user.githubLogin}</span>
          <button type="submit" className="admin__signout">
            Sign out
          </button>
        </form>
      </header>
      <main className="admin__body">{children}</main>
    </div>
  );
}
