export class SongLoopSetting1700000003000 {
  name = 'SongLoopSetting1700000003000'

  async up(queryRunner) {
    await queryRunner.query(
      'ALTER TABLE song ADD COLUMN loop_enabled INTEGER NOT NULL DEFAULT 1',
    )
  }

  async down() {}
}
