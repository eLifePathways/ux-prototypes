import { useToast } from '../toast.js';

export default function Toast() {
  const toast = useToast();
  return (
    <div className="ds-toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="ds-toast" key={toast.id}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
