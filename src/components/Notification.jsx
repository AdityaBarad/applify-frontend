import { useEffect, useState } from 'react';
import { FiX, FiInfo, FiCheck, FiAlertTriangle } from 'react-icons/fi';

/**
 * A notification component for displaying messages to the user
 * @param {Object} props Component props
 * @param {string} props.type Notification type (success, error, info, warning)
 * @param {string} props.message Notification message
 * @param {boolean} props.show Whether to show the notification
 * @param {Function} props.onClose Function to call when notification is closed
 * @param {number} props.duration Duration in ms to show the notification (default: 5000, 0 for persistent)
 */
function Notification({ type = 'info', message, show, onClose, duration = 5000 }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    
    let timer;
    // Auto-dismiss if duration > 0
    if (show && duration > 0) {
      timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: <FiCheck className="h-5 w-5 text-green-500" />,
    error: <FiInfo className="h-5 w-5 text-red-500" />,
    info: <FiInfo className="h-5 w-5 text-blue-500" />,
    warning: <FiAlertTriangle className="h-5 w-5 text-yellow-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800'
  };

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-md shadow-md border p-4 max-w-md transition-all duration-300 ${bgColors[type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className={`ml-3 ${textColors[type]}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md p-1.5 ${textColors[type]} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type}-50 focus:ring-${type}-500`}
            >
              <span className="sr-only">Dismiss</span>
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notification;
