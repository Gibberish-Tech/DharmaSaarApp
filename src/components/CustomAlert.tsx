/**
 * Custom Alert Dialog Component - Matches DharmaSaar branding
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  showCloseButton?: boolean;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [],
  onDismiss,
  showCloseButton = true,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const defaultButtons: AlertButton[] = buttons.length > 0 
    ? buttons 
    : [{ text: 'OK', onPress: handleDismiss, style: 'default' }];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={dynamicStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={dynamicStyles.alertContainer}>
              {/* Header */}
              <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.title}>{title}</Text>
                {showCloseButton && (
                  <TouchableOpacity
                    style={dynamicStyles.closeButton}
                    onPress={handleDismiss}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Close alert"
                  >
                    <Text style={dynamicStyles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Message */}
              <ScrollView 
                style={dynamicStyles.messageContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={dynamicStyles.message}>{message}</Text>
              </ScrollView>

              {/* Buttons */}
              <View style={dynamicStyles.buttonContainer}>
                {defaultButtons.map((button, index) => {
                  const isDestructive = button.style === 'destructive';
                  const isCancel = button.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        dynamicStyles.button,
                        isDestructive && dynamicStyles.destructiveButton,
                        isCancel && dynamicStyles.cancelButton,
                        dynamicStyles.buttonFullWidth,
                      ]}
                      onPress={() => {
                        if (button.onPress) {
                          button.onPress();
                        }
                        if (!isCancel) {
                          handleDismiss();
                        }
                      }}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={button.text}
                    >
                      <Text
                        style={[
                          dynamicStyles.buttonText,
                          isDestructive && dynamicStyles.destructiveButtonText,
                          isCancel && dynamicStyles.cancelButtonText,
                        ]}
                        numberOfLines={2}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.75}
                      >
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.heading,
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: theme.background,
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.textSecondary,
    fontWeight: '300',
  },
  messageContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.text,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'column',
    padding: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  button: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonWithSpacing: {
    marginBottom: 0,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelButtonText: {
    color: theme.text,
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});

