import DocumentPage from './DocumentPage';

export default function Deliveries() {
  return (
    <DocumentPage
      docType="delivery"
      title="Deliveries"
      icon="📤"
      fromLocationType="internal"
      toLocationType="customer"
    />
  );
}
