import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookupDoi } from '../doiLookup.js';

const ILLUSTRATION = `${import.meta.env.BASE_URL}discussions-illustration.png`;

// Example DOIs shown under the box, all articles in this prototype:
// two with seeded discussions (110151, 108234) and one without (111851).
const EXAMPLES = ['10.7554/eLife.110151', '10.7554/eLife.111851', '10.7554/eLife.108234'];

const MESSAGES = {
  loading: 'Looking up this DOI…',
  invalid: 'That doesn’t look like a DOI. A DOI starts with 10., for example 10.1101/2025.04.03.647082',
  'not-found': 'We couldn’t find an article with that DOI. Check it and try again.',
  error: 'We couldn’t look up that DOI just now. Please try again.',
};

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 8h11M9 3.5L13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | invalid | not-found | error

  async function runLookup(input) {
    if (!input.trim() || status === 'loading') return;
    setStatus('loading');
    const result = await lookupDoi(input);
    if (result.status === 'found') {
      navigate(`/articles/${encodeURIComponent(result.article.id)}`);
    } else {
      setStatus(result.status);
    }
  }

  function submit(e) {
    e.preventDefault();
    runLookup(value);
  }

  // Clicking an example fills the box and looks it up.
  function tryExample(e, doi) {
    e.preventDefault();
    setValue(`https://doi.org/${doi}`);
    runLookup(doi);
  }

  const message = MESSAGES[status];
  const isError = ['invalid', 'not-found', 'error'].includes(status);

  return (
    <div className="ds-home">
      <img className="ds-home__illustration" src={ILLUSTRATION} alt="" />
      <h1 className="ds-home__title">
        Welcome to
        <br />
        Sciety discussions
      </h1>

      <form className="ds-doi-form" onSubmit={submit} noValidate>
        <label htmlFor="doi-input">Please enter the DOI of the article you want to discuss:</label>
        <div className="ds-doi-form__row">
          <input
            id="doi-input"
            className="ds-doi-form__input"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck="false"
            placeholder="https://doi.org/10.1101/2025.04.03.647082"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (status !== 'loading') setStatus('idle');
            }}
            aria-describedby="doi-message"
            aria-invalid={isError || undefined}
          />
          <button type="submit" className="ds-doi-form__submit" disabled={status === 'loading'} aria-label="Find article">
            {status === 'loading' ? <span className="ds-spinner" aria-hidden="true" /> : <ArrowIcon />}
          </button>
        </div>
        <p
          id="doi-message"
          className={`ds-doi-form__message${isError ? ' ds-doi-form__message--error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {message || ''}
        </p>
        <div className="ds-doi-examples">
          <p className="ds-doi-examples__label">Or try some examples:</p>
          <ul className="ds-doi-examples__list">
            {EXAMPLES.map((doi) => (
              <li key={doi}>
                <a href={`https://doi.org/${doi}`} onClick={(e) => tryExample(e, doi)}>
                  https://doi.org/{doi}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}
