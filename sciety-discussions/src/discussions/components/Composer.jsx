import { useEffect, useRef, useState } from 'react';

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Text box for a new post, a reply or an edit.
 * variant: 'post' | 'reply' | 'edit'
 */
export default function Composer({ variant = 'post', initialValue = '', onSubmit, onCancel }) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef(null);

  // Bring the box into view and focus it. Runs a frame later so it happens after the
  // page's own scroll-to-top (e.g. when returning from login).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      el.closest('form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
      el.setSelectionRange(el.value.length, el.value.length);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const copy = {
    post: { placeholder: 'Write your comment', button: 'Comment', label: 'Your comment' },
    reply: { placeholder: 'Write your reply', button: 'Reply', label: 'Your reply' },
    edit: { placeholder: 'Edit your comment', button: 'Save', label: 'Edit your comment' },
  }[variant];

  function submit(e) {
    e.preventDefault();
    if (value.trim()) onSubmit(value);
  }

  return (
    <form className={`ds-composer ds-composer--${variant}`} onSubmit={submit}>
      <label className="visually-hidden" htmlFor={`composer-${variant}`}>{copy.label}</label>
      <textarea
        id={`composer-${variant}`}
        ref={ref}
        className="ds-composer__input"
        placeholder={copy.placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button type="button" className="ds-composer__close" onClick={onCancel} aria-label="Cancel">
        <CloseIcon />
      </button>
      <div className="ds-composer__footer">
        {variant === 'post' && <p className="ds-composer__hint">This comment will be visible to anyone</p>}
        <button type="submit" className="ds-button ds-button--tall" style={{ marginLeft: 'auto' }}>
          {copy.button}
        </button>
      </div>
    </form>
  );
}
