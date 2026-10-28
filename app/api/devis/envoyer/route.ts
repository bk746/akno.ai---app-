import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { devis_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const devisId = body.devis_id;
  if (!devisId) {
    return NextResponse.json({ error: "devis_id requis" }, { status: 400 });
  }

  const { data: devis, error: fetchErr } = await supabase
    .from("devis")
    .select(
      "id, numero, statut, client_nom, client_email, token, lignes, tva_taux, artisan_id",
    )
    .eq("id", devisId)
    .maybeSingle();

  if (fetchErr || !devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  if (devis.artisan_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const lignes = (devis.lignes ?? []) as {
    quantite?: number;
    prix_unitaire_ht?: number;
  }[];
  const ht = lignes.reduce(
    (s, l) => s + (Number(l.quantite) || 0) * (Number(l.prix_unitaire_ht) || 0),
    0,
  );
  const tva = ht * (Number(devis.tva_taux) / 100);
  const total_ttc = Math.round((ht + tva) * 100) / 100;

  const { error: updErr } = await supabase
    .from("devis")
    .update({
      statut: "envoye",
      envoye_le: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", devisId);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  const webhook = process.env.N8N_DEVIS_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      {
        error:
          "Envoi e-mail non configuré (N8N_DEVIS_WEBHOOK_URL manquant sur le serveur).",
      },
      { status: 503 },
    );
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const lien = `${site.replace(/\/$/, "")}/devis/${devis.token}`;

  const n8nRes = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-push-secret": process.env.PUSH_API_SECRET ?? "",
    },
    body: JSON.stringify({
      type: "envoi",
      devis_id: devis.id,
      numero: devis.numero,
      client_nom: devis.client_nom,
      client_email: devis.client_email,
      total_ttc,
      lien,
    }),
  });

  if (!n8nRes.ok) {
    return NextResponse.json(
      { error: "Le webhook n8n a refusé l'envoi" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, lien, total_ttc });
}
