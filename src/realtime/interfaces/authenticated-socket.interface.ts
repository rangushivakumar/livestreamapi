import { Socket } from 'socket.io';
import { User } from '../../entities/user/user.entity';

export type AuthenticatedSocket = Socket & { user: User };
