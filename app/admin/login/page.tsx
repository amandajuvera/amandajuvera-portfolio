import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import "../admin.css";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const configured = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );

  return (
    <div className="admin admin--centered">
      <div className="admin__login">
        <h1>Admin</h1>

        {configured ? (
          <>
            <p className="admin__hint">
              Only <code>{process.env.ADMIN_GITHUB_LOGIN}</code> can sign in.
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/admin" });
              }}
            >
              <button type="submit" className="btn">
                Sign in with GitHub
              </button>
            </form>
          </>
        ) : (
          <p className="admin__hint">
            GitHub OAuth isn&apos;t configured yet. Add <code>AUTH_GITHUB_ID</code>{" "}
            and <code>AUTH_GITHUB_SECRET</code> to <code>.env</code>, then reload
            this page. See the README for the setup steps.
          </p>
        )}
      </div>
    </div>
  );
}
