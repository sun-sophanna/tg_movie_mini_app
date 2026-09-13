import '../load-env';
import { Client } from 'pg';

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL required');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  await client.query(`
    INSERT INTO categories (name, name_kh, slug, status)
    VALUES ('Action', 'សកម្មភាព', 'action', 'ACTIVE')
    ON CONFLICT (slug) DO NOTHING;
  `);

  await client.query(`
    INSERT INTO movies (title, title_kh, slug, type, status, is_featured, is_trending, release_year, rating, poster_url)
    VALUES (
      'Sample Movie',
      'ភាពយន្តគំរូ',
      'sample-movie',
      'MOVIE',
      'ACTIVE',
      true,
      true,
      2024,
      8.5,
      'https://placehold.co/400x600/1f2937/fff?text=Sample'
    )
    ON CONFLICT (slug) DO NOTHING;
  `);

  const movie = await client.query(`SELECT id FROM movies WHERE slug = 'sample-movie' LIMIT 1`);
  const movieId = movie.rows[0]?.id;
  if (movieId) {
    await client.query(
      `
      INSERT INTO episodes (movie_id, episode_number, title, telegram_file_id, status, duration_seconds)
      VALUES ($1, 1, 'Full movie', 'REPLACE_WITH_REAL_FILE_ID', 'ACTIVE', 7200)
      ON CONFLICT DO NOTHING;
    `,
      [movieId],
    );
  }

  await client.end();
  console.log('Seed completed (update telegram_file_id with a real channel file_id).');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
