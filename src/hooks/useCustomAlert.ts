/**
 * Hook for managing custom alert state
 */
import { useState, useCallback } from 'react';
import { AlertButton } from '../components/CustomAlert';

export interface AlertConfig {
  title: string;
  message: string;
  buttons?: AlertButton[];
  showCloseButton?: boolean;
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    // Clear config after animation
    setTimeout(() => {
      setAlertConfig(null);
    }, 300);
  }, []);

  return {
    alertConfig,
    visible,
    showAlert,
    hideAlert,
  };
};

