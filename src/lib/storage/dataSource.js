import { DataSource } from 'typeorm'
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema'
import { SongFolders1700000001000 } from './migrations/1700000001000-SongFolders'

export const sqlite = new SQLiteConnection(CapacitorSQLite)

export const AppDataSource = new DataSource({
  type: 'capacitor',
  driver: sqlite,
  database: 'transcriber',
  entities: [],
  migrations: [InitialSchema1700000000000, SongFolders1700000001000],
  migrationsRun: true,
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  logging: false,
})
