import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStreams1725840000000 implements MigrationInterface {
  name = 'CreateStreams1725840000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`streams\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`streamer_id\` int NOT NULL,
      \`title\` varchar(150) NOT NULL,
      \`description\` text NULL,
      \`room_name\` varchar(80) NOT NULL,
      \`status\` enum ('CREATED', 'LIVE', 'ENDED') NOT NULL DEFAULT 'CREATED',
      \`thumbnail_url\` varchar(2048) NULL,
      \`started_at\` datetime NULL,
      \`ended_at\` datetime NULL,
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (\`id\`), UNIQUE KEY \`UQ_streams_room_name\` (\`room_name\`),
      KEY \`IDX_streams_streamer_id\` (\`streamer_id\`),
      KEY \`IDX_streams_status\` (\`status\`), KEY \`IDX_streams_started_at\` (\`started_at\`),
      KEY \`IDX_streams_status_started_at\` (\`status\`, \`started_at\`),
      CONSTRAINT \`FK_streams_streamer_id\` FOREIGN KEY (\`streamer_id\`) REFERENCES \`user\` (\`id\`) ON DELETE RESTRICT
    ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `streams`');
  }
}
