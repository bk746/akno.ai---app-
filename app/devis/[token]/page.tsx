import { createClient } from "@supabase/supabase-js";
import DevisPublicClient, { type DevisPublicData } from "./DevisPublicClient";

export const instant = false;

type PageProps = { params: Promise<{ token: string }> };

export default async function DevisPublicPage({ params }: PageProps) {
  const { token } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  let initial: DevisPublicData | null = null;
  if (url && anon && token) {
    const supabase = createClient(url, anon);
    const { data } = await supabase.rpc("devis_public", {
      p_token: token,
    });
    if (data && typeof data === "object") initial = data as DevisPublicData;
  }

  return (
    <DevisPublicClient
      token={token}
      initial={initial}
      supabaseUrl={url}
      supabaseAnonKey={anon}
    />
  );
}
