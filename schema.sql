-- ============================================================
-- BriarBid — PostgreSQL Schema
-- Run this in your Neon (or any Postgres) database console
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(120) NOT NULL DEFAULT '',
    avatar_url    VARCHAR(512) DEFAULT NULL,
    bio           TEXT         DEFAULT NULL,
    is_admin      BOOLEAN      NOT NULL DEFAULT FALSE,
    is_banned     BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    verify_token  VARCHAR(64)  DEFAULT NULL,
    reset_token   VARCHAR(64)  DEFAULT NULL,
    reset_expires TIMESTAMP    DEFAULT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT         DEFAULT NULL,
    icon        VARCHAR(50)  DEFAULT 'tag',
    sort_order  INT          NOT NULL DEFAULT 0
);

INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('Pipes',               'pipes',               'pipe',   1),
    ('Pipe Tobacco',        'pipe-tobacco',        'leaf',   2),
    ('Cigars',              'cigars',              'cigar',  3),
    ('Cigar Accessories',   'cigar-accessories',   'cutter', 4),
    ('Pipe Accessories',    'pipe-accessories',    'tool',   5),
    ('Lighters & Matches',  'lighters-matches',    'flame',  6),
    ('Humidors & Storage',  'humidors-storage',    'box',    7),
    ('Tobacco Tins & Jars', 'tobacco-tins-jars',   'tin',    8),
    ('Books & Literature',  'books-literature',    'book',   9),
    ('Other',               'other',               'misc',  10)
ON CONFLICT DO NOTHING;

-- Auctions
CREATE TABLE IF NOT EXISTS auctions (
    id              SERIAL PRIMARY KEY,
    seller_id       INT          NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    category_id     INT          NOT NULL REFERENCES categories(id)  ON DELETE RESTRICT,
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    description     TEXT         NOT NULL,
    condition_notes VARCHAR(255) DEFAULT NULL,
    starting_price  NUMERIC(12,2) NOT NULL DEFAULT 0.01,
    reserve_price   NUMERIC(12,2) DEFAULT NULL,
    buy_now_price   NUMERIC(12,2) DEFAULT NULL,
    current_bid     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    bid_count       INT          NOT NULL DEFAULT 0,
    winner_id       INT          DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','active','ended','cancelled','sold')),
    featured        BOOLEAN      NOT NULL DEFAULT FALSE,
    start_time      TIMESTAMP    NOT NULL,
    end_time        TIMESTAMP    NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auctions_status_end  ON auctions(status, end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_seller      ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_category    ON auctions(category_id);
CREATE INDEX IF NOT EXISTS idx_auctions_featured    ON auctions(featured);

-- Auction Images
CREATE TABLE IF NOT EXISTS auction_images (
    id          SERIAL PRIMARY KEY,
    auction_id  INT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    filename    VARCHAR(255) NOT NULL,
    sort_order  SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_auction ON auction_images(auction_id);

-- Bids
CREATE TABLE IF NOT EXISTS bids (
    id          SERIAL PRIMARY KEY,
    auction_id  INT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id   INT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    amount      NUMERIC(12,2) NOT NULL,
    is_auto     BOOLEAN  NOT NULL DEFAULT FALSE,
    max_amount  NUMERIC(12,2) DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON bids(auction_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_bidder         ON bids(bidder_id);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
    user_id    INT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    auction_id INT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    added_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, auction_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id          SERIAL PRIMARY KEY,
    auction_id  INT  NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    sender_id   INT  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    receiver_id INT  NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    body        TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, is_read);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INT          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    type       VARCHAR(50)  NOT NULL,
    auction_id INT          DEFAULT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    message    VARCHAR(512) NOT NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    auction_id  INT      NOT NULL UNIQUE REFERENCES auctions(id) ON DELETE CASCADE,
    reviewer_id INT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_id INT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT     DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
