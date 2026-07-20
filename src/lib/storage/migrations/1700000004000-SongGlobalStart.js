export class SongGlobalStart1700000004000 {
  name = 'SongGlobalStart1700000004000'

  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE song ADD COLUMN global_start REAL')
  }

  async down() {}
}
