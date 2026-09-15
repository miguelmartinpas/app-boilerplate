import { useEffect, useState } from 'react';

export type StatCardData = {
  id: string;
  label: string;
  value: string;
  icon: string;
  colorToken: 'primary' | 'secondary' | 'tertiary';
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
};

const MOCK_STATS: StatCardData[] = [
  { id: 'users', label: 'Usuarios activos', value: '1,204', icon: 'person.2.fill', colorToken: 'primary' },
  { id: 'revenue', label: 'Ingresos', value: '$8,940', icon: 'dollarsign.circle.fill', colorToken: 'secondary' },
  { id: 'tasks', label: 'Tareas completadas', value: '87', icon: 'checkmark.circle.fill', colorToken: 'tertiary' },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', title: 'Nuevo usuario registrado', description: 'Ada Lovelace se unió al equipo', timestamp: 'Hace 12 min', icon: 'person.badge.plus' },
  { id: '2', title: 'Pago recibido', description: 'Factura #1042 pagada', timestamp: 'Hace 1 hora', icon: 'creditcard.fill' },
  { id: '3', title: 'Tarea completada', description: '"Revisar diseño" marcada como hecha', timestamp: 'Hace 3 horas', icon: 'checkmark.seal.fill' },
];

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStats(MOCK_STATS);
      setActivity(MOCK_ACTIVITY);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  return { isLoading, stats, activity };
}
