import Database from 'better-sqlite3';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Medicine } from './models/Medicine.js';
import { PharmacyOffer } from './models/PharmacyOffer.js';
import { Order } from './models/Order.js';
import { Patient } from './models/Patient.js';
import { PrescriptionAudit } from './models/PrescriptionAudit.js';
import { AuditLog } from './models/AuditLog.js';
import { NoorModerationLog } from './models/NoorModerationLog.js';
import { Payment } from './models/Payment.js';
import { TaxInvoice } from './models/TaxInvoice.js';
import { QuarantineItem } from './models/QuarantineItem.js';
import { DisputeCase } from './models/DisputeCase.js';
import { ReassignmentTask } from './models/ReassignmentTask.js';
import { TenantHub } from './models/TenantHub.js';
import dotenv from 'dotenv';

dotenv.config();

interface SqliteRow {
  [key: string]: unknown;
}

/**
 * One-time migration script from SQLite to MongoDB Atlas
 * Run with: npx tsx src/migrate-sqlite-to-mongo.ts
 * 
 * IMPORTANT: Only run this once! Running multiple times will create duplicates
 * unless you manually drop the collections first.
 */
async function migrateSqliteToMongo() {
  console.log('🚀 Starting SQLite to MongoDB Atlas migration...\n');

  // Connect to SQLite database
  const sqliteDb = new Database('./mediwise.db');
  console.log('✅ Connected to SQLite database');

  // Connect to MongoDB Atlas
  await connectDB();
  console.log('✅ Connected to MongoDB Atlas\n');

  const stats = {
    users: 0,
    medicines: 0,
    pharmacy_offers: 0,
    orders: 0,
    patients: 0,
    prescription_audits: 0,
    audit_log: 0,
    noor_moderation_log: 0,
    payments: 0,
    tax_invoices: 0,
    quarantine_items: 0,
    dispute_cases: 0,
    reassignment_tasks: 0,
    tenant_hubs: 0,
    errors: 0,
  };

  try {
    // Migrate users
    console.log('📦 Migrating users...');
    const users = sqliteDb.prepare('SELECT * FROM users').all() as SqliteRow[];
    for (const user of users) {
      try {
        await User.create({
          _id: user.id as string,
          name: user.name as string,
          email: user.email as string,
          phone: user.phone as string,
          password_hash: user.password_hash as string,
          role: user.role as 'patient' | 'pharmacist' | 'admin' | 'oem',
          abha_id: user.abha_id as string || undefined,
          pharmacy_hub_name: user.pharmacy_hub_name as string || undefined,
          pharmacist_reg_no: user.pharmacist_reg_no as string || undefined,
          cdsco_license: user.cdsco_license as string || undefined,
          avatar_url: user.avatar_url as string || undefined,
          created_at: user.created_at as string || new Date().toISOString(),
        });
        stats.users++;
      } catch (error) {
        console.error(`Error migrating user ${user.id}:`, error);
        stats.errors++;
      }
    }

    // Migrate medicines
    console.log('📦 Migrating medicines...');
    const medicines = sqliteDb.prepare('SELECT * FROM medicines').all() as SqliteRow[];
    for (const med of medicines) {
      try {
        await Medicine.create({
          _id: med.id as string,
          brand_name: med.brand_name as string,
          generic_name: med.generic_name as string,
          strength: med.strength as string,
          dosage_form: med.dosage_form as string,
          therapeutic_category: med.therapeutic_category as string,
          category: med.category as string,
          schedule: med.schedule as string,
          mrp_reference: med.mrp_reference as number,
          starting_price: med.starting_price as number,
          discount_percent: med.discount_percent as number,
          cdsco_approved: Boolean(med.cdsco_approved),
          bioequivalent_verified: Boolean(med.bioequivalent_verified),
          bioequivalent_to: med.bioequivalent_to as string,
          in_stock: Boolean(med.in_stock),
          stock_count: med.stock_count as number,
          hub_count: med.hub_count as number,
          indications: JSON.parse(med.indications as string || '[]'),
          description: med.description as string,
          pack_options: JSON.parse(med.pack_options as string || '[]'),
        });
        stats.medicines++;
      } catch (error) {
        console.error(`Error migrating medicine ${med.id}:`, error);
        stats.errors++;
      }
    }

    // Migrate pharmacy offers
    console.log('📦 Migrating pharmacy offers...');
    const offers = sqliteDb.prepare('SELECT * FROM pharmacy_offers').all() as SqliteRow[];
    for (const offer of offers) {
      try {
        await PharmacyOffer.create({
          _id: offer.id as string,
          medicine_id: offer.medicine_id as string,
          pharmacy_name: offer.pharmacy_name as string,
          hub_id: offer.hub_id as string,
          locality: offer.locality as string,
          distance_km: offer.distance_km as number,
          sla_minutes: offer.sla_minutes as number,
          mrp: offer.mrp as number,
          discounted_price: offer.discounted_price as number,
          discount_percent: offer.discount_percent as number,
          in_stock: Boolean(offer.in_stock),
          stock_units: offer.stock_units as number,
          batch_number: offer.batch_number as string,
          expiry_date: offer.expiry_date as string,
          hologram_verified: Boolean(offer.hologram_verified),
          license_number: offer.license_number as string,
          rating: offer.rating as number,
          review_count: offer.review_count as number,
          savings: offer.savings as number,
          is_recommended: Boolean(offer.is_recommended),
        });
        stats.pharmacy_offers++;
      } catch (error) {
        console.error(`Error migrating pharmacy offer ${offer.id}:`, error);
        stats.errors++;
      }
    }

    // Migrate orders
    console.log('📦 Migrating orders...');
    const orders = sqliteDb.prepare('SELECT * FROM orders').all() as SqliteRow[];
    for (const order of orders) {
      try {
        await Order.create({
          _id: order.order_id as string,
          placed_time: order.placed_time as string,
          delivery_eta: order.delivery_eta as string,
          delivery_otp: order.delivery_otp as string,
          status: order.status as string,
          customer_name: order.customer_name as string,
          customer_address: order.customer_address as string,
          customer_phone: order.customer_phone as string,
          pharmacy_name: order.pharmacy_name as string,
          pharmacy_hub_id: order.pharmacy_hub_id as string,
          pharmacy_address: order.pharmacy_address as string || '',
          pharmacy_license: order.pharmacy_license as string || '',
          pharmacist_name: order.pharmacist_name as string || '',
          pharmacist_reg: order.pharmacist_reg as string || '',
          courier_name: order.courier_name as string || '',
          courier_phone: order.courier_phone as string || '',
          courier_rating: order.courier_rating as number || 0,
          vehicle_number: order.vehicle_number as string || '',
          cold_chain_verified: Boolean(order.cold_chain_verified),
          current_distance_km: order.current_distance_km as number || 0,
          medicine_name: order.medicine_name as string,
          composition: order.composition as string || '',
          pack_size: order.pack_size as number,
          batch_number: order.batch_number as string || '',
          seal_hash: order.seal_hash as string || '',
          price: order.price as number,
          item_total: order.item_total as number,
          packaging_tamper_fee: order.packaging_tamper_fee as number || 12,
          delivery_fee: order.delivery_fee as number || 15,
          platform_convenience: order.platform_convenience as number || 5,
          generic_savings: order.generic_savings as number || 0,
          total_paid: order.total_paid as number,
          escrow_status: order.escrow_status as string || 'Held in Escrow',
        });
        stats.orders++;
      } catch (error) {
        console.error(`Error migrating order ${order.order_id}:`, error);
        stats.errors++;
      }
    }

    // Migrate patients
    console.log('📦 Migrating patients...');
    const patients = sqliteDb.prepare('SELECT * FROM patients').all() as SqliteRow[];
    for (const patient of patients) {
      try {
        await Patient.create({
          _id: patient.id as string,
          user_id: patient.user_id as string,
          name: patient.name as string,
          age: patient.age as number,
          gender: patient.gender as string,
          relation: patient.relation as string,
          abha_id: patient.abha_id as string,
          phone: patient.phone as string,
        });
        stats.patients++;
      } catch (error) {
        console.error(`Error migrating patient ${patient.id}:`, error);
        stats.errors++;
      }
    }

    // Migrate prescription audits
    console.log('📦 Migrating prescription audits...');
    const rxAudits = sqliteDb.prepare('SELECT * FROM prescription_audits').all() as SqliteRow[];
    for (const rx of rxAudits) {
      try {
        await PrescriptionAudit.create({
          _id: rx.rx_id as string,
          order_id: rx.order_id as string || null,
          file_name: rx.file_name as string,
          upload_date: rx.upload_date as string,
          doctor_name: rx.doctor_name as string,
          doctor_reg_no: rx.doctor_reg_no as string,
          hospital_clinic: rx.hospital_clinic as string,
          prescribed_for: rx.prescribed_for as string,
          drug_name: rx.drug_name as string || '',
          dosage: rx.dosage as string,
          duration_days: rx.duration_days as number,
          frequency: rx.frequency as string,
          dispense_limit: rx.dispense_limit as number,
          ocr_verified: Boolean(rx.ocr_verified),
          needs_pharmacist_review: Boolean(rx.needs_pharmacist_review),
          confidence_json: rx.confidence_json as string || '{}',
          schedule_category: rx.schedule_category as string,
        });
        stats.prescription_audits++;
      } catch (error) {
        console.error(`Error migrating prescription audit ${rx.rx_id}:`, error);
        stats.errors++;
      }
    }

    // Migrate audit logs
    console.log('📦 Migrating audit logs...');
    const auditLogs = sqliteDb.prepare('SELECT * FROM audit_log').all() as SqliteRow[];
    for (const log of auditLogs) {
      try {
        await AuditLog.create({
          _id: log.id as string,
          event_type: log.event_type as string,
          entity_id: log.entity_id as string,
          actor_id: log.actor_id as string || null,
          metadata: log.metadata as string || '{}',
          created_at: log.created_at as string,
        });
        stats.audit_log++;
      } catch (error) {
        console.error(`Error migrating audit log ${log.id}:`, error);
        stats.errors++;
      }
    }

    // Migrate Noor moderation logs
    console.log('📦 Migrating Noor moderation logs...');
    const noorLogs = sqliteDb.prepare('SELECT * FROM noor_moderation_log').all() as SqliteRow[];
    for (const log of noorLogs) {
      try {
        await NoorModerationLog.create({
          _id: log.id as string,
          session_id: log.session_id as string,
          patient_name: log.patient_name as string,
          user_prompt: log.user_prompt as string,
          bot_response: log.bot_response as string,
          guardrail_fired: Boolean(log.guardrail_fired),
          risk_level: log.risk_level as string,
          created_at: log.created_at as string,
          reviewed: Boolean(log.reviewed),
        });
        stats.noor_moderation_log++;
      } catch (error) {
        console.error(`Error migrating Noor log ${log.id}:`, error);
        stats.errors++;
      }
    }

    // Migrate payments (if table exists)
    try {
      console.log('📦 Migrating payments...');
      const payments = sqliteDb.prepare('SELECT * FROM payments').all() as SqliteRow[];
      for (const payment of payments) {
        try {
          await Payment.create({
            _id: payment.id as string,
            gateway_order_id: payment.gateway_order_id as string,
            order_id: payment.order_id as string,
            amount: payment.amount as number,
            currency: payment.currency as string,
            status: payment.status as string,
            payment_method: payment.payment_method as string,
            gateway_payment_id: payment.gateway_payment_id as string || null,
            signature: payment.signature as string || null,
            created_at: payment.created_at as string,
            updated_at: payment.updated_at as string,
          });
          stats.payments++;
        } catch (error) {
          console.error(`Error migrating payment ${payment.id}:`, error);
          stats.errors++;
        }
      }
    } catch {
      console.log('⚠️  Payments table not found, skipping...');
    }

    // Migrate tax invoices (if table exists)
    try {
      console.log('📦 Migrating tax invoices...');
      const invoices = sqliteDb.prepare('SELECT * FROM tax_invoices').all() as SqliteRow[];
      for (const invoice of invoices) {
        try {
          await TaxInvoice.create({
            _id: invoice.invoice_number as string,
            order_id: invoice.order_id as string,
            invoice_date: invoice.invoice_date as string,
            buyer_name: invoice.buyer_name as string,
            buyer_address: invoice.buyer_address as string,
            seller_hub: invoice.seller_hub as string,
            seller_gstin: invoice.seller_gstin as string,
            seller_license: invoice.seller_license as string,
            hsn_sac_code: invoice.hsn_sac_code as string,
            item_total: invoice.item_total as number,
            platform_fee: invoice.platform_fee as number,
            cgst_rate: invoice.cgst_rate as number,
            cgst_amount: invoice.cgst_amount as number,
            sgst_rate: invoice.sgst_rate as number,
            sgst_amount: invoice.sgst_amount as number,
            grand_total: invoice.grand_total as number,
            created_at: invoice.created_at as string,
          });
          stats.tax_invoices++;
        } catch (error) {
          console.error(`Error migrating tax invoice ${invoice.invoice_number}:`, error);
          stats.errors++;
        }
      }
    } catch {
      console.log('⚠️  Tax invoices table not found, skipping...');
    }

    // Migrate other tables if they exist
    const optionalTables = [
      { table: 'quarantine_items', model: QuarantineItem, statsKey: 'quarantine_items' as keyof typeof stats },
      { table: 'dispute_cases', model: DisputeCase, statsKey: 'dispute_cases' as keyof typeof stats },
      { table: 'reassignment_tasks', model: ReassignmentTask, statsKey: 'reassignment_tasks' as keyof typeof stats },
      { table: 'tenant_hubs', model: TenantHub, statsKey: 'tenant_hubs' as keyof typeof stats },
    ];

    for (const { table, model, statsKey } of optionalTables) {
      try {
        console.log(`📦 Migrating ${table}...`);
        const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all() as SqliteRow[];
        for (const row of rows) {
          try {
            // Convert SQLite row to MongoDB document format
            const doc: any = {};
            for (const [key, value] of Object.entries(row)) {
              if (key === 'id' || key.endsWith('_id')) {
                doc._id = key === 'id' ? value : doc._id;
                if (key !== 'id') doc[key] = value;
              } else {
                doc[key] = value;
              }
            }
            
            await model.create(doc);
            (stats[statsKey] as number)++;
          } catch (error) {
            console.error(`Error migrating ${table} record:`, error);
            stats.errors++;
          }
        }
      } catch {
        console.log(`⚠️  ${table} table not found, skipping...`);
      }
    }

    sqliteDb.close();
    console.log('✅ SQLite database connection closed\n');

    // Print migration summary
    console.log('🎉 Migration completed! Summary:');
    console.log('=====================================');
    Object.entries(stats).forEach(([collection, count]) => {
      if (count > 0) {
        console.log(`📄 ${collection}: ${count} documents`);
      }
    });
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('=====================================\n');

    const totalDocuments = Object.entries(stats)
      .filter(([key]) => key !== 'errors')
      .reduce((sum, [, count]) => sum + count, 0);

    console.log(`✅ Successfully migrated ${totalDocuments} documents to MongoDB Atlas!`);
    
    if (stats.errors > 0) {
      console.log(`⚠️  ${stats.errors} errors occurred during migration. Check logs above.`);
      process.exitCode = 1;
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSqliteToMongo().catch(console.error);
}

export { migrateSqliteToMongo };