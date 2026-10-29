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
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  docTitle: { fontSize: 22, fontWeight: 700, letterSpacing: 0.4, color: "#111827" },
  docNum: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  datesCol: { textAlign: "right", minWidth: 180 },
  dateLbl: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 },
  dateVal: { fontSize: 10, color: "#374151", marginTop: 2, marginBottom: 8 },
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 28,
  },
  partyCol: { flex: 1 },
  partyLbl: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#9ca3af",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  partyName: { fontSize: 12, fontWeight: 700, color: "#111827", marginBottom: 4 },
  partyLine: { fontSize: 9.5, color: "#4b5563", marginBottom: 2 },
  logo: { width: 64, height: 40, objectFit: "contain", marginBottom: 8 },
  descTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  objet: { fontSize: 10, color: "#374151", marginBottom: 12 },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  rowHead: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  rowHeadTxt: { fontSize: 9, fontWeight: 700, color: "#374151" },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colDes: { flex: 1, paddingRight: 12, fontSize: 10 },
  colAmt: { width: 88, textAlign: "right", fontSize: 10, fontWeight: 500 },
  totalsWrap: { marginTop: 16, flexDirection: "row", justifyContent: "flex-end" },
  totals: { width: 240 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    fontSize: 10,
    color: "#4b5563",
  },
  totalLbl: { color: "#6b7280" },
  ttcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#111827",
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
  },
  footRow: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 32,
  },
  termsCol: { flex: 1, paddingRight: 16 },
  termsTitle: { fontSize: 9, fontWeight: 700, marginBottom: 6, color: "#374151" },
  termsTxt: { fontSize: 8.5, color: "#6b7280", lineHeight: 1.45 },
  sigCol: { width: 220 },
  sigBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 14,
    minHeight: 120,
  },
  sigTitle: { fontSize: 10, fontWeight: 700, marginBottom: 12, color: "#111827" },
  sigLine: {
    marginTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    width: "100%",
  },
  sigHint: { fontSize: 8, color: "#9ca3af", marginTop: 6 },
  legalFoot: {
    position: "absolute",
    bottom: 36,
    left: 48,
    right: 48,
    fontSize: 7.5,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    textAlign: "center",
  },
});

function issuerLines(e: DevisPdfPayload["ent"]) {
  const name = [e.entreprise_nom, e.entreprise_forme].filter(Boolean).join(" ");
  const addr = [e.entreprise_adresse, e.entreprise_cp_ville].filter(Boolean);
  const contact = [e.entreprise_telephone, e.entreprise_email].filter(Boolean);
  return { name, addr, contact };
}

export function DevisPDF({ data }: { data: DevisPdfPayload }) {
  const lignes = (data.lignes || []).filter((l) =>
    String(l.designation || "").trim(),
  );
  const { ht, tva, ttc } = devisPdfTotals(lignes, data.tva_taux);
  const e = data.ent;
  const issuer = issuerLines(e);
  const footerParts = [
    e.entreprise_siret ? `SIRET ${e.entreprise_siret}` : "",
    e.entreprise_tva ? `TVA ${e.entreprise_tva}` : "",
    e.entreprise_rcs_rm || "",
  ].filter(Boolean);
  const assParts = [
    e.assurance_nom ? `Assurance décennale : ${e.assurance_nom}` : "",
    e.assurance_numero ? `n° ${e.assurance_numero}` : "",
    e.assurance_zone ? e.assurance_zone : "",
  ].filter(Boolean);
  const terms = [
    e.devis_conditions ? e.devis_conditions : "",
    e.devis_mentions || "",
    "Devis gratuit.",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Document title={`Devis ${data.numero}`}>
      <Page size="A4" style={s.page}>
        <View style={s.topRow}>
          <View>
            <Text style={s.docTitle}>DEVIS</Text>
            <Text style={s.docNum}>#{data.numero}</Text>
          </View>
          <View style={s.datesCol}>
            <Text style={s.dateLbl}>Date du devis</Text>
            <Text style={s.dateVal}>{fmtPdfDate(data.date_emission)}</Text>
            <Text style={s.dateLbl}>Validité du devis</Text>
            <Text style={s.dateVal}>{fmtPdfDate(data.date_validite)}</Text>
          </View>
        </View>

        <View style={s.parties}>
          <View style={s.partyCol}>
            <Text style={s.partyLbl}>Entreprise émettrice</Text>
            {e.logo_url ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- PDF Image
              <Image src={e.logo_url} style={s.logo} />
            ) : null}
            {issuer.name ? (
              <Text style={s.partyName}>{issuer.name}</Text>
            ) : null}
            {issuer.contact.map((line, i) => (
              <Text key={`c-${i}`} style={s.partyLine}>
                {line}
              </Text>
            ))}
            {issuer.addr.map((line, i) => (
              <Text key={`a-${i}`} style={s.partyLine}>
                {line}
              </Text>
            ))}
          </View>
          <View style={s.partyCol}>
            <Text style={s.partyLbl}>À l&apos;attention de</Text>
            <Text style={s.partyName}>{data.client_nom}</Text>
            {data.client_adresse ? (
              <Text style={s.partyLine}>{data.client_adresse}</Text>
            ) : null}
            {data.client_email ? (
              <Text style={s.partyLine}>{data.client_email}</Text>
            ) : null}
            {data.client_telephone ? (
              <Text style={s.partyLine}>{data.client_telephone}</Text>
            ) : null}
          </View>
        </View>

        <Text style={s.descTitle}>Description</Text>
        {data.objet ? <Text style={s.objet}>{data.objet}</Text> : null}

        <View style={s.table}>
          <View style={s.rowHead}>
            <Text style={[s.colDes, s.rowHeadTxt]}>Désignation</Text>
            <Text style={[s.colAmt, s.rowHeadTxt]}>Montant</Text>
          </View>
          {lignes.map((l, i) => {
            const q = Number(l.quantite) || 0;
            const pu = Number(l.prix_unitaire_ht) || 0;
            const line = q * pu;
            const label =
              q > 1
                ? `${l.designation} (${q} × ${fmtPdfEur(pu)})`
                : String(l.designation);
            return (
              <View key={i} style={s.row}>
                <Text style={s.colDes}>{label}</Text>
                <Text style={s.colAmt}>{fmtPdfEur(line)}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.totalsWrap}>
          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text style={s.totalLbl}>Sous-total HT</Text>
              <Text>{fmtPdfEur(ht)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLbl}>
                TVA ({String(data.tva_taux).replace(".", ",")} %)
              </Text>
              <Text>{fmtPdfEur(tva)}</Text>
            </View>
            <View style={s.ttcRow}>
              <Text>TOTAL TTC</Text>
              <Text>{fmtPdfEur(ttc)}</Text>
            </View>
          </View>
        </View>

        <View style={s.footRow}>
          <View style={s.termsCol}>
            <Text style={s.termsTitle}>Termes et conditions</Text>
            <Text style={s.termsTxt}>{terms}</Text>
          </View>
          <View style={s.sigCol}>
            <View style={s.sigBox}>
              <Text style={s.sigTitle}>Bon pour accord</Text>
              <Text style={s.sigHint}>Date et signature du client</Text>
              <View style={s.sigLine} />
            </View>
          </View>
        </View>

        {(footerParts.length > 0 || assParts.length > 0) && (
          <View style={s.legalFoot} fixed>
            <Text>{[...footerParts, ...assParts].join(" · ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
