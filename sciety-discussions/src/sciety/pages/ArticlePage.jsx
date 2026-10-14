import { Link, useParams } from 'react-router-dom';
import {
  getComments,
  getLatestActivity,
  getRelatedArticles,
  getThread,
  hasDiscussion,
  getUser,
  links,
  useArticle,
} from '../../shared/store.js';
import { formatDate, formatDayMonthYear, timeAgo } from '../../shared/format.js';
import InlineHtml from '../../shared/InlineHtml.jsx';

function Comment({ comment }) {
  const user = getUser(comment.userId);
  return (
    <div className="sc-comment">
      <p className="sc-comment__author">
        {user.name} <span className="sc-comment__username">@{user.handle}</span>
      </p>
      <div className="sc-comment__body">
        {comment.body.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}

function Discussion({ article, thread }) {
  const started = thread[0]?.createdAt;
  return (
    <section className="sc-section sc-discussion" aria-labelledby="discussion-heading">
      <div className="sc-discussion__heading">
        <h2 id="discussion-heading" className="sc-section__title">Discussion</h2>
        <p className="sc-discussion__date">{formatDayMonthYear(started)}</p>
      </div>
      <ol className="sc-discussion__list">
        {thread.map((c) => (
          <li key={c.id}>
            <Comment comment={c} />
            {c.replies.length > 0 && (
              <ol className="sc-discussion__replies">
                {c.replies.map((r) => (
                  <li key={r.id}>
                    <Comment comment={r} />
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
      <a className="sc-button sc-button--secondary" href={links.discussion(article.id)}>
        Join the discussion
      </a>
    </section>
  );
}

function RelatedArticles({ article }) {
  const related = getRelatedArticles(article);
  if (!related.length) return null;
  return (
    <section className="sc-related" aria-labelledby="related-heading">
      <h2 id="related-heading" className="sc-section__title">Related articles</h2>
      <ul className="sc-related__list">
        {related.map((r) => (
          <li key={r.id} className="sc-related__item">
            <h3 className="sc-related__title">
              <Link to={`/articles/${r.id}`}>
                <InlineHtml html={r.title} />
              </Link>
            </h3>
            <p className="sc-related__authors">{r.authors.join(', ')}</p>
            <p className="sc-related__meta">
              Latest version {formatDate(r.versionDate)}
              {hasDiscussion(r) && (
                <>
                  <span className="sc-dot" aria-hidden="true">•</span>
                  Latest activity {formatDate(getLatestActivity(r))}
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ArticlePage() {
  const { id } = useParams();
  const article = useArticle(id);

  if (!article) {
    return (
      <div className="sc-container sc-article">
        <h1 className="sc-h1">Article not found</h1>
        <p className="sc-not-found">
          <Link to="/">Back to Browse Sciety</Link>
        </p>
      </div>
    );
  }

  const thread = getThread(article.id);
  const discussed = thread.length > 0;
  const posts = getComments(article.id); // posts and replies
  const latestComment = discussed ? posts.at(-1).createdAt : null;
  const postSummary =
    posts.length === 1
      ? `1 comment added ${timeAgo(latestComment)}`
      : `${posts.length} comments, latest added ${timeAgo(latestComment)}`;
  const doiUrl = `https://doi.org/${article.doi}`;

  return (
    <article className="sc-container sc-article">
      <header className="sc-article__header">
        <p className="sc-subject">{article.subjects?.[0]}</p>
        <InlineHtml as="h1" className="sc-article__title" html={article.title} />
        <p className="sc-article__authors">{article.authors.join(', ')}</p>
        <p className="sc-article__meta">
          <span>Latest version: <strong>{formatDate(article.versionDate)}</strong></span>
          {discussed && <span>Latest activity: <strong>{formatDate(getLatestActivity(article))}</strong></span>}
          <span>DOI: <strong>{doiUrl}</strong></span>
        </p>
      </header>

      <div className="sc-article__actions">
        <a className="sc-button sc-button--primary" href={article.url} target="_blank" rel="noreferrer">
          Read the full article
        </a>
        {discussed ? (
          <>
            <a className="sc-button sc-button--secondary" href={links.discussion(article.id)}>
              Join the discussion
            </a>
            <p className="sc-article__posts">{postSummary}</p>
          </>
        ) : (
          <a className="sc-button sc-button--secondary" href={links.discussion(article.id)}>
            Discuss this preprint
          </a>
        )}
      </div>

      <div className="sc-article__body">
        <section className="sc-section" aria-labelledby="abstract-heading">
          <h2 id="abstract-heading" className="sc-section__title">Abstract</h2>
          <div className="sc-abstract">
            {article.abstract.map((p, i) => (
              <InlineHtml as="p" key={i} html={p} />
            ))}
          </div>
        </section>
        {discussed && <Discussion article={article} thread={thread} />}
      </div>

      <RelatedArticles article={article} />
    </article>
  );
}
