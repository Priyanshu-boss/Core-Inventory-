import DocumentPage from './DocumentPage';

export default function Receipts() {
  return (
    <DocumentPage
      docType="receipt"
      title="Receipts"
      icon="📥"
      fromLocationType="vendor"
      toLocationType="internal"
    />
  );
}
