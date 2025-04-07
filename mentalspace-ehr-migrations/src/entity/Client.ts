import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Staff } from "./Staff";
import { EmergencyContact } from "./EmergencyContact";

@Entity("clients")
export class Client {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    first_name: string;

    @Column({ nullable: false })
    last_name: string;

    @Column({ nullable: true })
    preferred_name: string;

    @Column({ type: "date", nullable: false })
    date_of_birth: Date;

    @Column({
        type: "enum",
        enum: ["MALE", "FEMALE", "OTHER", "NOT_SPECIFIED"],
        nullable: false
    })
    gender: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: false })
    address_line1: string;

    @Column({ nullable: true })
    address_line2: string;

    @Column({ nullable: false })
    city: string;

    @Column({ nullable: false })
    state: string;

    @Column({ nullable: false })
    postal_code: string;

    @Column({ default: "USA" })
    country: string;

    @Column({
        type: "enum",
        enum: ["ACTIVE", "INACTIVE", "WAITLIST"],
        default: "ACTIVE"
    })
    status: string;

    @Column({ nullable: true })
    assigned_therapist_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "assigned_therapist_id" })
    assigned_therapist: Staff;

    @Column({
        type: "enum",
        enum: ["NONE", "LOW", "MEDIUM", "HIGH"],
        default: "NONE"
    })
    risk_flag: string;

    // New fields for additional client information
    @Column({ nullable: true })
    primary_care_provider: string;

    @Column({ nullable: true })
    referral_source: string;

    @Column({ nullable: true })
    case_number: string;

    @Column({ default: false })
    court_mandated: boolean;

    @Column({ type: "text", nullable: true })
    court_mandated_notes: string;

    // Relationship with emergency contacts
    @OneToMany(() => EmergencyContact, emergencyContact => emergencyContact.client)
    emergency_contacts: EmergencyContact[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;
}
