"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles for PDF
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  header: { fontSize: 20, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
  section: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  content: { fontSize: 12, lineHeight: 1.4 },
});

interface ProposalPDFProps {
  title: string;
  description: string;
  content: string;
}

export default function ProposalPDF({ title, description, content }: ProposalPDFProps) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>{title}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Project Details:</Text>
          <Text style={styles.content}>{description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Proposal Content:</Text>
          <Text style={styles.content}>{content}</Text>
        </View>
      </Page>
    </Document>
  );
}
