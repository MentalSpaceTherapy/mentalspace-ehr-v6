import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Staff } from "./Staff";

@Entity("client_flags")
export class ClientFlag {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({
        type: "enum",
        enum: ["BILLING", "CLINICAL", "ADMINISTRATIVE", "CUSTOM"],
        nullable: false
    })
    flag_type: string;

    @Column({ nullable: false })
    flag_value: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ nullable: false })
    created_by: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "created_by" })
    creator: Staff;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
