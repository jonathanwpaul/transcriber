export class AddRecordingFilePath1700000000001 {
  name = 'AddRecordingFilePath1700000000001'

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE recording ADD COLUMN file_path TEXT NOT NULL DEFAULT ''`,
    )
  }

  async down(queryRunner) {
    // SQLite doesn't support DROP COLUMN in older versions; recreate table
    await queryRunner.query(`
      CREATE TABLE recording_backup (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT,
        loop_id    INTEGER NOT NULL REFERENCES loop(id) ON DELETE CASCADE,
        created_on TEXT    NOT NULL
      )
    `)
    await queryRunner.query(`
      INSERT INTO recording_backup (id, name, loop_id, created_on)
      SELECT id, name, loop_id, created_on FROM recording
    `)
    await queryRunner.query(`DROP TABLE recording`)
    await queryRunner.query(`ALTER TABLE recording_backup RENAME TO recording`)
  }
}
