import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("contacts")
export class Contact {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    first_name: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    last_name: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    email: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    phone: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    organization: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    title: string;

    @Column({ type: "enum", enum: ["referral_source", "partner", "vendor", "other"], default: "other" })
    contact_type: string;

    @Column({ nullable: true })
    assigned_to: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "assigned_to" })
    assigned_staff: Staff;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ type: "jsonb", nullable: true })
    custom_fields: object;

    @Column({ type: "varchar", length: 255, nullable: true })
    address_line1: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    address_line2: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    city: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    state: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    postal_code: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    country: string;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
