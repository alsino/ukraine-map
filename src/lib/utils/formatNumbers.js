import { format } from 'd3-format';
// import { formatDefaultLocale } from 'd3-format';
// import en from 'd3-format/locale/en-US.json';

// formatDefaultLocale(en);

export const formatInt = format(',.0f');
export const formatOneDecimal = format('.1f');
export const formatTwoDecimals = format('.2f');
export const formatThreeDecimals = format('.3f');
export const formatPercent = format('.0%');
export const formatThousands = format(",")