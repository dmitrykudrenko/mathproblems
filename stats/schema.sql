-- one row per (problem, answer key, hints opened before answering); h = 0 on pages without hints
CREATE TABLE IF NOT EXISTS votes (
  slug TEXT NOT NULL,
  k TEXT NOT NULL,
  h INTEGER NOT NULL DEFAULT 0,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (slug, k, h)
);
