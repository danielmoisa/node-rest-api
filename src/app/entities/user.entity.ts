// import { hashPassword } from '@foal/core';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from '.';

// export enum UserRole {
//   SUPERADMIN = 'superadmin',
//   ADMIN = 'admin',
//   CLIENT = 'client',
// }

@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column()
  password: string;

  // @Column({
  //   type: 'enum',
  //   enum: UserRole,
  //   default: UserRole.ADMIN
  // })
  // role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ unique: true })
  emailConfirmationCode: string;

  @OneToMany(() => Client, client => client.user)
  clients: Client[];

  // async setPassword(password: string) {
  //   this.password = await hashPassword(password);
  // }

}


export { DatabaseSession } from '@foal/typeorm';