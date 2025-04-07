import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";
import { Client } from "./Client";
import { Message } from "./Message";
import { MessageThread } from "./MessageThread";

@Entity("message_notifications")
export class MessageNotification {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: true })
    staff_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "staff_id" })
    staff: Staff;

    @Column({ nullable: true })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({ nullable: false })
    message_id: string;

    @ManyToOne(() => Message)
    @JoinColumn({ name: "message_id" })
    message: Message;

    @Column({ nullable: false })
    thread_id: string;

    @ManyToOne(() => MessageThread)
    @JoinColumn({ name: "thread_id" })
    thread: MessageThread;

    @Column({ type: "boolean", default: false })
    is_read: boolean;

    @Column({ type: "timestamp", nullable: true })
    read_at: Date;

    @Column({ type: "enum", enum: ["email", "sms", "in_app", "push"], default: "in_app" })
    notification_type: string;

    @Column({ type: "boolean", default: false })
    is_delivered: boolean;

    @Column({ type: "timestamp", nullable: true })
    delivered_at: Date;

    @Column({ type: "jsonb", nullable: true })
    delivery_metadata: object;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
