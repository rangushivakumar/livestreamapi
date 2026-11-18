import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStreamMessages1725840100000 implements MigrationInterface {
  name = 'CreateStreamMessages1725840100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`stream_messages\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`stream_id\` int NOT NULL,
      \`user_id\` int NOT NULL,
      \`message\` varchar(500) NOT NULL,
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (\`id\`),
      KEY \`IDX_stream_messages_stream_created\` (\`stream_id\`, \`created_at\`),
      KEY \`IDX_stream_messages_user_id\` (\`user_id\`),
      CONSTRAINT \`FK_stream_messages_stream_id\` FOREIGN KEY (\`stream_id\`) REFERENCES \`streams\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`FK_stream_messages_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE RESTRICT
    ) ENGINE=InnoDB`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `stream_messages`');
  }
}
