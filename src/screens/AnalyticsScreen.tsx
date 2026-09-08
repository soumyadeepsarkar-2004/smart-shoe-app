import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { typography, spacing, radius, useTheme, ThemePalette } from '@/theme';
import GlassCard from '@/components/GlassCard';
import PressableButton from '@/components/PressableButton';
import SegmentedControl from '@/components/SegmentedControl';
import { useDevice } from '@/store/DeviceProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useStepHistory } from '@/hooks/useStepHistory';
import { hapticFeedback } from '@/utils/haptics';

type ActivityFilter = 'all' | 'running' | 'walking';

interface ActivitySession {
  id: string;
  title: string;
  type: 'running' | 'walking';
  date: string;
  durationMin: number;
  steps: number;
  energyWh: number;
  avgCadenceSpm: number;
  impactDistribution: {
    heel: number;
    midfoot: number;
    forefoot: number;
  };
}

const SESSIONS: ActivitySession[] = [
  {
    id: 'sess-1',
    title: 'Morning Power Run',
    type: 'running',
    date: 'Today, 07:15 AM',
    durationMin: 34,
    steps: 4210,
    energyWh: 0.38,
    avgCadenceSpm: 164,
    impactDistribution: { heel: 24, midfoot: 48, forefoot: 28 },
  },
  {
    id: 'sess-2',
    title: 'Commute Stride Walk',
    type: 'walking',
    date: 'Yesterday, 05:40 PM',
    durationMin: 22,
    steps: 2480,
    energyWh: 0.19,
    avgCadenceSpm: 112,
    impactDistribution: { heel: 42, midfoot: 38, forefoot: 20 },
  },
  {
    id: 'sess-3',
    title: 'Interval Sprint Track',
    type: 'running',
    date: 'Sep 7, 06:30 PM',
    durationMin: 45,
    steps: 6150,
    energyWh: 0.54,
    avgCadenceSpm: 172,
    impactDistribution: { heel: 18, midfoot: 52, forefoot: 30 },
  },
  {
    id: 'sess-4',
    title: 'Campus Walk & Harvest',
    type: 'walking',
    date: 'Sep 6, 02:15 PM',
    durationMin: 18,
    steps: 1980,
    energyWh: 0.16,
    avgCadenceSpm: 108,
    impactDistribution: { heel: 40, midfoot: 42, forefoot: 18 },
  },
];

export default function AnalyticsScreen() {
  const { state } = useDevice();
  const { toggles, weightKg } = useSettings();
  const { records } = useStepHistory();
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(SESSIONS[0].id);

  const filteredSessions = useMemo(() => {
    if (filter === 'all') return SESSIONS;
    return SESSIONS.filter((s) => s.type === filter);
  }, [filter]);

  const activeSession = useMemo(() => {
    return SESSIONS.find((s) => s.id === selectedSessionId) ?? SESSIONS[0];
  }, [selectedSessionId]);

  // Aggregate stats across all workouts
  const totalLifetimeEnergyWh = useMemo(() => {
    const fromHistory = records.reduce((acc, r) => acc + r.energyWh, 0);
    return (fromHistory + state.battery.energyWh).toFixed(2);
  }, [records, state.battery.energyWh]);

  const totalLifetimeKm = useMemo(() => {
    const totalSteps = records.reduce((acc, r) => acc + r.steps, 0) + state.stepCount;
    return (totalSteps * 0.00078).toFixed(1);
  }, [records, state.stepCount]);

  const totalCarbonOffsetGrams = useMemo(() => {
    // Approx 475g CO2 per kWh grid generation
    const kwh = parseFloat(totalLifetimeEnergyWh) / 1000;
    return Math.round(kwh * 475 * 10) / 10;
  }, [totalLifetimeEnergyWh]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerTop}>
        <View style={styles.brandIconWrap}>
          <FontAwesome5 name="chart-line" size={20} color={palette.brand.volt} />
        </View>
        <View style={styles.headerTitleBlock}>
          <Text style={[typography.displayLgMobile as any, styles.title]}>
            Analytics
          </Text>
          <Text style={[typography.labelSm as any, styles.headerSubtitle]}>
            STRIDE BIOMECHANICS & ECO HARVEST
          </Text>
        </View>
      </View>

      {/* Lifetime Eco-Harvest & Kinetic Power */}
      <GlassCard title="Eco-Harvest Impact" elevated>
        <View style={styles.ecoBannerRow}>
          <View style={styles.ecoIconBox}>
            <FontAwesome5 name="leaf" size={20} color={palette.brand.volt} />
          </View>
          <View style={styles.ecoTitleCol}>
            <Text style={[typography.headlineSm as any, styles.ecoTitle]}>
              Self-Generated Clean Power
            </Text>
            <Text style={[typography.bodySm as any, styles.ecoSub]}>
              Harvested straight from your natural foot compression.
            </Text>
          </View>
        </View>

        <View style={styles.ecoStatsGrid}>
          <View style={styles.ecoStatChip}>
            <Text style={[typography.labelSm as any, styles.ecoStatLabel]}>TOTAL CLEAN ENERGY</Text>
            <View style={styles.statValRow}>
              <Text style={[typography.metricMd as any, styles.ecoStatVal]}>{totalLifetimeEnergyWh}</Text>
              <Text style={[typography.labelSm as any, styles.ecoStatUnit]}>Wh</Text>
            </View>
          </View>
          <View style={styles.ecoStatChip}>
            <Text style={[typography.labelSm as any, styles.ecoStatLabel]}>LIFETIME DISTANCE</Text>
            <View style={styles.statValRow}>
              <Text style={[typography.metricMd as any, styles.ecoStatVal]}>{totalLifetimeKm}</Text>
              <Text style={[typography.labelSm as any, styles.ecoStatUnit]}>km</Text>
            </View>
          </View>
          <View style={styles.ecoStatChip}>
            <Text style={[typography.labelSm as any, styles.ecoStatLabel]}>CO₂ OFFSET</Text>
            <View style={styles.statValRow}>
              <Text style={[typography.metricMd as any, { color: palette.brand.volt, fontSize: 16 }]}>
                {totalCarbonOffsetGrams}
              </Text>
              <Text style={[typography.labelSm as any, styles.ecoStatUnit]}>g</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Stride Biomechanics & Foot Strike Zone */}
      <GlassCard title="Foot Strike Biomechanics">
        <View style={styles.strikeCardHeader}>
          <View>
            <Text style={[typography.headlineSm as any, styles.strikeTitle]}>
              Sole Pressure Distribution
            </Text>
            <Text style={[typography.bodySm as any, styles.strikeSub]}>
              Derived from {activeSession.title} · Avg {activeSession.avgCadenceSpm} SPM
            </Text>
          </View>
          <View style={styles.piezoActiveBadge}>
            <Text style={[typography.labelSm as any, styles.piezoActiveText]}>OPTIMAL CADENCE</Text>
          </View>
        </View>

        {/* Visual foot zones */}
        <View style={styles.strikeVisualContainer}>
          <View style={styles.footZoneCol}>
            <View style={styles.footZoneHeader}>
              <Text style={[typography.labelSm as any, styles.footZoneName]}>FOREFOOT</Text>
              <Text style={[typography.labelSm as any, styles.footZonePercent]}>
                {activeSession.impactDistribution.forefoot}%
              </Text>
            </View>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${activeSession.impactDistribution.forefoot}%`,
                    backgroundColor: palette.brand.cyan,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.footZoneCol}>
            <View style={styles.footZoneHeader}>
              <Text style={[typography.labelSm as any, styles.footZoneName]}>MIDFOOT (PEAK HARVEST)</Text>
              <Text style={[typography.labelSm as any, styles.footZonePercent]}>
                {activeSession.impactDistribution.midfoot}%
              </Text>
            </View>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${activeSession.impactDistribution.midfoot}%`,
                    backgroundColor: palette.brand.volt,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.footZoneCol}>
            <View style={styles.footZoneHeader}>
              <Text style={[typography.labelSm as any, styles.footZoneName]}>HEEL STRIKE</Text>
              <Text style={[typography.labelSm as any, styles.footZonePercent]}>
                {activeSession.impactDistribution.heel}%
              </Text>
            </View>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${activeSession.impactDistribution.heel}%`,
                    backgroundColor: palette.outline,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.biomechInsightBox}>
          <FontAwesome5 name="info-circle" size={14} color={palette.brand.cyan} />
          <Text style={[typography.bodySm as any, styles.biomechInsightText]}>
            Midfoot landing delivers 38% higher kinetic charge yield while reducing joint impact stress.
          </Text>
        </View>
      </GlassCard>

      {/* Gait Dynamics & Stride Efficiency */}
      <GlassCard title="Gait Dynamics & Stride Efficiency">
        <View style={styles.dynamicsGrid}>
          <View style={styles.dynamicsChip}>
            <Text style={[typography.labelSm as any, styles.dynamicsLabel]}>GROUND CONTACT</Text>
            <View style={styles.statValRow}>
              <Text style={[typography.metricMd as any, styles.dynamicsVal]}>238</Text>
              <Text style={[typography.labelSm as any, styles.dynamicsUnit]}>ms</Text>
            </View>
            <Text style={[typography.bodySm as any, styles.dynamicsRating]}>Elite elasticity</Text>
          </View>
          <View style={styles.dynamicsChip}>
            <Text style={[typography.labelSm as any, styles.dynamicsLabel]}>VERT OSCILLATION</Text>
            <View style={styles.statValRow}>
              <Text style={[typography.metricMd as any, styles.dynamicsVal]}>7.2</Text>
              <Text style={[typography.labelSm as any, styles.dynamicsUnit]}>cm</Text>
            </View>
            <Text style={[typography.bodySm as any, styles.dynamicsRating]}>Optimal forward</Text>
          </View>
          <View style={styles.dynamicsChip}>
            <Text style={[typography.labelSm as any, styles.dynamicsLabel]}>PRONATION TILT</Text>
            <View style={styles.statValRow}>
              <Text style={[typography.metricMd as any, { color: palette.brand.volt, fontSize: 15 }]}>-2.1°</Text>
            </View>
            <Text style={[typography.bodySm as any, styles.dynamicsRating]}>Neutral arch</Text>
          </View>
        </View>

        <View style={styles.efficiencyCard}>
          <View style={styles.efficiencyHeader}>
            <Text style={[typography.bodyMd as any, styles.efficiencyTitle]}>Kinetic Harvest Efficiency</Text>
            <Text style={[typography.metricMd as any, styles.efficiencyScore]}>94 / 100</Text>
          </View>
          <View style={styles.efficiencyTrack}>
            <View style={[styles.efficiencyFill, { width: '94%', backgroundColor: palette.brand.volt }]} />
          </View>
          <Text style={[typography.bodySm as any, styles.efficiencySub]}>
            High energy recapture rate with minimal kinetic damping loss.
          </Text>
        </View>
      </GlassCard>

      {/* Activity Sessions Log */}
      <GlassCard title="Activity Sessions">
        <SegmentedControl<ActivityFilter>
          options={[
            { label: 'All', value: 'all' },
            { label: 'Running', value: 'running' },
            { label: 'Walking', value: 'walking' },
          ]}
          value={filter}
          onChange={(f) => {
            hapticFeedback(toggles, 'light');
            setFilter(f);
          }}
        />

        <View style={styles.sessionList}>
          {filteredSessions.map((session) => {
            const isSelected = session.id === selectedSessionId;
            return (
              <TouchableOpacity
                key={session.id}
                style={[styles.sessionItem, isSelected && styles.sessionItemSelected]}
                onPress={() => {
                  hapticFeedback(toggles, 'light');
                  setSelectedSessionId(session.id);
                }}
                accessibilityRole="button"
              >
                <View style={[styles.sessionIcon, isSelected && styles.sessionIconSelected]}>
                  <FontAwesome5
                    name={session.type === 'running' ? 'running' : 'walking'}
                    size={16}
                    color={isSelected ? palette.brand.volt : palette.outline}
                  />
                </View>
                <View style={styles.sessionMeta}>
                  <Text style={[typography.bodyLg as any, styles.sessionTitle]}>
                    {session.title}
                  </Text>
                  <Text style={[typography.bodySm as any, styles.sessionDate]}>
                    {session.date} · {session.durationMin} mins
                  </Text>
                </View>
                <View style={styles.sessionStatsCol}>
                  <Text style={[typography.metricMd as any, styles.sessionSteps]}>
                    {session.steps.toLocaleString()}
                  </Text>
                  <Text style={[typography.labelSm as any, styles.sessionEnergy]}>
                    +{session.energyWh.toFixed(2)} Wh
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.exportActionRow}>
          <PressableButton
            title="Export Biometric Dataset (JSON)"
            variant="glass"
            onPress={() => {
              hapticFeedback(toggles, 'success');
              Alert.alert(
                'Dataset Export Ready ⚡',
                'Your complete kinetic stride, piezo generation, and workout history has been packaged (38.4 KB JSON).'
              );
            }}
          />
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.screenPaddingMobile,
      paddingBottom: spacing.contentBottomPadding,
      gap: spacing.md,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    brandIconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.iconVoltTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleBlock: {
      flex: 1,
    },
    title: {
      color: colors.onBackground,
    },
    headerSubtitle: {
      color: colors.brand.cyan,
      letterSpacing: 1,
      fontSize: 9,
      marginTop: 2,
    },
    ecoBannerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    ecoIconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.iconVoltTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ecoTitleCol: {
      flex: 1,
    },
    ecoTitle: {
      color: colors.onBackground,
    },
    ecoSub: {
      color: colors.outline,
    },
    ecoStatsGrid: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    ecoStatChip: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    ecoStatLabel: {
      color: colors.outline,
      fontSize: 8,
      textAlign: 'center',
      marginBottom: 3,
    },
    statValRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    ecoStatVal: {
      color: colors.onBackground,
      fontSize: 15,
    },
    ecoStatUnit: {
      color: colors.outline,
      fontSize: 10,
    },
    strikeCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    strikeTitle: {
      color: colors.onBackground,
    },
    strikeSub: {
      color: colors.outline,
      marginTop: 2,
    },
    piezoActiveBadge: {
      backgroundColor: colors.iconVoltTint,
      borderColor: colors.brand.volt,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    piezoActiveText: {
      color: colors.brand.volt,
      fontSize: 8,
    },
    strikeVisualContainer: {
      gap: spacing.sm,
      marginVertical: spacing.xs,
    },
    footZoneCol: {
      gap: 4,
    },
    footZoneHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footZoneName: {
      color: colors.onSurfaceVariant,
      fontSize: 10,
    },
    footZonePercent: {
      color: colors.brand.volt,
      fontSize: 11,
    },
    meterTrack: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.track,
      overflow: 'hidden',
    },
    meterFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    biomechInsightBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: 'rgba(0, 240, 255, 0.08)',
      borderColor: 'rgba(0, 240, 255, 0.25)',
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    biomechInsightText: {
      flex: 1,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },
    sessionList: {
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    sessionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.track,
      borderWidth: 1,
      borderColor: colors.glass.border,
      gap: spacing.sm,
    },
    sessionItemSelected: {
      borderColor: colors.brand.volt,
      backgroundColor: colors.iconVoltTint,
    },
    sessionIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.glass.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sessionIconSelected: {
      backgroundColor: 'rgba(204, 255, 0, 0.16)',
    },
    sessionMeta: {
      flex: 1,
      gap: 2,
    },
    sessionTitle: {
      color: colors.onBackground,
      fontSize: 15,
    },
    sessionDate: {
      color: colors.outline,
      fontSize: 11,
    },
    sessionStatsCol: {
      alignItems: 'flex-end',
      gap: 2,
    },
    sessionSteps: {
      color: colors.onBackground,
      fontSize: 15,
    },
    sessionEnergy: {
      color: colors.brand.volt,
      fontSize: 11,
    },
    dynamicsGrid: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    dynamicsChip: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glass.border,
      gap: 2,
    },
    dynamicsLabel: {
      color: colors.outline,
      fontSize: 8,
      textAlign: 'center',
    },
    dynamicsVal: {
      color: colors.onBackground,
      fontSize: 15,
    },
    dynamicsUnit: {
      color: colors.outline,
      fontSize: 10,
    },
    dynamicsRating: {
      color: colors.brand.cyan,
      fontSize: 8,
      textAlign: 'center',
      marginTop: 2,
    },
    efficiencyCard: {
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.glass.border,
      gap: 6,
      marginTop: spacing.xs,
    },
    efficiencyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    efficiencyTitle: {
      color: colors.onBackground,
      fontSize: 13,
    },
    efficiencyScore: {
      color: colors.brand.volt,
    },
    efficiencyTrack: {
      height: 6,
      borderRadius: radius.full,
      backgroundColor: colors.glass.surface,
      overflow: 'hidden',
    },
    efficiencyFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    efficiencySub: {
      color: colors.outline,
      fontSize: 11,
      lineHeight: 16,
    },
    exportActionRow: {
      marginTop: spacing.sm,
    },
  });
