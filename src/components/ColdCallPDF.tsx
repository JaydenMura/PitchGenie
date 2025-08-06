import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 22, marginBottom: 10, fontWeight: "bold" },
  section: { marginBottom: 10 },
  text: { fontSize: 12, lineHeight: 1.5 },
});

export function ColdCallPDF({ title, content }: { title: string; content: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.section}>
          <Text style={styles.text}>{content}</Text>
        </View>
      </Page>
    </Document>
  );
}
