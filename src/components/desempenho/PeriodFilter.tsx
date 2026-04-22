import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface PeriodFilterProps {
  month: number; // 0-11
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  viewMode: 'month' | 'year';
  onViewModeChange: (v: 'month' | 'year') => void;
}

const PeriodFilter = ({ month, year, onMonthChange, onYearChange, viewMode, onViewModeChange }: PeriodFilterProps) => {
  const prevPeriod = () => {
    if (viewMode === 'month') {
      if (month === 0) { onMonthChange(11); onYearChange(year - 1); }
      else onMonthChange(month - 1);
    } else {
      onYearChange(year - 1);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      if (month === 11) { onMonthChange(0); onYearChange(year + 1); }
      else onMonthChange(month + 1);
    } else {
      onYearChange(year + 1);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-1 bg-muted rounded-lg p-0.5">
        <button onClick={() => onViewModeChange('month')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}>
          Mensal
        </button>
        <button onClick={() => onViewModeChange('year')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === 'year' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}>
          Anual
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={prevPeriod} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted min-w-[140px] justify-center">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {viewMode === 'month' ? `${months[month]} ${year}` : year}
          </span>
        </div>
        <button onClick={nextPeriod} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {viewMode === 'month' && (
        <div className="flex gap-1 flex-wrap">
          {months.map((m, i) => (
            <button key={i} onClick={() => onMonthChange(i)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                month === i ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}>
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodFilter;
