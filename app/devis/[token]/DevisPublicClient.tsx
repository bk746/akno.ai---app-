"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./devis-public.css";

type Ligne = {
  designation?: string;
  quantite?: number;
  prix_unitaire_ht?: number;
};

export type DevisPublicData = {
  numero: string;
  objet: string;
  client_nom: string;
  client_email?: string | null;
  client_telephone?: string | null;
  client_adresse?: string | null;
  lignes: Ligne[];
  tva_taux: number;
  statut: string;
  relance_count?: number;
  envoye_le?: string | null;
  reponse?: string | null;
  repondu_le?: string | null;
  entreprise?: string;
  artisan_prenom?: string;
};

function fmtEur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DevisPublicClient({
  token,
  initial,
  supabaseUrl,
  supabaseAnonKey,
}: {
  token: string;
  initial: DevisPublicData | null;
  supabaseUrl: string;
  supabaseAnonKey: string;
}) {
  const [data, setData] = useState(initial);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const sb = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey],
  );

  const lignes = (data?.lignes ?? []) as Ligne[];
  const ht = lignes.reduce(
    (s, l) => s + (Number(l.quantite) || 0) * (Number(l.prix_unitaire_ht) || 0),
    0,
  );
  const tva = ht * (Number(data?.tva_taux || 0) / 100);
  const ttc = Math.round((ht + tva) * 100) / 100;

  const answered = !!data?.reponse;
  const canRespond =
    data && !answered && ["envoye", "relance"].includes(data.statut);

  async function repondre(reponse: "accepte" | "refuse") {
    setBusy(true);
    setMsg("");
    setErr(false);
    const { data: res, error } = await sb.rpc("devis_repondre", {
      p_token: token,
      p_reponse: reponse,
    });
    setBusy(false);
    if (error) {
      setErr(true);
      setMsg("Impossible d'enregistrer votre réponse. Réessayez plus tard.");
      return;
    }
    const statut = (res as { statut?: string })?.statut ?? reponse;
    setData((d) =>
      d
        ? {
            ...d,
            statut,
            reponse: reponse,
            repondu_le: new Date().toISOString(),
          }
        : d,
    );
    setMsg(
      reponse === "accepte"
        ? "Merci, votre acceptation a bien été enregistrée."
        : "Votre refus a bien été enregistré.",
    );
  }

  if (!data) {
    return (
      <div className="devis-pub">
        <div className="devis-pub-inner">
          <p>Devis introuvable ou non disponible.</p>
        </div>
      </div>
    );
  }

  const statutLabel =
    data.statut === "accepte"
      ? "Accepté"
      : data.statut === "refuse"
        ? "Refusé"
        : data.statut === "relance"
          ? `Relancé (${data.relance_count ?? 0}×)`
          : "En attente de votre réponse";

  return (
    <div className="devis-pub">
      <div className="devis-pub-inner">
        <div className="devis-pub-h">
          <div>
            <p className="devis-pub-meta" style={{ textAlign: "left" }}>
              {data.entreprise || "Akno"}
            </p>
            <h1>Devis {data.numero}</h1>
            <p style={{ marginTop: 8, color: "#374151" }}>{data.objet}</p>
          </div>
          <div className="devis-pub-meta">
            <div>Date : {fmtDate(data.envoye_le)}</div>
            <div style={{ marginTop: 6, fontWeight: 600 }}>{statutLabel}</div>
          </div>
        </div>

        <div className="devis-pub-block">
          <h2>Client</h2>
          <p>
            <strong>{data.client_nom}</strong>
            <br />
            {data.client_adresse}
            <br />
            {data.client_email}
            {data.client_telephone ? ` · ${data.client_telephone}` : ""}
          </p>
        </div>

        <div className="devis-pub-block">
          <h2>Détail</h2>
          <table className="devis-pub-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th className="num">Qté</th>
                <th className="num">P.U. HT</th>
                <th className="num">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => {
                const q = Number(l.quantite) || 0;
                const pu = Number(l.prix_unitaire_ht) || 0;
                return (
                  <tr key={i}>
                    <td>{l.designation || "—"}</td>
                    <td className="num">{q}</td>
                    <td className="num">{fmtEur(pu)}</td>
                    <td className="num">{fmtEur(q * pu)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="devis-pub-totals">
            <div>
              <span>Total HT</span>
              <span>{fmtEur(ht)}</span>
            </div>
            <div>
              <span>TVA ({data.tva_taux} %)</span>
              <span>{fmtEur(tva)}</span>
            </div>
            <div className="ttc">
              <span>Total TTC</span>
              <span>{fmtEur(ttc)}</span>
            </div>
          </div>
        </div>

        <p className="devis-pub-note">Devis valable 30 jours à compter de la date d&apos;envoi.</p>

        {msg ? (
          <p className={`devis-pub-msg${err ? " devis-pub-err" : ""}`}>{msg}</p>
        ) : null}

        <div className="devis-pub-actions no-print">
          <button
            type="button"
            className="print"
            onClick={() => window.print()}
          >
            Télécharger en PDF
          </button>
          {canRespond ? (
            <>
              <button
                type="button"
                className="ok"
                disabled={busy}
                onClick={() => repondre("accepte")}
              >
                Accepter le devis
              </button>
              <button
                type="button"
                className="no"
                disabled={busy}
                onClick={() => repondre("refuse")}
              >
                Refuser
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
