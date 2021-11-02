import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Campaign extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

}
