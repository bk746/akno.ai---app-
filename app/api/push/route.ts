import webpush from "web-push";
import { NextResponse } from "next/server";

type PushSub = { endpoint: string; p256dh: string; auth: string };

export async function POST(req: Request) {
  const secret = req.headers.get("x-push-secret");
  if (!secret || secret !== process.env.PUSH_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    return NextResponse.json(
      { error: "VAPID not configured" },
      { status: 500 },
    );
  }

  let body: {
    subscriptions?: PushSub[];
    title?: string;
    body?: string;
    url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subscriptions = body.subscriptions ?? [];
  const title = body.title ?? "Akno";
  const msgBody = body.body ?? "";
  const url = body.url ?? "/";
  const payload = JSON.stringify({ title, body: msgBody, url });

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const expired: string[] = [];
  await Promise.all(
    subscriptions.map(async (sub) => {
      if (!sub?.endpoint || !sub?.p256dh || !sub?.auth) return;
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (code === 404 || code === 410) expired.push(sub.endpoint);
      }
    }),
  );

  return NextResponse.json({ expired });
}
