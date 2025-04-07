import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("locations")
export class Location {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    address_line1: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    address_line2: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    city: string;

    @Column({ type: "varchar", length: 100, nullable: false })
    state: string;

    @Column({ type: "varchar", length: 20, nullable: false })
    postal_code: string;

    @Column({ type: "varchar", length: 100, nullable: false, default: "United States" })
    country: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    phone: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    fax: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    email: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    @Column({ type: "jsonb", nullable: true })
    operating_hours: object;

    @Column({ type: "jsonb", nullable: true })
    services_offered: object;

    @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
    latitude: number;

    @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
    longitude: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    tax_id: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    npi: string;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
