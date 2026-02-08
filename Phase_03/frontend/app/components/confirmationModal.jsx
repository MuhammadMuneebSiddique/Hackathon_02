import React from 'react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  taskDetails,
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch(type) {
      case 'danger':
        return {
          borderColor: 'border-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          confirmBtnBg: 'bg-red-500 hover:bg-red-600',
        };
      case 'info':
        return {
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          confirmBtnBg: 'bg-blue-500 hover:bg-blue-600',
        };
      default: // warning
        return {
          borderColor: 'border-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          confirmBtnBg: 'bg-orange-500 hover:bg-orange-600',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50">
      <div className={`bg-white rounded-2xl shadow-xl max-w-[30vw] w-full p-6 border-2 ${styles.borderColor}`}>
        <div className={`p-4 rounded-xl mb-4 ${styles.bgColor}`}>
          <h3 className={`text-lg font-semibold ${styles.textColor}`}>{title}</h3>
          <p className={`${styles.textColor} mt-2`}>{message}</p>

          {taskDetails && (
            <div className="mt-3 text-1xl">
              <div className="font-medium">Task Details:</div>
              <div className="truncate mt-1">{taskDetails.title}</div>
              {taskDetails.status && <div className="text-gray-600">Status: {taskDetails.status}</div>}
              {taskDetails.priority && <div className="text-gray-600">Priority: {taskDetails.priority}</div>}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-medium rounded-lg transition ${styles.confirmBtnBg}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;