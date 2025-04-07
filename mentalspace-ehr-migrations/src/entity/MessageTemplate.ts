import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("message_templates")
export class MessageTemplate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Column({ type: "text", nullable: false })
    content: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    category: string;

    @Column({ nullable: true })
    created_by: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "created_by" })
    creator: Staff;

    @Column({ type: "jsonb", nullable: true })
    variables: object;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    @Column({ type: "boolean", default: false })
    is_system_template: boolean;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
