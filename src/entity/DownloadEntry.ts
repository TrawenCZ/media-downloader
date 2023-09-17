import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class DownloadEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  fileName: string;

  @Column({ nullable: true })
  aliasName: string;

  @Column({ nullable: false, default: 0 })
  progress: number;

  @Column({ nullable: false, default: "N/A" })
  remainingTime: string;

  @Column({ nullable: true, default: false })
  isQueued: boolean;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;
}
