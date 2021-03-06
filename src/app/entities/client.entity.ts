import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Client extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  website: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, user => user.clients)
  user: User;
}
