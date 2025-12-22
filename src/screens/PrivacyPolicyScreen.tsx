/**
 * Privacy Policy Screen - Displays the full privacy policy
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { CONTENT_BOTTOM_PADDING } from '../constants/layout';

export const PrivacyPolicyScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);

  const handleEmailPress = () => {
    Linking.openURL('mailto:gibberishtech@gmail.com');
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={dynamicStyles.pageTitle}>Privacy Policy for DharmaSaar</Text>
        <Text style={dynamicStyles.lastUpdated}>Last Updated: December 14, 2025</Text>

        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.paragraph}>
            <Text style={dynamicStyles.bold}>GibberishTech</Text> ("we," "our," or "us") operates the DharmaSaar mobile application (the "App"). We are committed to protecting your privacy and ensuring you understand how your information is collected, used, and safeguarded.
          </Text>

          <Text style={dynamicStyles.paragraph}>
            By using DharmaSaar, you agree to the collection and use of information in accordance with this policy.
          </Text>

          <Text style={dynamicStyles.heading2}>1. Information We Collect</Text>

          <Text style={dynamicStyles.heading3}>1.1 Personal Information</Text>
          <Text style={dynamicStyles.paragraph}>
            When you register or use our App, we may collect the following personally identifiable information:
          </Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>• Name</Text>
            <Text style={dynamicStyles.bulletItem}>• Email Address</Text>
            <Text style={dynamicStyles.bulletItem}>• Phone Number</Text>
          </View>

          <Text style={dynamicStyles.heading3}>1.2 Device Information</Text>
          <Text style={dynamicStyles.paragraph}>
            We collect specific device details to ensure App functionality and security:
          </Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>• Device ID (to manage your session and secure your account)</Text>
          </View>

          <Text style={dynamicStyles.heading3}>1.3 User Generated Content (Chat History)</Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>Chat Logs:</Text> We collect and store the text of your conversations with our AI chatbot.
            </Text>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>Purpose:</Text> This history is stored on our secure servers to allow you to review past conversations and is analyzed to improve the quality, accuracy, and safety of our AI chatbot's responses.
            </Text>
          </View>

          <Text style={dynamicStyles.heading3}>1.4 Religious Information</Text>
          <Text style={dynamicStyles.paragraph}>
            While DharmaSaar provides spiritual guidance, we do not require or collect specific information regarding your religious affiliation. The App is open to all users regardless of background.
          </Text>

          <Text style={dynamicStyles.heading2}>2. How We Use Your Information</Text>
          <Text style={dynamicStyles.paragraph}>
            We use the collected data for the following purposes:
          </Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>Service Delivery:</Text> To create your account, identify you, and provide the chat interface.
            </Text>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>AI Improvement:</Text> To analyze interactions with the chatbot to train and enhance our AI models and response quality.
            </Text>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>Notifications:</Text> To send you updates, daily shlokas, or important service announcements (subject to your permission).
            </Text>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>App Analytics:</Text> To understand how users interact with the App so we can improve the user experience.
            </Text>
          </View>

          <Text style={dynamicStyles.heading2}>3. Artificial Intelligence & Third-Party Processing</Text>

          <Text style={dynamicStyles.heading3}>3.1 AI Providers</Text>
          <Text style={dynamicStyles.paragraph}>
            Our chatbot utilizes advanced artificial intelligence models to provide responses. Currently, we use OpenAI as our primary AI provider.
          </Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>Data Sharing:</Text> Your chat inputs are sent to our AI provider for processing.
            </Text>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>Future Changes:</Text> We reserve the right to change AI providers or use different models in the future without prior notice, provided they adhere to similar security standards.
            </Text>
          </View>

          <Text style={dynamicStyles.heading3}>3.2 Analytics</Text>
          <Text style={dynamicStyles.paragraph}>
            We use Google Analytics to collect anonymous usage data (e.g., how long you use the app, which features are most popular). This helps us identify bugs and improve performance.
          </Text>

          <Text style={dynamicStyles.heading2}>4. Data Storage and Deletion</Text>
          <Text style={dynamicStyles.paragraph}>
            Your data is stored on secure servers. We provide you with control over your data as follows:
          </Text>

          <Text style={dynamicStyles.heading3}>4.1 Account Deletion (Hard Delete)</Text>
          <Text style={dynamicStyles.paragraph}>
            If you choose to Delete Your Account via the App settings:
          </Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>Your account details (Name, Email, Phone) are permanently removed.</Text>
            <Text style={dynamicStyles.bulletItem}>All your chat history is hard deleted (permanently erased) from our servers.</Text>
          </View>

          <Text style={dynamicStyles.heading3}>4.2 Chat Deletion (Soft Delete)</Text>
          <Text style={dynamicStyles.paragraph}>
            If you delete specific chat sessions or messages without deleting your account:
          </Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>The chats are removed from your device and view.</Text>
            <Text style={dynamicStyles.bulletItem}>These chats are soft deleted on our servers, meaning they may be retained for a specific period for internal analysis, AI training, or compliance purposes before being permanently purged.</Text>
          </View>

          <Text style={dynamicStyles.heading2}>5. App Permissions</Text>
          <Text style={dynamicStyles.paragraph}>
            To provide the full experience, DharmaSaar requests the following permission:
          </Text>
          <View style={dynamicStyles.bulletList}>
            <Text style={dynamicStyles.bulletItem}>
              <Text style={dynamicStyles.bold}>Notifications:</Text> Used to send you updates, quotes, or alerts. You can revoke this permission at any time in your device settings.
            </Text>
          </View>

          <Text style={dynamicStyles.heading2}>6. Children's Privacy</Text>
          <Text style={dynamicStyles.paragraph}>
            DharmaSaar is not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with Personal Information, we will take steps to delete such information.
          </Text>

          <Text style={dynamicStyles.heading2}>7. Security</Text>
          <Text style={dynamicStyles.paragraph}>
            We value your trust in providing us your Personal Information and strive to use commercially acceptable means of protecting it. However, remember that no method of transmission over the internet, or method of electronic storage, is 100% secure and reliable, and we cannot guarantee its absolute security.
          </Text>

          <Text style={dynamicStyles.heading2}>8. Changes to This Privacy Policy</Text>
          <Text style={dynamicStyles.paragraph}>
            We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted.
          </Text>

          <Text style={dynamicStyles.heading2}>9. Contact Us</Text>
          <Text style={dynamicStyles.paragraph}>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
          </Text>

          <View style={dynamicStyles.contactBox}>
            <Text style={dynamicStyles.contactText}>
              <Text style={dynamicStyles.bold}>Email:</Text>{' '}
              <Text style={dynamicStyles.link} onPress={handleEmailPress}>
                gibberishtech@gmail.com
              </Text>
            </Text>
            <Text style={dynamicStyles.contactText}>
              <Text style={dynamicStyles.bold}>Company:</Text> GibberishTech
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Math.max(insets.bottom, 20) + CONTENT_BOTTOM_PADDING,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.heading,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  lastUpdated: {
    fontSize: 14,
    color: theme.textTertiary,
    marginBottom: 24,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.text,
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.heading,
    marginTop: 24,
    marginBottom: 12,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.heading,
    marginTop: 16,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 16,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.text,
    marginBottom: 8,
    paddingLeft: 8,
  },
  bold: {
    fontWeight: '600',
    color: theme.text,
  },
  contactBox: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.text,
    marginBottom: 8,
  },
  link: {
    color: theme.primary,
    textDecorationLine: 'underline',
  },
});

