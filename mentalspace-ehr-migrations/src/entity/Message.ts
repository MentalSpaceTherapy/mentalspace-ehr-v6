import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Staff } from "./Staff";
import { Client } from "./Client";
import { MessageThread } from "./MessageThread";

@Entity("messages")
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    thread_id: string;

    @ManyToOne(() => MessageThread)
    @JoinColumn({ name: "thread_id" })
    thread: MessageThread;

    @Column({ nullable: true })
    sender_staff_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "sender_staff_id" })
    sender_staff: Staff;

    @Column({ nullable: true })
    sender_client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "sender_client_id" })
    sender_client: Client;

    @Column({ type: "text", nullable: false })
    content: string;

    @Column({ type: "boolean", default: false })
    is_system_message: boolean;

    @Column({ type: "jsonb", nullable: true })
    attachments: object;

    @Column({ type: "enum", enum: ["text", "image", "file", "video"], default: "text" })
    message_type: string;

    @Column({ type: "boolean", default: false })
    is_encrypted: boolean;

    @Column({ type: "varchar", length: 255, nullable: true })
    encryption_key_id: string;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
