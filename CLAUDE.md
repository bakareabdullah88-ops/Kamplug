# Notes for Claude Code sessions

## Commit authorship

The owner (GitHub: `bakareabdullah88-ops`) directs all work in this repo, so commits
should show them as the author, with Claude kept as a co-author for transparency.

Before the first commit of a session, set (repo-local, never `--global`):

```
git config user.name "bakare"
git config user.email "323195014+bakareabdullah88-ops@users.noreply.github.com"
```

That address is the owner's GitHub noreply email, so GitHub links the commits to their
account without exposing a personal email. Keep the `Co-Authored-By: Claude …` trailer on
every commit message. Don't rewrite or force-push already-pushed history unless the owner
asks for it in that session.
