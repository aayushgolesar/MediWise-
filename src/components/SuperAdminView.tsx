import React, { useState } from 'react';
import { TENANT_HUBS_SAMPLE } from '../data/mockData';
import { TenantHub } from '../types';
import { 
  Server, 
  Database, 
  ShieldCheck, 
  Activity, 
  Download, 
  Plus, 
  Layers, 
  Terminal, 
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const [tenants, setTenants] = useState<TenantHub[]>(TENANT_HUBS_SAMPLE);
  const [showProvisionModal, setShowProvisionModal] = useState<boolean>(false);
  const [newHubName, setNewHubName] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('Bengaluru');

  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName) return;

    const newTenant: TenantHub = {
      tenantId: `TNT-KA-${Math.floor(1000 + Math.random() * 9000)}`,
      hubName: newHubName,
      schemaName: `hub_${newHubName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      city: newCity,
      locality: 'Commercial District',
      dbLatencyMs: 12,
      activeOrders: 0,
      storageMb: 120,
      cdscoLicense: 'KA-B2-PROV-2026',
      status: 'Active'
    };

    setTenants([newTenant, ...tenants]);
    setNewHubName('');
    setShowProvisionModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
              POSTGRES MULTI-TENANT ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400">Schema-per-Tenant Isolation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-sans">
            Super Admin Console &bull; Operations Command
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-tenant database partitioning, distributed asynchronous worker daemons, and statutory DISHA telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Generating statutory DISHA & HIPAA compliance encrypted zip bundle...")}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export DISHA Bundle</span>
          </button>
          <button
            onClick={() => setShowProvisionModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Tenant Schema</span>
          </button>
        </div>
      </div>

      {/* Top 4 Infrastructure Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Managed Tenants</span>
            <Server className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">142 Hubs</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Health Score</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Active Escrow</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">₹48,92,450</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Locked in clearinghouse
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Postgres Schemas</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">142 Isolated</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero cross-tenant leakage
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Async Daemons</span>
            <Cpu className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-600 mt-2 font-mono">8 / 8 Online</div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Kafka / Celery Ingestion
          </div>
        </div>
      </div>

      {/* Multi-Tenant Schemas Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>PostgreSQL Multi-Tenant Schema Partition Registry</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">cluster-aws-ap-south-1</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Tenant ID</th>
                <th className="py-3 px-4">Hub Name &amp; Locality</th>
                <th className="py-3 px-4">Isolated PostgreSQL Schema</th>
                <th className="py-3 px-4">DB Latency</th>
                <th className="py-3 px-4">Storage</th>
                <th className="py-3 px-4">CDSCO License</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.tenantId} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.tenantId}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{t.hubName}</div>
                    <div className="text-[11px] text-slate-500">{t.locality}, {t.city}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-purple-700 bg-purple-50/50 rounded px-2 py-0.5 inline-block text-[11px] mt-2">
                    {t.schemaName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{t.dbLatencyMs} ms</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{t.storageMb} MB</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{t.cdscoLicense}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Schema Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Provision Isolated PostgreSQL Schema</h3>
            <p className="text-xs text-slate-500">
              Creates a dedicated Postgres schema with row-level encryption and DISHA audit triggers.
            </p>

            <form onSubmit={handleProvisionTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pharmacy Hub Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Trustwell Chemist Koramangala"
                  value={newHubName}
                  onChange={(e) => setNewHubName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City Jurisdiction</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Bengaluru">Bengaluru (Karnataka)</option>
                  <option value="Mumbai">Mumbai (Maharashtra)</option>
                  <option value="New Delhi">New Delhi (NCR)</option>
                  <option value="Hyderabad">Hyderabad (Telangana)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Execute Schema Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
