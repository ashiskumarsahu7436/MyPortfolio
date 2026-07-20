-- ============================================================
-- Portfolio CMS — Neon Database Schema
-- Run this once against your Neon project to set up all tables.
-- Neon dashboard → SQL Editor → paste & run
-- ============================================================

-- Admin credentials (single-row enforced by unique index)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_credentials_one_row
  ON admin_credentials ((true));

-- ── Site profile (one row) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS profile (
  id           SERIAL PRIMARY KEY,
  full_name    TEXT        NOT NULL DEFAULT '',
  tagline      TEXT        NOT NULL DEFAULT '',
  bio          TEXT        NOT NULL DEFAULT '',
  email        TEXT        NOT NULL DEFAULT '',
  github_url   TEXT        NOT NULL DEFAULT '',
  linkedin_url TEXT        NOT NULL DEFAULT '',
  photo_url    TEXT        NOT NULL DEFAULT '',
  focus        TEXT        NOT NULL DEFAULT '',
  philosophy   TEXT        NOT NULL DEFAULT '',
  tech_stack   TEXT[]      NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO profile DEFAULT VALUES
  ON CONFLICT DO NOTHING;

-- ── Projects ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  tech_stack  TEXT[]      NOT NULL DEFAULT '{}',
  live_url    TEXT        NOT NULL DEFAULT '',
  github_url  TEXT        NOT NULL DEFAULT '',
  thumbnail   TEXT        NOT NULL DEFAULT '',
  sort_order  INT         NOT NULL DEFAULT 0,
  published   BOOLEAN     NOT NULL DEFAULT true,
  status      TEXT        NOT NULL DEFAULT 'In Progress',
  label       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Resume metadata ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume (
  id           SERIAL PRIMARY KEY,
  file_url     TEXT        NOT NULL DEFAULT '',
  last_updated DATE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO resume DEFAULT VALUES
  ON CONFLICT DO NOTHING;

-- ── Certifications & Licenses ───────────────────────────────
CREATE TABLE IF NOT EXISTS certifications (
  id             SERIAL PRIMARY KEY,
  title          TEXT        NOT NULL DEFAULT '',
  issuer         TEXT        NOT NULL DEFAULT '',
  issue_date     DATE,
  expiry_date    DATE,
  credential_url TEXT        NOT NULL DEFAULT '',
  badge_url      TEXT        NOT NULL DEFAULT '',
  sort_order     INT         NOT NULL DEFAULT 0,
  published      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- After running this script, create your admin account:
--   POST /api/auth/setup  { "userId": "yourname", "password": "yourpassword" }
-- ============================================================
