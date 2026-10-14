import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ME,
  addComment,
  deleteComment,
  editComment,
  getThread,
  links,
  reportComment,
  useArticle,
  useSession,
} from '../../shared/store.js';
import { formatDate } from '../../shared/format.js';
import InlineHtml from '../../shared/InlineHtml.jsx';
import Composer from '../components/Composer.jsx';
import Post, { PostHeader } from '../components/Post.jsx';
import { loginPath } from '../auth.js';
import { showToast } from '../toast.js';

function scrollToPost(id) {
  requestAnimationFrame(() => {
    document.getElementById(`post-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

export default function DiscussionPage() {
  const { id } = useParams();
  const article = useArticle(id);
  const { loggedIn } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  // Only one text box open at a time: { type: 'post' } | { type: 'reply', id } | { type: 'edit', id }
  const [open, setOpen] = useState(null);

  // Close any open text box when moving to a different article.
  useEffect(() => {
    setOpen(null);
  }, [id]);

  // After logging in from "Add a post" / "Reply", reopen what the tester was doing.
  useEffect(() => {
    const action = params.get('action');
    if (!action || !loggedIn) return;
    if (action === 'post') setOpen({ type: 'post' });
    if (action.startsWith('reply:')) setOpen({ type: 'reply', id: action.slice(6) });
    params.delete('action');
    setParams(params, { replace: true });
  }, [params, setParams, loggedIn]);

  if (!article) {
    return (
      <div className="ds-column ds-column--wide ds-not-found">
        <h1 className="ds-h1">We couldn’t find this article</h1>
        <p>
          <Link className="ds-link" to="/">Enter a DOI</Link> to start or find a discussion.
        </p>
      </div>
    );
  }

  const thread = getThread(article.id);
  const requireLogin = (action) => navigate(loginPath(location.pathname, action));

  const newPostComposer = (
    <Composer
      variant="post"
      onCancel={() => setOpen(null)}
      onSubmit={(body) => {
        const post = addComment({ articleId: article.id, body });
        setOpen(null);
        scrollToPost(post.id);
        showToast('Comment added');
      }}
    />
  );

  function startPost() {
    if (!loggedIn) return requireLogin('post');
    setOpen({ type: 'post' });
  }
  function startReply(commentId) {
    if (!loggedIn) return requireLogin(`reply:${commentId}`);
    setOpen({ type: 'reply', id: commentId });
  }
  function report(commentId) {
    if (!loggedIn) return requireLogin();
    reportComment(commentId);
    showToast('Comment reported');
  }

  return (
    <div className="ds-column ds-column--wide">
      <header className="ds-article">
        {/* Articles added by DOI aren't on Sciety, so they get no back link */}
        {!article.imported && (
          <a className="ds-back-link" href={links.scietyArticle(article.id)}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Sciety
          </a>
        )}
        <InlineHtml as="h1" className="ds-article__title" html={article.title} />
        <p className="ds-article__authors">{article.authors.join(', ')}</p>
        {/* Same content and format as the Sciety article page */}
        <p className="ds-article__meta">
          <span>Latest version: <strong>{formatDate(article.versionDate || article.published)}</strong></span>
          <span>DOI: <strong>https://doi.org/{article.doi}</strong></span>
        </p>
      </header>

      <section className="ds-discussion" aria-labelledby="discussion-heading">
        <div className="ds-discussion__header">
          <h2 id="discussion-heading" className="ds-h2">Discussion</h2>
          <button type="button" className="ds-button" onClick={startPost} disabled={open?.type === 'post'}>
            Add a comment
          </button>
        </div>

        {/* No discussion yet: the new post box sits under the heading */}
        {thread.length === 0 && open?.type === 'post' && newPostComposer}
        {thread.length === 0 && open?.type !== 'post' && (
          <div className="ds-empty">
            <p>
              This preprint has not yet been discussed.{' '}
              <button type="button" className="ds-text-button ds-link" onClick={startPost}>Add a comment</button>{' '}
              to start the discussion.
            </p>
            <p>Comments are visible to everybody.</p>
          </div>
        )}

        {thread.map((c) => {
          const replyingHere = open?.type === 'reply' && open.id === c.id;
          return (
            <div className="ds-thread" key={c.id}>
              {open?.type === 'edit' && open.id === c.id ? (
                <article className="ds-post" id={`post-${c.id}`}>
                  <PostHeader comment={c} />
                  <Composer
                    variant="edit"
                    initialValue={c.body}
                    onCancel={() => setOpen(null)}
                    onSubmit={(body) => {
                      editComment(c.id, body);
                      setOpen(null);
                      showToast('Comment updated');
                    }}
                  />
                </article>
              ) : (
                <Post
                  comment={c}
                  isOwn={c.userId === ME.id}
                  hideActions={replyingHere}
                  onReply={() => startReply(c.id)}
                  onReport={() => report(c.id)}
                  onEdit={() => setOpen({ type: 'edit', id: c.id })}
                  onDelete={() => {
                    deleteComment(c.id);
                    showToast('Comment deleted');
                  }}
                >
                  {replyingHere && (
                    <Composer
                      variant="reply"
                      onCancel={() => setOpen(null)}
                      onSubmit={(body) => {
                        const reply = addComment({ articleId: article.id, parentId: c.id, body });
                        setOpen(null);
                        scrollToPost(reply.id);
                        showToast('Reply added');
                      }}
                    />
                  )}
                </Post>
              )}

              {c.replies.length > 0 && (
                <div className="ds-replies">
                  {c.replies.map((r) =>
                    open?.type === 'edit' && open.id === r.id ? (
                      <article className="ds-post ds-post--reply" id={`post-${r.id}`} key={r.id}>
                        <PostHeader comment={r} />
                        <Composer
                          variant="edit"
                          initialValue={r.body}
                          onCancel={() => setOpen(null)}
                          onSubmit={(body) => {
                            editComment(r.id, body);
                            setOpen(null);
                            showToast('Reply updated');
                          }}
                        />
                      </article>
                    ) : (
                      <Post
                        key={r.id}
                        comment={r}
                        isReply
                        isOwn={r.userId === ME.id}
                        onReport={() => report(r.id)}
                        onEdit={() => setOpen({ type: 'edit', id: r.id })}
                        onDelete={() => {
                          deleteComment(r.id);
                          showToast('Reply deleted');
                        }}
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Existing discussion: the new post box goes below it */}
        {thread.length > 0 && open?.type === 'post' && newPostComposer}
      </section>
    </div>
  );
}
