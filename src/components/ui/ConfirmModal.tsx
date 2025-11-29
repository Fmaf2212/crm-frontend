interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm
}: ConfirmModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-6 relative">

        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-2">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="border px-4 py-2 rounded-xl"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
