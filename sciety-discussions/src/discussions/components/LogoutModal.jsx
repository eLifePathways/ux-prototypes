import { useEffect, useRef } from 'react';

/**
 * Confirmation before logging out. Uses the native <dialog> element, so focus is
 * kept inside it, Escape closes it, and the page behind can't be clicked.
 */
export default function LogoutModal({ open, onCancel, onConfirm }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="ds-modal"
      aria-labelledby="logout-title"
      aria-describedby="logout-text"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel(); // click on the backdrop
      }}
    >
      <h2 id="logout-title" className="ds-modal__title">Log out and reset prototype?</h2>
      <p id="logout-text" className="ds-modal__text">
        Logging out will delete your name and all your comments in this prototype.
      </p>
      <div className="ds-modal__actions">
        <button type="button" className="ds-button ds-button--secondary" onClick={onCancel} autoFocus>
          Cancel
        </button>
        <button type="button" className="ds-button" onClick={onConfirm}>
          Log out
        </button>
      </div>
    </dialog>
  );
}
