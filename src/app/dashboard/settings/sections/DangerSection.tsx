"use client";
import { useState } from 'react';
import { AlertTriangle, Trash2, Unplug, RotateCcw } from 'lucide-react';

function DangerRow({ icon: Icon, title, desc, actionLabel, variant = 'default', onAction }: {
  icon: any; title: string; desc: string; actionLabel: string; variant?: 'default' | 'destructive'; onAction: () => void;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-red-100 last:border-0">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111111]">{title}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5 max-w-md">{desc}</p>
        </div>
      </div>
      <button onClick={onAction}
        className={`ml-6 flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
          variant === 'destructive'
            ? 'border-red-400 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'
            : 'border-red-300 text-red-500 hover:bg-red-50'
        }`}>
        {actionLabel}
      </button>
    </div>
  );
}

export default function DangerSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = confirmText === 'disconnect';

  const handleDisconnect = () => {
    if (canConfirm) {
      fetch('/api/settings', { method: 'DELETE' }).then(() => window.location.reload());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111111]">Danger Zone</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">Irreversible actions. These cannot be undone — proceed with caution.</p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-red-700">Actions in this section can interrupt your store connection and result in data loss. Make sure you understand the consequences before proceeding.</p>
      </div>

      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <DangerRow icon={RotateCcw} title="Clear Cached Data"
          desc="Removes all in-memory cached responses. Live data will re-fetch from Shopify on the next page load. No data is permanently deleted."
          actionLabel="Clear Cache"
          onAction={() => alert('Cache cleared.')} />
        <DangerRow icon={Unplug} title="Disconnect Shopify Store"
          desc="Revokes Cora's access token and removes the store connection. Your Shopify store and its data are not affected. You can reconnect at any time."
          actionLabel="Disconnect Store"
          onAction={() => setShowConfirm(true)} />
        <DangerRow icon={Trash2} title="Delete All Cora Data"
          desc="Permanently deletes all customer segments, persona assignments, and sync history from Cora. This cannot be undone."
          actionLabel="Delete Data"
          variant="destructive"
          onAction={() => alert('Contact support to delete all data.')} />
      </div>

      {showConfirm && (
        <div className="bg-white rounded-xl border border-red-300 p-6">
          <p className="text-sm font-bold text-red-700 mb-1">Confirm Store Disconnection</p>
          <p className="text-xs text-[#6B7280] mb-4">
            Type <code className="font-mono font-bold text-red-600">disconnect</code> below to confirm you want to remove the Shopify store connection.
          </p>
          <div className="flex gap-2">
            <input type="text" placeholder="disconnect" value={confirmText} onChange={e => setConfirmText(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 font-mono" />
            <button onClick={handleDisconnect} disabled={!canConfirm}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors">
              Confirm Disconnect
            </button>
            <button onClick={() => { setShowConfirm(false); setConfirmText(''); }}
              className="px-4 py-2 border border-[#E5E7EB] text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
