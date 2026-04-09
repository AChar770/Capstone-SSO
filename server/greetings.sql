CREATE TABLE IF NOT EXISTS greetings (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL
);

INSERT INTO greetings (message)
SELECT 'Hello World!'
WHERE NOT EXISTS (
  SELECT 1 FROM greetings
);
