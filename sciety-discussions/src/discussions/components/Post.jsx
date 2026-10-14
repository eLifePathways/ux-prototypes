import { useState } from 'react';
import { getUser, isReported } from '../../shared/store.js';
import { formatLongDate } from '../../shared/format.js';

export function PostHeader({ comment }) {
  const user = getUser(comment.userId);
  return (
    <div className="ds-post__header">
      <div className="ds-post__author">
        <span className="ds-avatar" aria-hidden="true" />
        <span className="ds-post__name">{user.name}</span>
        <span className="ds-post__username">@{user.handle}</span>
      </div>
      <time className="ds-post__date" dateTime={comment.createdAt}>
        {formatLongDate(comment.createdAt)}
      </time>
    </div>
  );
}

export function PostBody({ body, clamp = false }) {
  const paras = body.split(/\n{2,}/);
  return (
    <div className={`ds-post__body${clamp ? ' ds-post__body--clamped' : ''}`}>
      {paras.map((p, i) => (
        <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>
      ))}
    </div>
  );
}

/**
 * A post or reply on the discussion page.
 * Own posts: Edit / Delete. Other people's: Report / Reply (Reply on top-level posts only).
 */
export default function Post({ comment, isOwn, isReply, onReply, onEdit, onDelete, onReport, hideActions, children }) {
  const [confirming, setConfirming] = useState(false);
  const reported = isReported(comment.id);

  return (
    <article className={`ds-post${isReply ? ' ds-post--reply' : ''}`} id={`post-${comment.id}`}>
      <PostHeader comment={comment} />
      <PostBody body={comment.body} />
      {children}
      {!hideActions && (
      <div className="ds-post__footer">
        {comment.editedAt && <p className="ds-post__edited">Edited on {formatLongDate(comment.editedAt)}</p>}
        <div className="ds-post__actions">
          {isOwn ? (
            confirming ? (
              <>
                <span className="ds-post__confirm">Delete this {isReply ? 'reply' : 'comment'}?</span>
                <button type="button" className="ds-text-button" onClick={() => setConfirming(false)}>Cancel</button>
                <button type="button" className="ds-text-button" onClick={onDelete}>Delete</button>
              </>
            ) : (
              <>
                <button type="button" className="ds-text-button" onClick={onEdit}>Edit</button>
                <button type="button" className="ds-text-button" onClick={() => setConfirming(true)}>Delete</button>
              </>
            )
          ) : (
            <>
              {reported ? (
                <span className="ds-post__muted">Reported</span>
              ) : (
                <button type="button" className="ds-text-button" onClick={onReport}>Report</button>
              )}
              {!isReply && onReply && (
                <button type="button" className="ds-text-button" onClick={onReply}>Reply</button>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </article>
  );
}
