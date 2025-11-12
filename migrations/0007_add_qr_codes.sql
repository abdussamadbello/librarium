-- Add QR code columns to users and book_copies tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;
ALTER TABLE book_copies ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;

-- Create indexes for faster QR lookups
CREATE INDEX IF NOT EXISTS idx_users_qr_code ON users(qr_code);
CREATE INDEX IF NOT EXISTS idx_book_copies_qr_code ON book_copies(qr_code);

-- Generate QR codes for existing users (using their ID)
UPDATE users SET qr_code = 'USER_' || id WHERE qr_code IS NULL;

-- Generate QR codes for existing book copies (using their ID)
UPDATE book_copies SET qr_code = 'BOOK_' || id WHERE qr_code IS NULL;
