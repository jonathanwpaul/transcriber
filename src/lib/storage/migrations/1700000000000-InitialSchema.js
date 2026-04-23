export class InitialSchema1700000000000 {
  name = 'InitialSchema1700000000000'

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS song (
        id                       INTEGER PRIMARY KEY AUTOINCREMENT,
        source_key               TEXT    UNIQUE NOT NULL,
        name                     TEXT    NOT NULL DEFAULT '',
        type                     TEXT    NOT NULL DEFAULT 'youtube'
                                   CHECK(type IN ('file', 'youtube')),
        link                     TEXT,
        content                  TEXT,
        file_directory           TEXT    NOT NULL DEFAULT 'DATA',
        beats_per_minute         INTEGER,
        beats_per_measure        INTEGER,
        last_accessed            TEXT,
        last_playback_rate       REAL,
        last_loop_start_position REAL,
        last_loop_end_position   REAL,
        last_playback_position   REAL,
        mime_type                TEXT,
        file_name                TEXT,
        file_size                INTEGER,
        last_modified            INTEGER,
        title                    TEXT
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS loop (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        song_id    INTEGER NOT NULL REFERENCES song(id) ON DELETE CASCADE,
        parent_id  INTEGER REFERENCES loop(id) ON DELETE CASCADE,
        name       TEXT,
        start_time REAL    NOT NULL,
        end_time   REAL    NOT NULL
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS recording (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        name           TEXT,
        loop_id        INTEGER NOT NULL REFERENCES loop(id) ON DELETE CASCADE,
        created_on     TEXT    NOT NULL,
        file_path      TEXT    NOT NULL DEFAULT '',
        file_directory TEXT    NOT NULL DEFAULT 'DATA'
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT
      )
    `)
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS recording`)
    await queryRunner.query(`DROP TABLE IF EXISTS loop`)
    await queryRunner.query(`DROP TABLE IF EXISTS song`)
    await queryRunner.query(`DROP TABLE IF EXISTS settings`)
  }
}
