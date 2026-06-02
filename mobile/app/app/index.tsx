// /app index → Antrenor (web router.tsx L167 `{ index: true }`).
import { Redirect } from 'expo-router';
export default function AppIndex() {
  return <Redirect href="/app/antrenor" />;
}
