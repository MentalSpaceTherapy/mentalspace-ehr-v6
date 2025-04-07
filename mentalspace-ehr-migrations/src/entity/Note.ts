import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Client } from "./Client";
import { Staff } from "./Staff";

export enum NoteType {
    INTAKE = "INTAKE",
    PROGRESS = "PROGRESS",
    DISCHARGE = "DISCHARGE",
    TREATMENT_PLAN = "TREATMENT_PLAN",
    ASSESSMENT = "ASSESSMENT",
    CANCELLATION = "CANCELLATION",
    CONTACT = "CONTACT",
    OTHER = "OTHER"
}

export enum NoteStatus {
    DRAFT = "DRAFT",
    COMPLETED = "COMPLETED",
    SIGNED = "SIGNED",
    LOCKED = "LOCKED"
}

export enum SupervisionStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

@Entity("notes")
export class Note {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({ nullable: false })
    provider_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "provider_id" })
    provider: Staff;

    @Column({ nullable: true })
    appointment_id: string;

    @Column({
        type: "enum",
        enum: NoteType,
        nullable: false
    })
    note_type: NoteType;

    @Column({ type: "text", nullable: false })
    content: string;

    @Column({ type: "jsonb", nullable: true })
    structured_content: object;

    @Column({ nullable: true })
    template_id: string;

    @Column({
        type: "enum",
        enum: NoteStatus,
        default: NoteStatus.DRAFT
    })
    status: NoteStatus;

    @Column({ nullable: true })
    signed_by: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "signed_by" })
    signer: Staff;

    @Column({ type: "timestamp", nullable: true })
    signed_at: Date;

    @Column({ nullable: true })
    supervisor_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "supervisor_id" })
    supervisor: Staff;

    @Column({
        type: "enum",
        enum: SupervisionStatus,
        nullable: true
    })
    supervision_status: SupervisionStatus;

    @Column({ type: "timestamp", nullable: true })
    supervision_date: Date;

    @Column({ type: "text", nullable: true })
    supervision_comments: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
