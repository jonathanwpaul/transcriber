export class SongFolders1700000001000 {
  name = 'SongFolders1700000001000'

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE song ADD COLUMN display_name TEXT')

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS folder (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL UNIQUE,
        created_on TEXT NOT NULL
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS song_folder (
        song_id   INTEGER NOT NULL REFERENCES song(id) ON DELETE CASCADE,
        folder_id INTEGER NOT NULL REFERENCES folder(id) ON DELETE CASCADE,
        PRIMARY KEY (song_id, folder_id)
      )
    `)
  }

  async down(queryRunner) {
    await queryRunner.query('DROP TABLE IF EXISTS song_folder')
    await queryRunner.query('DROP TABLE IF EXISTS folder')
  }
}
