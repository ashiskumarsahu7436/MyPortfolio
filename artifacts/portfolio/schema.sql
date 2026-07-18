-- ============================================================
-- Portfolio CMS — Neon Database Schema
-- Run this once in your Neon project's SQL editor
-- (Neon dashboard → SQL Editor → paste and run)
-- ============================================================

-- Admin credentials table (single-row: only one admin account)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT        NOT NULL,
  password_hash TEXT       NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce exactly one admin row at the database level
CREATE UNIQUE INDEX IF NOT EXISTS admin_credentials_one_row
  ON admin_credentials ((true));

-- ============================================================
-- CMS content tables (add to these as the admin panel grows)
-- ============================================================

-- Site-wide profile settings (one row)
CREATE TABLE IF NOT EXISTS profile (
  id          SERIAL PRIMARY KEY,
  full_name   TEXT        NOT NULL DEFAULT '',
  tagline     TEXT        NOT NULL DEFAULT '',
  bio         TEXT        NOT NULL DEFAULT '',
  email       TEXT        NOT NULL DEFAULT '',
  github_url  TEXT        NOT NULL DEFAULT '',
  linkedin_url TEXT       NOT NULL DEFAULT '',
  photo_url   TEXT        NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO profile DEFAULT VALUES
  ON CONFLICT DO NOTHING;

-- Projects
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
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resume metadata
CREATE TABLE IF NOT EXISTS resume (
  id           SERIAL PRIMARY KEY,
  file_url     TEXT        NOT NULL DEFAULT '',
  last_updated DATE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO resume DEFAULT VALUES
  ON CONFLICT DO NOTHING;
