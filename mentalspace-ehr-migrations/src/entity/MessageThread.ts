import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Staff } from "./Staff";
import { Client } from "./Client";
import { Message } from "./Message";

@Entity("message_threads")
export class MessageThread {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    subject: string;

    @Column({ type: "enum", enum: ["individual", "group"], default: "individual" })
    thread_type: string;

    @Column({ type: "boolean", default: false })
    is_secure: boolean;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    @Column({ type: "jsonb", nullable: true })
    metadata: object;

    @Column({ type: "uuid", array: true, nullable: true })
    staff_participants: string[];

    @Column({ type: "uuid", array: true, nullable: true })
    client_participants: string[];

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @OneToMany(() => Message, message => message.thread)
    messages: Message[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
