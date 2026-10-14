import { getAllPosts, useStoreVersion } from '../../shared/store.js';
import FeedItem from '../components/FeedItem.jsx';

export default function ExplorePage() {
  useStoreVersion();
  const posts = getAllPosts();

  return (
    <div className="ds-column">
      <header className="ds-page-header ds-page-header--roomy">
        <h1 className="ds-h1">Explore</h1>
      </header>
      <ul className="ds-feed">
        {posts.map((c) => (
          <FeedItem key={c.id} comment={c} />
        ))}
      </ul>
    </div>
  );
}
