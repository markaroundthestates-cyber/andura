// Restore Account (route '/app/cont/restore-account') — soft-delete 30-day grace
// restore-vs-delete-now choice (web router.tsx L231). The AppShell guard
// redirects pending-deletion users here, so the route MUST exist (else the
// redirect dead-ends). Body ported in a later wave.
import { Placeholder } from '../../../components/Placeholder';
export default function RestoreAccount() {
  return <Placeholder name="Restaurare cont" route="/app/cont/restore-account" />;
}
