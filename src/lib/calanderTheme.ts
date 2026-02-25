import { Platform } from 'react-native';
import { THEME } from './theme';
export const themeColor = '#00AAAF';
export const lightThemeColor = '#f2f7f7';

export function getTheme(isDark: boolean = false) {
  const primaryColor = isDark ? THEME.dark.primary : THEME.light.primary;
  const secondaryColor = isDark ? THEME.dark.secondary : THEME.light.secondary;
  const disabledColor = isDark ? THEME.dark.mutedForeground : THEME.light.mutedForeground;
  return {
    // arrows
    arrowColor: primaryColor,
    arrowStyle: { padding: 0 },
    // knob
    expandableKnobColor: primaryColor,
    // month
    monthTextColor: primaryColor,
    textMonthFontSize: 16,
    textMonthFontFamily: 'HelveticaNeue',
    textMonthFontWeight: 'bold' as const,
    // day names
    textSectionTitleColor: primaryColor,
    textDayHeaderFontSize: 12,
    textDayHeaderFontFamily: 'HelveticaNeue',
    textDayHeaderFontWeight: 'normal' as const,
    // dates
    dayTextColor: primaryColor,
    todayTextColor: primaryColor,
    textDayFontSize: 18,
    textDayFontFamily: 'HelveticaNeue',
    textDayFontWeight: '500' as const,
    textDayStyle: { marginTop: Platform.OS === 'android' ? 2 : 4 },
    // selected date
    selectedDayBackgroundColor: primaryColor,
    selectedDayTextColor: secondaryColor,
    // disabled date
    textDisabledColor: disabledColor,
    // dot (marked date)
    dotColor: primaryColor,
    selectedDotColor: secondaryColor,
    disabledDotColor: disabledColor,
    dotStyle: { marginTop: -2 },
  };
}
