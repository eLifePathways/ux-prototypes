import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logIn } from '../../shared/store.js';

// Fake login, two steps:
//   1. A screenshot of the Sciety login page. Clicking anywhere continues.
//      (Replace public/login.png with the final screenshot.)
//   2. "Enter your name": the name becomes the tester's display name and @handle.
const IMAGE = `${import.meta.env.BASE_URL}login.png`;

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 8h11M9 3.5L13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NameStep({ onDone }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError(true);
    onDone(name);
  }

  return (
    <div className="ds-page">
      <main className="ds-home ds-name-step">
        <h1 className="ds-home__title">Enter your name</h1>
        <form className="ds-doi-form" onSubmit={submit} noValidate>
          <label htmlFor="name-input" className="visually-hidden">Your name</label>
          <div className="ds-doi-form__row">
            <input
              id="name-input"
              ref={ref}
              className="ds-doi-form__input"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(false);
              }}
              aria-describedby={error ? 'name-error name-note' : 'name-note'}
              aria-invalid={error || undefined}
            />
            <button type="submit" className="ds-doi-form__submit" aria-label="Continue">
              <ArrowIcon />
            </button>
          </div>
          {error && (
            <p id="name-error" className="ds-doi-form__message ds-doi-form__message--error" role="alert">
              Please enter a name to continue.
            </p>
          )}
        </form>
        <p id="name-note" className="ds-doi-form__message ds-name-step__note">
          This is a prototype. Your details will be deleted when this session ends.
        </p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState('image'); // image | name

  function finish(name) {
    logIn(name);
    const returnTo = params.get('return') || '/';
    const action = params.get('action');
    navigate(action ? `${returnTo}?action=${encodeURIComponent(action)}` : returnTo, { replace: true });
  }

  if (step === 'name') return <NameStep onDone={finish} />;

  return (
    <button type="button" className="ds-login" onClick={() => setStep('name')} aria-label="Log in (prototype)">
      <img src={IMAGE} alt="Sciety log in page" />
    </button>
  );
}
