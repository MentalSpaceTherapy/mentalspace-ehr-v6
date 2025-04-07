import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";
import { NoteType } from "./Note";

@Entity("note_templates")
export class NoteTemplate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column({
        type: "enum",
        enum: NoteType,
        nullable: false
    })
    template_type: NoteType;

    @Column({ type: "text", nullable: false })
    content: string;

    @Column({ type: "jsonb", nullable: true })
    structured_content: object;

    @Column({ nullable: false })
    created_by: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "created_by" })
    creator: Staff;

    @Column({ default: true })
    is_active: boolean;

    @Column({ default: false })
    is_global: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
