import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { KnowledgeItem } from '../data/mockKnowledge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KnowledgeCardProps {
  item: KnowledgeItem;
}

// Simple icon components
const CategoryIcon: React.FC = () => (
  <View style={styles.categoryIcon}>
    <View style={[styles.iconDot, { left: 2, top: 2, width: 12, height: 12 }]} />
    <View style={[styles.iconDot, { left: 7.33, top: 2, width: 4, height: 4 }]} />
    <View style={[styles.iconDot, { left: 4.67, top: 4.67, width: 2.67, height: 2.67 }]} />
    <View style={[styles.iconDot, { left: 4.67, top: 10, width: 4, height: 4 }]} />
    <View style={[styles.iconDot, { left: 8.67, top: 8.67, width: 2.67, height: 2.67 }]} />
  </View>
);

const ChevronLeftIcon: React.FC = () => (
  <View style={styles.chevronIcon}>
    <View style={styles.chevronLeft} />
  </View>
);

const FontIcon: React.FC = () => (
  <View style={styles.fontIcon}>
    <View style={styles.fontShape} />
  </View>
);

const SaveIcon: React.FC = () => (
  <View style={styles.saveIcon}>
    <View style={styles.saveShape} />
  </View>
);

const MoreIcon: React.FC = () => (
  <View style={styles.moreIcon}>
    <View style={styles.moreDot} />
    <View style={[styles.moreDot, { top: 8 }]} />
    <View style={[styles.moreDot, { top: 16 }]} />
  </View>
);

const FacebookIcon: React.FC = () => (
  <View style={styles.socialIcon}>
    <View style={styles.facebookIcon}>
      <Text style={styles.facebookText}>f</Text>
    </View>
  </View>
);

const TwitterIcon: React.FC = () => (
  <View style={styles.socialIcon}>
    <View style={styles.twitterIcon}>
      <Text style={styles.twitterText}>𝕏</Text>
    </View>
  </View>
);

const LinkIcon: React.FC = () => (
  <View style={styles.socialIcon}>
    <View style={styles.linkIcon} />
  </View>
);

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = insets.top;

  return (
    <View style={styles.card} collapsable={false}>
      {/* Status Bar */}
      <View style={[styles.statusBar, { height: statusBarHeight || 48 }]}>
        <Text style={styles.statusBarTime}>9:41</Text>
        <View style={styles.batteryContainer}>
          <View style={styles.batteryOutline} />
          <View style={styles.batteryTip} />
          <View style={styles.batteryFill} />
        </View>
        <View style={styles.signalBar} />
      </View>

      {/* Navigation Bar */}
      <View style={[styles.navBar, { paddingTop: statusBarHeight || 56 }]}>
        <TouchableOpacity style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navActionButton}>
            <FontIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navActionButton}>
            <SaveIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navActionButton}>
            <MoreIcon />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        key={item.id}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: (statusBarHeight || 56) + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        {item.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Article Header */}
        <View style={styles.articleHeader}>
          {/* Category */}
          <View style={styles.categoryRow}>
            <CategoryIcon />
            <Text style={styles.categoryText}>
              {item.category?.toUpperCase() || 'TECHNOLOGY'}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Author/Source */}
          {item.source && (
            <Text style={styles.source}>
              {item.source}
              {item.author && ` — ${item.author}`}
            </Text>
          )}

          {/* Read Time & Date */}
          <Text style={styles.meta}>
            {item.readTime || '2 min read'} • {item.date || 'Jul 13, 2023, 12:31 PM GMT+5:30'}
          </Text>

          {/* Social Icons */}
          <View style={styles.socialIcons}>
            <TouchableOpacity>
              <FacebookIcon />
            </TouchableOpacity>
            <TouchableOpacity>
              <TwitterIcon />
            </TouchableOpacity>
            <TouchableOpacity>
              <LinkIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Article Body */}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>
            {item.bodyText || item.detailed_content || item.content}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Gradient Overlay */}
      <View style={styles.bottomGradient}>
        <View style={styles.gradientOverlay} />
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111111',
    position: 'relative',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    zIndex: 1000,
  },
  statusBarTime: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'SF Pro Text',
  },
  batteryContainer: {
    width: 27.4,
    height: 13,
    position: 'relative',
  },
  batteryOutline: {
    width: 25,
    height: 13,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  batteryTip: {
    width: 1.4,
    height: 4.22,
    position: 'absolute',
    right: 0,
    top: 4.39,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  batteryFill: {
    width: 21,
    height: 9,
    position: 'absolute',
    left: 2,
    top: 2,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  signalBar: {
    width: 18,
    height: 12,
    backgroundColor: 'white',
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.84)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    zIndex: 999,
  },
  backButton: {
    padding: 6,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  navActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 266,
    position: 'relative',
    backgroundColor: '#000',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  articleHeader: {
    width: SCREEN_WIDTH,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  iconDot: {
    position: 'absolute',
    borderWidth: 1.33,
    borderColor: '#BDA6F5',
    backgroundColor: 'transparent',
  },
  categoryText: {
    flex: 1,
    color: '#BDA6F5',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    lineHeight: 16.8,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  source: {
    color: '#B8B8B8',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16.8,
  },
  meta: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14.4,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  socialIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookIcon: {
    width: 8.46,
    height: 15.64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookText: {
    color: '#CFCFCF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  twitterIcon: {
    width: 16.37,
    height: 13.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twitterText: {
    color: '#CFCFCF',
    fontSize: 10,
  },
  linkIcon: {
    width: 13.33,
    height: 13.33,
    borderWidth: 1.5,
    borderColor: '#CFCFCF',
    borderRadius: 2,
  },
  bodyContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  bodyText: {
    color: '#B8B8B8',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    pointerEvents: 'none',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: '#111111',
    opacity: 0.8,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    position: 'absolute',
    left: (SCREEN_WIDTH - 134) / 2,
    top: 21,
    backgroundColor: '#E8E8E8',
    borderRadius: 100,
  },
  // Icon styles
  chevronIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'white',
  },
  fontIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontShape: {
    width: 19.65,
    height: 12.16,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  saveIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveShape: {
    width: 14,
    height: 18,
    borderWidth: 1.8,
    borderColor: 'white',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  moreIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  moreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    position: 'absolute',
    left: 10,
  },
});
