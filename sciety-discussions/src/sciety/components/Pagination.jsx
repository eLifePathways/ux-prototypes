import { Link } from 'react-router-dom';

const to = (page) => (page === 1 ? '/' : `/?page=${page}`);

// Mirrors sciety.org: "← Newer   Page 2 of 5   Older →".
// Newer is hidden on the first page, Older on the last.
export default function Pagination({ page, pageCount }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="sc-pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link className="sc-pagination__button" to={to(page - 1)} rel="prev">
          <span aria-hidden="true">←</span> Newer
        </Link>
      ) : (
        <span className="sc-pagination__spacer" aria-hidden="true" />
      )}
      <span className="sc-pagination__status">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link className="sc-pagination__button" to={to(page + 1)} rel="next">
          Older <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="sc-pagination__spacer" aria-hidden="true" />
      )}
    </nav>
  );
}
