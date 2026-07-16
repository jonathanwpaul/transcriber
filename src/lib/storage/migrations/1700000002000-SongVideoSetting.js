export class SongVideoSetting1700000002000 {
  name = 'SongVideoSetting1700000002000'

  async up(queryRunner) {
    await queryRunner.query(
      'ALTER TABLE song ADD COLUMN show_video INTEGER NOT NULL DEFAULT 1',
    )
  }

  async down() {}
}
