import { Link, Navigate } from 'react-router-dom';
import { ME, getMyPosts, useSession } from '../../shared/store.js';
import FeedItem from '../components/FeedItem.jsx';
import { loginPath } from '../auth.js';

export default function ProfilePage() {
  const { loggedIn } = useSession();
  if (!loggedIn) return <Navigate to={loginPath('/profile')} replace />;

  const posts = getMyPosts();

  return (
    <div className="ds-column">
      <header className="ds-page-header">
        <div className="ds-page-header__row">
          <h1 className="ds-h1">Profile</h1>
          <button type="button" className="ds-button">Settings</button>
        </div>
        <div className="ds-profile__details">
          <p className="ds-profile__handle">
            {ME.name} <span className="ds-profile__username">@{ME.handle}</span>
          </p>
          <p className="ds-profile__ids">
            <span className="ds-orcid-dot" aria-hidden="true" />
            <span className="ds-profile__orcid">{ME.orcid}</span>
            <span>
              &nbsp;|&nbsp; {posts.length} {posts.length === 1 ? 'comment' : 'comments'}
            </span>
          </p>
        </div>
      </header>

      {posts.length === 0 ? (
        <p className="ds-feed__empty">
          You haven’t commented yet. <Link className="ds-link" to="/explore">Explore discussions</Link> or{' '}
          <Link className="ds-link" to="/">enter a DOI</Link> to start one.
        </p>
      ) : (
        <ul className="ds-feed">
          {posts.map((c) => (
            <FeedItem key={c.id} comment={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
