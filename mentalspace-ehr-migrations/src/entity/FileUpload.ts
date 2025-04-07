import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("file_uploads")
export class FileUpload {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    entity_type: string;

    @Column({ nullable: false })
    entity_id: string;

    @Column({ nullable: false })
    file_type: string;

    @Column({ nullable: false })
    original_filename: string;

    @Column({ nullable: false })
    file_path: string;

    @Column({ nullable: false })
    file_size: number;

    @Column({ nullable: false })
    mime_type: string;

    @Column({ nullable: true })
    uploaded_by: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
