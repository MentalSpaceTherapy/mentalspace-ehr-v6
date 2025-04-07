import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("supervision_relationships")
export class SupervisionRelationship {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    supervisor_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "supervisor_id" })
    supervisor: Staff;

    @Column({ nullable: false })
    supervisee_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "supervisee_id" })
    supervisee: Staff;

    @Column({ type: "date", nullable: false })
    start_date: Date;

    @Column({ type: "date", nullable: true })
    end_date: Date;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
