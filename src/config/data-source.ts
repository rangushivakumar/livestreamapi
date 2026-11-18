import { DataSourceOptions } from 'typeorm';
import { User } from '../entities/user/user.entity';
import { Otp } from '../entities/otp/otp.entity';
import { UserAuth } from 'src/entities/user/userAuth.entity';
import { UserSession } from 'src/entities/user/userSession.entity';
import { Stream } from '../streams/entities/stream.entity';
import { StreamMessage } from '../realtime/entities/stream-message.entity';
import { UserSubscriptionOrder } from 'src/entities/user/userSubscriptionOrder.entity';

require('dotenv').config();

const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const sync =
  process.env.DB_SYNC && process.env.DB_SYNC === 'true' ? true : false;

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  entities: [User, Otp, UserAuth, UserSession, Stream, StreamMessage, UserSubscriptionOrder],
  synchronize: sync,

  migrations: ['dist/config/migration/*.js'],
};

// const dataSource = new DataSource(dataSourceOptions);

// const initializeDataSource = async (
//   retries: number,
//   delay: number,
// ): Promise<void> => {
//   try {
//     await dataSource.initialize();
//     console.warn('Data Source has been initialized!');
//   } catch (err) {
//     console.error('Error during Data Source initialization', err);
//     if (retries > 0) {
//       console.log(
//         `Retrying in ${delay / 1000} seconds... (${retries} retries left)`,
//       );
//       await new Promise((resolve) => setTimeout(resolve, delay));
//       return initializeDataSource(retries - 1, delay);
//     } else {
//       console.error(
//         'Failed to initialize Data Source after multiple attempts.',
//       );
//     }
//   }
// };

// // const MAX_RETRIES = 5; // Number of retries
// // const RETRY_DELAY = 5000; // Delay between retries in milliseconds (5 seconds)

// // initializeDataSource(MAX_RETRIES, RETRY_DELAY);

// export const getDataSource = (delay = 3000): Promise<DataSource> => {
//   console.log(dataSource.isInitialized);
//   if (dataSource.isInitialized) return Promise.resolve(dataSource);
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (dataSource.isInitialized) resolve(dataSource);
//       else reject('Failed to create connection with database');
//     }, delay);
//   });
// };

// export default dataSource;
