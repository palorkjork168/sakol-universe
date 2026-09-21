import { Loader2, X } from "lucide-react";

interface CheckOutDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function CheckOutDialog({ onClose, onConfirm, isSubmitting }: CheckOutDialogProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem" }}>Check Out</h2>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Are you sure you want to end your work session?
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <p style={{ margin: 0, color: "var(--text-main)", fontSize: "0.875rem" }}>
            This will record your check-out time and duration. Your current location will be saved.
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 size={16} className="spinner" /> Checking out...</>
            ) : (
              "Check Out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
