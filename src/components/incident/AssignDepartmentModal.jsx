import React from "react";
import Modal from "../common/Modal";

export default function AssignDepartmentModal({ isOpen, onClose, incident, onAssign }) {
  if (!incident) return null;

  const departments = ["Road Maintenance Department", "Sanitation Department", "Electrical Department", "General Civic Operations"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Department — ${incident.id || incident.ticketId}`} size="md">
      <div className="space-y-3">
        {departments.map((department) => (
          <button
            key={department}
            type="button"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
            onClick={() => {
              onAssign?.(department);
              onClose();
            }}
          >
            {department}
          </button>
        ))}
      </div>
    </Modal>
  );
}
