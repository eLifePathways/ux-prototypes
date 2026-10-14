# Sciety discussions prototype

A static prototype of Sciety and discussions.sciety for remote moderated user testing.
Nothing is sent to a server: tester activity lives in the browser and is wiped on logout.

## Run it locally

```
npm install        # first time only
npm run dev        # then open the address it prints, usually http://localhost:5173
```

- Sciety: `http://localhost:5173/`
- Discussions: `http://localhost:5173/discussions/`
- Reset everything a tester has done: add `?reset` to the address, e.g. `http://localhost:5173/?reset`

## Assets to add or replace

- `public/sciety-logo.svg`: Sciety logo (until then the header shows "sciety" as text)
- `public/login.png`: screenshot used as the fake login page (click anywhere to log in)
- `public/discussions-illustration.png`: illustration on the discussions homepage (placeholder)

## Prototype content

- `src/data/profile.json`: the shared tester profile (name, handle, ORCID)
- `src/data/seed-comments.json`: fictional users and seeded discussion (20 articles)

## Testing a session

- Logging out of discussions wipes everything the tester did (posts, replies, edits, reports, imported DOIs).
- Moderator reset without logging out: add `?reset` to any address.

## Article data

`src/data/articles.json` is built from the eLife API:

```
node scripts/fetch-articles.mjs
```

Seeded discussion lives in `src/data/seed-comments.json`.

## Deploy

This prototype lives in the `sciety-discussions/` folder of the eLifePathways/ux-prototypes repo.
Pushing to `master` runs the repo's `.github/workflows/deploy.yml`, which builds it and publishes it to
https://elifepathways.github.io/ux-prototypes/sciety-discussions/ (Discussions is at `…/sciety-discussions/discussions/`).

Check a production build locally first with `npm run build && npm run preview`.
