export interface Route {
  from: string;
  to: string;
}

const ROUTES: Route[] = [
    { from: 'LHR', to: 'CDG' },
    { from: 'LHR', to: 'FRA' },
    { from: 'LHR', to: 'AMS' },
    { from: 'LHR', to: 'MAD' },
    { from: 'LHR', to: 'FCO' },
    { from: 'CDG', to: 'FRA' },
    { from: 'CDG', to: 'FCO' },
    { from: 'CDG', to: 'BCN' },
    { from: 'FRA', to: 'MAD' },
    { from: 'FRA', to: 'IST' },
    { from: 'AMS', to: 'BCN' },
    { from: 'AMS', to: 'CPH' },
    { from: 'MAD', to: 'LIS' },
    { from: 'MAD', to: 'FCO' },
    { from: 'FCO', to: 'ATH' },
    { from: 'MUC', to: 'VIE' },
    { from: 'MUC', to: 'ZRH' },
    { from: 'IST', to: 'ATH' },
    { from: 'DUB', to: 'LHR' },
    { from: 'ZRH', to: 'FRA' },
    { from: 'CPH', to: 'OSL' },
    { from: 'OSL', to: 'ARN' },
    { from: 'ARN', to: 'HEL' },
    { from: 'WAW', to: 'FRA' },
    { from: 'PRG', to: 'FRA' },
    { from: 'VIE', to: 'BUD' },
    { from: 'BRU', to: 'AMS' },
    // New routes for new airports
    { from: 'BER', to: 'WAW' },
    { from: 'BER', to: 'MUC' },
    { from: 'MXP', to: 'ZRH' },
    { from: 'MXP', to: 'FCO' },
    { from: 'LHR', to: 'BER' },
    { from: 'CDG', to: 'MXP' },
];

const reverseRoutes = ROUTES.map(r => ({ from: r.to, to: r.from }));
export const ALL_ROUTES = [...ROUTES, ...reverseRoutes];