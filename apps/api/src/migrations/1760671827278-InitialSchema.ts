import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760671827278 implements MigrationInterface {
    name = 'InitialSchema1760671827278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'TENANT_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'PHARMACIST', 'RECEPTIONIST', 'ACCOUNTANT', 'PATIENT', 'USER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "tenant_id" uuid NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(255), "password_hash" character varying(255) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "middle_name" character varying(100), "role" "public"."users_role_enum" NOT NULL DEFAULT 'PATIENT', "custom_permissions" text, "is_active" boolean NOT NULL DEFAULT true, "is_email_verified" boolean NOT NULL DEFAULT false, "is_phone_verified" boolean NOT NULL DEFAULT false, "is_2fa_enabled" boolean NOT NULL DEFAULT false, "two_fa_secret" character varying(255), "last_login_at" TIMESTAMP, "last_login_ip" character varying(100), "failed_login_attempts" integer NOT NULL DEFAULT '0', "locked_until" TIMESTAMP, "reset_password_token" character varying(255), "reset_password_expires" TIMESTAMP, "email_verification_token" character varying(255), "email_verification_expires" TIMESTAMP, "metadata" jsonb, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON "users" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e9f4c2efab52114c4e99e28efb" ON "users" ("email", "tenant_id") `);
        await queryRunner.query(`CREATE TYPE "public"."tenants_type_enum" AS ENUM('hospital', 'clinic', 'diagnostic_center', 'pharmacy', 'laboratory')`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_status_enum" AS ENUM('active', 'inactive', 'suspended', 'trial', 'pending')`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_subscription_plan_enum" AS ENUM('free', 'basic', 'professional', 'enterprise')`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "name" character varying(255) NOT NULL, "slug" character varying(100) NOT NULL, "type" "public"."tenants_type_enum" NOT NULL DEFAULT 'clinic', "status" "public"."tenants_status_enum" NOT NULL DEFAULT 'pending', "subscription_plan" "public"."tenants_subscription_plan_enum" NOT NULL DEFAULT 'free', "subscription_start_date" TIMESTAMP, "subscription_end_date" TIMESTAMP, "trial_ends_at" TIMESTAMP, "email" character varying(255), "phone" character varying(50), "website" character varying(255), "address_line1" text, "address_line2" text, "city" character varying(100), "state" character varying(100), "postal_code" character varying(20), "country" character varying(100), "license_number" character varying(255), "registration_number" character varying(255), "tax_id" character varying(100), "settings" jsonb, "logo_url" character varying(500), "primary_color" character varying(7), "secondary_color" character varying(7), "billing_email" character varying(255), "stripe_customer_id" character varying(255), "stripe_subscription_id" character varying(255), "metadata" jsonb, CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name"), CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32731f181236a46182a38c992a" ON "tenants" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_2310ecc5cb8be427097154b18f" ON "tenants" ("slug") `);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'login_failed', 'password_change', 'password_reset', 'export', 'print', 'share', 'approve', 'reject', 'sign')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_entity_type_enum" AS ENUM('user', 'patient', 'appointment', 'medical_record', 'prescription', 'lab_order', 'lab_result', 'billing', 'invoice', 'payment', 'inventory', 'medication', 'tenant', 'setting')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "tenant_id" uuid NOT NULL, "user_id" uuid NOT NULL, "user_email" character varying(255) NOT NULL, "user_role" character varying(100) NOT NULL, "action" "public"."audit_logs_action_enum" NOT NULL, "entity_type" "public"."audit_logs_entity_type_enum" NOT NULL, "entity_id" character varying(255), "description" text, "method" character varying(10), "endpoint" text, "status_code" integer, "ip_address" character varying(100), "user_agent" text, "device" character varying(100), "browser" character varying(100), "location" character varying(100), "old_values" jsonb, "new_values" jsonb, "metadata" jsonb, "is_sensitive" boolean NOT NULL DEFAULT false, "is_suspicious" boolean NOT NULL DEFAULT false, "requires_review" boolean NOT NULL DEFAULT false, "duration_ms" integer, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6f18d459490bb48923b1f40bdb" ON "audit_logs" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON "audit_logs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_ea9ba3dfb39050f831ee3be40d" ON "audit_logs" ("entity_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_8e5e23ee6fccba37f99df331d1" ON "audit_logs" ("ip_address") `);
        await queryRunner.query(`CREATE INDEX "IDX_7421efc125d95e413657efa3c6" ON "audit_logs" ("entity_type", "entity_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f68e345c05e8166ff9deea1ab" ON "audit_logs" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_898d14750b88319b89b1ab66cd" ON "audit_logs" ("tenant_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_898d14750b88319b89b1ab66cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f68e345c05e8166ff9deea1ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7421efc125d95e413657efa3c6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e5e23ee6fccba37f99df331d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea9ba3dfb39050f831ee3be40d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd2726fd31b35443f2245b93ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f18d459490bb48923b1f40bdb"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_entity_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2310ecc5cb8be427097154b18f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32731f181236a46182a38c992a"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_subscription_plan_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e9f4c2efab52114c4e99e28efb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_109638590074998bb72a2f2cf0"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
