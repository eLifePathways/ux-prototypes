import { Link, useSearchParams } from 'react-router-dom';
import { getArticles, getComments, useStoreVersion } from '../../shared/store.js';
import { formatDate } from '../../shared/format.js';
import InlineHtml from '../../shared/InlineHtml.jsx';
import Pagination from '../components/Pagination.jsx';

const PAGE_SIZE = 20;

function ListingRow({ article }) {
  const count = getComments(article.id).length; // comments and replies
  return (
    <li className="sc-row">
      <div className="sc-row__main">
        <p className="sc-subject">{article.subjects?.[0]}</p>
        <h2 className="sc-row__title">
          <Link to={`/articles/${article.id}`}>
            <InlineHtml html={article.title} />
          </Link>
        </h2>
        <p className="sc-row__authors">{article.authors.join(', ')}</p>
        <p className="sc-row__doi">https://doi.org/{article.doi}</p>
      </div>
      <dl className="sc-row__meta">
        <div>
          <dt>Latest version:</dt>
          <dd>{formatDate(article.versionDate)}</dd>
        </div>
        {count > 0 && (
          <div>
            <dt className="visually-hidden">Discussion:</dt>
            <dd className="sc-row__comments">{count === 1 ? '1 comment' : `${count} comments`}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}

export default function ListingPage() {
  useStoreVersion();
  const [params] = useSearchParams();
  const articles = getArticles();
  const pageCount = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, Number(params.get('page')) || 1));
  const visible = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="sc-container sc-listing">
      <header className="sc-listing__header">
        <h1 className="sc-h1">Browse Sciety</h1>
        <p className="sc-listing__count">{articles.length} peer-reviewed preprints.</p>
      </header>

      <ol className="sc-list">
        {visible.map((a) => (
          <ListingRow key={a.id} article={a} />
        ))}
      </ol>

      <Pagination page={page} pageCount={pageCount} />
    </div>
  );
}
