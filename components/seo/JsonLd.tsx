// Renders a JSON-LD <script> for rich search results. Server component;
// `data` is a plain object (or array of objects) already shaped to schema.org.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
