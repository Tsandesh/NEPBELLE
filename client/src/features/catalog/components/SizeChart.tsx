// PLACEHOLDER VALUES: the Size Chart screen (Figma 7:3292) has not been mapped yet. Replace with measurements from that node.
const ROWS = [['XS', '32', '26', '35'], ['S', '34', '28', '37'], ['M', '36', '30', '39'], ['L', '38', '32', '41'], ['XL', '40', '34', '43'], ['XXL', '42', '36', '45']];
export const SizeChart = () => (
  <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
    <thead><tr className="bg-canvas">{['Size', 'Bust (in)', 'Waist (in)', 'Hip (in)'].map((h) => <th key={h} className="border border-line px-4 py-3 font-serif font-extrabold">{h}</th>)}</tr></thead>
    <tbody>{ROWS.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className="border border-line px-4 py-3">{c}</td>)}</tr>)}</tbody>
  </table></div>
);
