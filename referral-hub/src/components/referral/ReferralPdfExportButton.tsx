'use client'

import {
  Document,
  Link,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Referral } from "@/types/referral";

interface ReferralPdfExportButtonProps {
  referral: Referral;
  patientName: string;
  senderHospitalName: string;
  targetHospitalName: string;
  targetDepartmentName: string;
  referringDoctorName: string;
}

function humanize(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString();
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString();
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
    lineHeight: 1.35,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 14,
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    color: "#475569",
    fontSize: 9,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  badge: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 8,
  },
  emergencyBadge: {
    borderColor: "#fecdd3",
    backgroundColor: "#fff1f2",
    color: "#be123c",
  },
  section: {
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0369a1",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "50%",
    paddingRight: 10,
    marginBottom: 8,
  },
  fullCell: {
    width: "100%",
    marginBottom: 8,
  },
  label: {
    color: "#64748b",
    fontSize: 8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
  },
  note: {
    color: "#475569",
  },
  emergencySection: {
    borderColor: "#fecdd3",
    backgroundColor: "#fff1f2",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  colWide: {
    width: "48%",
    paddingRight: 8,
  },
  col: {
    width: "26%",
    paddingRight: 8,
  },
  small: {
    fontSize: 8,
    color: "#64748b",
  },
  link: {
    color: "#0369a1",
    textDecoration: "none",
  },
});

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not recorded"}</Text>
    </View>
  );
}

function FullField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.fullCell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not recorded"}</Text>
    </View>
  );
}

function ReferralPdfDocument({
  referral,
  patientName,
  senderHospitalName,
  targetHospitalName,
  targetDepartmentName,
  referringDoctorName,
}: ReferralPdfExportButtonProps) {
  const form = referral.referral_form;
  const vital = referral.vitals?.[0];
  const diagnoses = referral.diagnoses ?? [];
  const attachments = referral.attachments ?? [];
  const isEmergency = form?.reason_for_referral_category === "EMERGENCY";

  return (
    <Document title={`Referral-${referral.id.slice(0, 8)}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Referral Details</Text>
          <Text style={styles.subtitle}>
            Referral #{referral.id.slice(0, 8)} · Submitted {formatDateTime(referral.created_at)}
          </Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Status: {humanize(referral.status)}</Text>
            <Text style={styles.badge}>Triage: {humanize(referral.triage_status)}</Text>
            <Text style={styles.badge}>ML: {humanize(referral.ml_status)}</Text>
            {isEmergency && <Text style={[styles.badge, styles.emergencyBadge]}>Emergency</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient And Routing</Text>
          <View style={styles.grid}>
            <Field label="Patient" value={patientName} />
            <Field label="Sex" value={humanize(referral.patient?.sex)} />
            <Field label="Date of Birth" value={formatDate(referral.patient?.date_of_birth)} />
            <Field label="Phone" value={referral.patient?.phone_number} />
            <Field label="Referring Hospital" value={senderHospitalName} />
            <Field label="Receiving Hospital" value={targetHospitalName} />
            <Field label="Department" value={targetDepartmentName} />
            <Field label="Referring Doctor" value={referringDoctorName} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Overview</Text>
          <FullField label="Clinical Summary" value={form?.clinical_summary} />
          <FullField label="Patient History" value={form?.patient_history} />
          <FullField label="Physical Examination Findings" value={form?.physical_examination_findings} />
          <FullField label="Reason for Referral" value={form?.reason_of_referral} />
          <View style={styles.grid}>
            <Field label="Category" value={humanize(form?.reason_for_referral_category)} />
            <Field label="Condition" value={humanize(form?.condition_at_referral)} />
            <Field label="Mode of Transport" value={humanize(form?.mode_of_transport)} />
            <Field label="Accompanying Person" value={form?.accompanying_person_name} />
            <Field label="Accompanying Phone" value={form?.accompanying_person_phone} />
          </View>
        </View>

        {referral.emergency_detail?.emergency_justification && (
          <View style={[styles.section, styles.emergencySection]}>
            <Text style={styles.sectionTitle}>Emergency Justification</Text>
            <Text>{referral.emergency_detail.emergency_justification}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vitals</Text>
          {!vital ? (
            <Text style={styles.note}>No vitals recorded.</Text>
          ) : (
            <View style={styles.grid}>
              <Field label="Blood Pressure" value={`${vital.systolic_bp}/${vital.diastolic_bp} mmHg`} />
              <Field label="Heart Rate" value={`${vital.heart_rate} bpm`} />
              <Field label="SpO2" value={`${vital.sp_o2}%`} />
              <Field label="Temperature" value={`${vital.temperature} C`} />
              <Field label="Respiratory Rate" value={`${vital.respiratory_rate}/min`} />
              <Field label="GCS" value={`${vital.gcs_score ?? "N/A"}/15`} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnoses</Text>
          {diagnoses.length === 0 ? (
            <Text style={styles.note}>No diagnoses recorded.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={styles.colWide}>Diagnosis</Text>
                <Text style={styles.col}>ICD Code</Text>
                <Text style={styles.col}>Certainty</Text>
              </View>
              {diagnoses.map((diagnosis) => (
                <View key={diagnosis.id} style={styles.tableRow}>
                  <Text style={styles.colWide}>
                    {diagnosis.code_info?.description || "Not recorded"}
                    {diagnosis.is_primary ? " (Primary)" : ""}
                  </Text>
                  <Text style={styles.col}>{diagnosis.icd_code}</Text>
                  <Text style={styles.col}>{humanize(diagnosis.diagnosis_certainty)}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investigations And Treatments</Text>
          <FullField label="Investigation Results" value={form?.investigation_results} />
          <FullField label="Treatment Before Referral" value={form?.treatment_given_before_referral} />
          <FullField label="Medication On Transfer" value={form?.medication_on_transfer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          {attachments.length === 0 ? (
            <Text style={styles.note}>No attachments uploaded.</Text>
          ) : (
            attachments.map((attachment) => (
              <View key={attachment.id} style={styles.tableRow}>
                <Text style={styles.colWide}>
                  <Link src={attachment.storage_path} style={styles.link}>
                    {attachment.file_name}
                  </Link>
                  {"\n"}
                  <Text style={styles.small}>
                    {formatBytes(attachment.file_size)} · {humanize(attachment.category)}
                  </Text>
                </Text>
                <Text style={styles.col}>{humanize(attachment.verification)}</Text>
                <Text style={styles.col}>{formatDate(attachment.uploaded_at)}</Text>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );
}

export default function ReferralPdfExportButton(props: ReferralPdfExportButtonProps) {
  return (
    <PDFDownloadLink
      document={<ReferralPdfDocument {...props} />}
      fileName={`Referral-${props.referral.id.slice(0, 8)}.pdf`}
      className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Export to PDF")}
    </PDFDownloadLink>
  );
}
