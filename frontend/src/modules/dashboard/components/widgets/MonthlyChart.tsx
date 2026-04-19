import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface MonthlyChartProps {
  data: any[];
}

// Composant personnalisé pour le tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.8)', color: 'white' }}>
        <Typography variant="body2">
          {label}: <strong>{payload[0].value}</strong> page(s)
        </Typography>
      </Paper>
    );
  }
  return null;
};

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">
          Aucune donnée disponible pour le moment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Créez des pages pour voir l'évolution
        </Typography>
      </Box>
    );
  }

  // Formater les données pour le graphique
  const chartData = data.map((item: any) => {
    let monthName = '';
    try {
      const date = new Date(item.month);
      monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    } catch (e) {
      monthName = String(item.month);
    }
    
    return {
      month: monthName,
      pages: Number(item.count),
    };
  }).reverse();

  // Calculer le maximum pour l'axe Y
  const maxPages = Math.max(...chartData.map(d => d.pages), 1);

  return (
    <Box>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            domain={[0, maxPages + (maxPages === 0 ? 1 : Math.ceil(maxPages * 0.2))]}
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="pages"
            stroke="#6366f1"
            strokeWidth={3}
            fill="url(#colorPages)"
            dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Statistiques supplémentaires */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Total des pages
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
            {chartData.reduce((sum, d) => sum + d.pages, 0)}
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Moyenne par mois
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
            {(chartData.reduce((sum, d) => sum + d.pages, 0) / chartData.length).toFixed(1)}
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Meilleur mois
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b' }}>
            {Math.max(...chartData.map(d => d.pages), 0)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};