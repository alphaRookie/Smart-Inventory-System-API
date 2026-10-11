import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function TaskScheduler() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ hour: '', minute: '', every_n_days: '' });

  const fetchSchedules = async () => {
    try {
      const res = await API.get('/inventory/task-scheduler');
      setSchedules(res.data);
    } catch {
      toast.error('Could not load automation settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleToggle = async (schedule) => {
    try {
      await API.patch(`/inventory/task-scheduler/${schedule.id}`, {
        enabled: !schedule.enabled,
      });
      toast.success(`${schedule.name} turned ${!schedule.enabled ? 'ON' : 'OFF'}`);
      fetchSchedules();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const startEditing = (schedule) => {
    setEditingId(schedule.id);
    setEditForm({
      hour: schedule.hour,
      minute: schedule.minute,
      every_n_days: schedule.day_of_month.replace('*/', ''), /* manually remove cron syntax */
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/inventory/task-scheduler/${editingId}`, {
        hour: Number(editForm.hour),
        minute: Number(editForm.minute),
        every_n_days: Number(editForm.every_n_days),
      });
      toast.success('Schedule updated!');
      setEditingId(null);
      fetchSchedules();
    } catch (e) {
      toast.error('Could not update schedule');
    }
  };

  if (loading) return <p className="text-xs text-gray-500">Loading...</p>;

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Automated Background Tasks</h2>
        <p className="text-sm text-gray-500 mt-1">You can schedule to automate running Batch Order Prediction and Spoilage Check.</p>
      </div>

      {schedules.map((s) => (
        <div key={s.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900 capitalize">
              {s.name}
            </span>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => handleToggle(s)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                s.enabled ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  s.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {editingId === s.id ? (
            /* Inline Edit View wrapped in simple form */
            <form 
              onSubmit={handleSaveEdit}
              className="space-y-3 pt-2 border-t border-gray-100"
            >
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500">Every N Days</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editForm.every_n_days}
                    onChange={(e) => setEditForm({ ...editForm, every_n_days: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500">Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    required
                    value={editForm.hour}
                    onChange={(e) => setEditForm({ ...editForm, hour: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500">Min (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    required
                    value={editForm.minute}
                    onChange={(e) => setEditForm({ ...editForm, minute: e.target.value })}
                    className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            /* Read-only Summary View */
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-600">
                Runs at <strong>{String(s.hour).padStart(2, '0')}:{String(s.minute).padStart(2, '0')}</strong> every <strong>{s.day_of_month.replace('*/', '')} day(s)</strong> 
              </p>
              <button
                type="button"
                onClick={() => startEditing(s)}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                Change Time
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
