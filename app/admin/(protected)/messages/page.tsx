import { db } from "@/lib/db";
import { deleteMessage, markMessageRead } from "../../actions";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await db.message.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <div className="admin__head">
        <h1>Messages</h1>
      </div>

      {messages.length === 0 ? (
        <p className="admin__empty">No messages yet.</p>
      ) : (
        <ul className="admin__messages">
          {messages.map((m) => (
            <li key={m.id} className={m.read ? "msg msg--read" : "msg"}>
              <div className="msg__head">
                <div>
                  <strong>{m.name}</strong>{" "}
                  <a href={`mailto:${m.email}`}>&lt;{m.email}&gt;</a>
                </div>
                <time dateTime={m.createdAt.toISOString()} className="utility">
                  {m.createdAt.toLocaleString()}
                </time>
              </div>

              {m.subject ? <p className="msg__subject">{m.subject}</p> : null}
              <p className="msg__body">{m.body}</p>

              <div className="msg__actions">
                {!m.read ? (
                  <form action={markMessageRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit">Mark read</button>
                  </form>
                ) : null}
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="admin__danger">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
