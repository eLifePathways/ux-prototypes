import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ME, getArticle, getComment, getUser } from '../../shared/store.js';
import InlineHtml from '../../shared/InlineHtml.jsx';
import { PostBody, PostHeader } from './Post.jsx';

const LONG = 420; // characters before "Read more" appears

function ArticleCard({ article }) {
  return (
    <Link className="ds-card" to={`/articles/${encodeURIComponent(article.id)}`}>
      <InlineHtml as="p" className="ds-card__title" html={article.title} />
      <div>
        <p className="ds-card__authors">{article.authors.join(', ')}</p>
        <p className="ds-card__doi">https://doi.org/{article.doi}</p>
      </div>
    </Link>
  );
}

/** A post or reply shown on Profile or Explore, with the article it belongs to. */
export default function FeedItem({ comment }) {
  const [expanded, setExpanded] = useState(false);
  const article = getArticle(comment.articleId);
  const parent = comment.parentId ? getComment(comment.parentId) : null;
  const parentUser = parent ? getUser(parent.userId) : null;
  const isLong = comment.body.length > LONG;

  let label = null;
  if (parentUser) {
    const who = comment.userId === ME.id ? 'You' : getUser(comment.userId).name;
    label = `${who} replied to ${parentUser.name}`;
  }

  return (
    <li className="ds-feed__item">
      <PostHeader comment={comment} />
      <div>
        {label && <p className="ds-post__label">{label}</p>}
        <div style={{ marginTop: label ? 16 : 0 }}>
          <PostBody body={comment.body} clamp={isLong && !expanded} />
        </div>
      </div>
      {isLong && (
        <button type="button" className="ds-text-button ds-feed__more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
      {article && <ArticleCard article={article} />}
    </li>
  );
}
