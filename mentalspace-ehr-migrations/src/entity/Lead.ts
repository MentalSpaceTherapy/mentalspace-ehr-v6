import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("leads")
export class Lead {
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

    @Column({ type: "enum", enum: ["new", "contacted", "qualified", "converted", "closed"], default: "new" })
    status: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    source: string;

    @Column({ nullable: true })
    assigned_to: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "assigned_to" })
    assigned_staff: Staff;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ type: "jsonb", nullable: true })
    custom_fields: object;

    @Column({ type: "date", nullable: true })
    follow_up_date: Date;

    @Column({ type: "varchar", length: 255, nullable: true })
    referral_source: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    service_interest: string;

    @Column({ type: "boolean", default: false })
    is_converted: boolean;

    @Column({ type: "uuid", nullable: true })
    converted_client_id: string;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
