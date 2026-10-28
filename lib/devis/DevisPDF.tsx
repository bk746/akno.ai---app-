import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { DevisPdfPayload } from "./devisPdfTypes";
import { devisPdfTotals, fmtPdfDate, fmtPdfEur } from "./devisPdfTypes";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  headerLeft: { flex: 1, paddingRight: 16 },
  headerRight: { width: 200, textAlign: "right" },
  logo: { width: 72, height: 48, objectFit: "contain", marginBottom: 8 },
  coName: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
  mut: { color: "#4b5563", fontSize: 9 },
  title: { fontSize: 16, fontWeight: 700, letterSpacing: 0.5 },
  block: { marginBottom: 18 },
  blockTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  table: { marginTop: 4 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
  },
  rowHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    paddingBottom: 6,
    marginBottom: 2,
    fontWeight: 700,
    fontSize: 9,
  },
  colDes: { flex: 1, paddingRight: 8 },
  colQ: { width: 36, textAlign: "right" },
  colPu: { width: 72, textAlign: "right" },
  colTot: { width: 72, textAlign: "right" },
  totals: { marginTop: 12, marginLeft: "auto", width: 220 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  ttc: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 2,
    borderTopColor: "#111827",
    fontSize: 12,
    fontWeight: 700,
  },
  conditions: { marginTop: 16, fontSize: 9, color: "#374151" },
  accord: {
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
  },
  accordTitle: { fontWeight: 700, marginBottom: 10 },
  sigLine: {
    marginTop: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    width: 220,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#6b7280",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

export function DevisPDF({ data }: { data: DevisPdfPayload }) {
  const { ht, tva, ttc } = devisPdfTotals(data.lignes, data.tva_taux);
  const e = data.ent;
  const coLine = [e.entreprise_nom, e.entreprise_forme]
    .filter(Boolean)
    .join(" ");
  const footerParts = [
    e.entreprise_siret ? `SIRET ${e.entreprise_siret}` : "",
    e.entreprise_tva ? `TVA ${e.entreprise_tva}` : "",
    e.entreprise_rcs_rm ? e.entreprise_rcs_rm : "",
  ].filter(Boolean);
  const assParts = [
    e.assurance_nom ? `Assurance décennale : ${e.assurance_nom}` : "",
    e.assurance_numero ? `n° ${e.assurance_numero}` : "",
    e.assurance_zone ? `zone ${e.assurance_zone}` : "",
  ].filter(Boolean);

  return (
    <Document title={`Devis ${data.numero}`}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            {e.logo_url ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- PDF Image
              <Image src={e.logo_url} style={s.logo} />
            ) : null}
            {coLine ? <Text style={s.coName}>{coLine}</Text> : null}
            {e.entreprise_adresse ? (
              <Text style={s.mut}>{e.entreprise_adresse}</Text>
            ) : null}
            {e.entreprise_cp_ville ? (
              <Text style={s.mut}>{e.entreprise_cp_ville}</Text>
            ) : null}
            {e.entreprise_telephone ? (
              <Text style={s.mut}>{e.entreprise_telephone}</Text>
            ) : null}
            {e.entreprise_email ? (
              <Text style={s.mut}>{e.entreprise_email}</Text>
            ) : null}
          </View>
          <View style={s.headerRight}>
            <Text style={s.title}>DEVIS n° {data.numero}</Text>
            <Text style={s.mut}>Date : {fmtPdfDate(data.date_emission)}</Text>
            <Text style={s.mut}>
              Valable jusqu&apos;au {fmtPdfDate(data.date_validite)}
            </Text>
          </View>
        </View>

        <View style={s.block}>
          <Text style={s.blockTitle}>Client</Text>
          <Text>{data.client_nom}</Text>
          {data.client_adresse ? (
            <Text style={s.mut}>{data.client_adresse}</Text>
          ) : null}
          {data.client_email ? (
            <Text style={s.mut}>{data.client_email}</Text>
          ) : null}
          {data.client_telephone ? (
            <Text style={s.mut}>{data.client_telephone}</Text>
          ) : null}
        </View>

        <View style={s.block}>
          <Text style={s.blockTitle}>Objet</Text>
          <Text>{data.objet}</Text>
        </View>

        <View style={s.table}>
          <View style={s.rowHead}>
            <Text style={s.colDes}>Désignation</Text>
            <Text style={s.colQ}>Qté</Text>
            <Text style={s.colPu}>P.U. HT</Text>
            <Text style={s.colTot}>Total HT</Text>
          </View>
          {data.lignes.map((l, i) => {
            const q = Number(l.quantite) || 0;
            const pu = Number(l.prix_unitaire_ht) || 0;
            return (
              <View key={i} style={s.row}>
                <Text style={s.colDes}>{l.designation || "—"}</Text>
                <Text style={s.colQ}>{q}</Text>
                <Text style={s.colPu}>{fmtPdfEur(pu)}</Text>
                <Text style={s.colTot}>{fmtPdfEur(q * pu)}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text>Total HT</Text>
            <Text>{fmtPdfEur(ht)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text>TVA ({String(data.tva_taux).replace(".", ",")} %)</Text>
            <Text>{fmtPdfEur(tva)}</Text>
          </View>
          <View style={s.ttc}>
            <Text>Total TTC</Text>
            <Text>{fmtPdfEur(ttc)}</Text>
          </View>
        </View>

        <View style={s.conditions}>
          {e.devis_conditions ? (
            <Text>Conditions de paiement : {e.devis_conditions}</Text>
          ) : null}
          <Text style={{ marginTop: 6 }}>Devis gratuit</Text>
          {e.devis_mentions ? (
            <Text style={{ marginTop: 6 }}>{e.devis_mentions}</Text>
          ) : null}
        </View>

        <View style={s.accord}>
          <Text style={s.accordTitle}>Bon pour accord</Text>
          <Text style={s.mut}>Date : _______________________</Text>
          <Text style={s.mut}>Signature :</Text>
          <View style={s.sigLine} />
        </View>

        <View style={s.footer} fixed>
          <Text>{footerParts.join(" · ")}</Text>
          {assParts.length ? <Text>{assParts.join(" · ")}</Text> : null}
        </View>
      </Page>
    </Document>
  );
}
