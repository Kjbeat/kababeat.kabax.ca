import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scheduleDateTime: string;
  onScheduleDateTimeChange: (value: string) => void;
}

export function ScheduleDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  scheduleDateTime, 
  onScheduleDateTimeChange 
}: ScheduleDialogProps) {
  const { t } = useLanguage();
  const initial = scheduleDateTime ? new Date(scheduleDateTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const initialHour24 = initial.getHours();
  const initialPeriod = initialHour24 >= 12 ? "PM" : "AM";
  const initialHour12 = ((initialHour24 + 11) % 12 + 1).toString().padStart(2, '0');
  const initialMinute = initial.getMinutes().toString().padStart(2,'0');

  const [selectedDate, setSelectedDate] = useState<Date>(initial);
  const [selectedHour, setSelectedHour] = useState<string>(initialHour12);
  const [selectedMinute, setSelectedMinute] = useState<string>(initialMinute);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateDateTime(date, selectedHour, selectedMinute, selectedPeriod);
    }
  };

  const handleTimeChange = (hour: string, minute: string, period: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    updateDateTime(selectedDate, hour, minute, period);
  };

  const updateDateTime = (date: Date, hour: string, minute: string, period: string) => {
    const newDate = new Date(date);
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    
    newDate.setHours(hour24, parseInt(minute), 0, 0);
    onScheduleDateTimeChange(newDate.toISOString().slice(0, 16));
  };

  // Build 30-min increment times across 24h, display in 12h format
  const timeOptions = useMemo(() => {
    const arr: { label: string; hour24: number; minute: number }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = ((h + 11) % 12) + 1;
        const label = `${h12.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')} ${period}`;
        arr.push({ label, hour24: h, minute: m });
      }
    }
    return arr;
  }, []);

  const initialTimeValue = useMemo(() => {
    const match = timeOptions.find(t => t.hour24 === initialHour24 && t.minute === parseInt(initialMinute));
    return match ? match.label : timeOptions[0].label;
  }, [timeOptions, initialHour24, initialMinute]);

  const [timeValue, setTimeValue] = useState(initialTimeValue);

  // Quick preset helpers
  // When timeValue changes, update internal hour/minute/period
  const applyTimeValue = (val: string) => {
    const match = timeOptions.find(t => t.label === val);
    if (!match) return;
    const period = match.hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = ((match.hour24 + 11) % 12 + 1).toString().padStart(2,'0');
    const minuteStr = match.minute.toString().padStart(2,'0');
    setSelectedHour(hour12);
    setSelectedMinute(minuteStr);
    setSelectedPeriod(period);
    updateDateTime(selectedDate, hour12, minuteStr, period);
  };

  const relative = formatDistanceToNow(new Date(scheduleDateTime || selectedDate), { addSuffix: true });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md p-0 overflow-hidden">
        <AlertDialogHeader className="px-6 pt-5 pb-2 border-b">
          <AlertDialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t('upload.schedule.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>{t('upload.schedule.description')}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-6 py-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('upload.schedule.schedule')}</label>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 flex-col sm:flex-row">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start w-full sm:w-1/2 h-12 bg-background/60 border-border text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'MMMM do, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-2 w-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      className="rounded-md border-0"
                    />
                  </PopoverContent>
                </Popover>
                <Select value={timeValue} onValueChange={(v) => { setTimeValue(v); applyTimeValue(v); }}>
                  <SelectTrigger className="w-full sm:w-1/2 h-12 bg-background/60 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {timeOptions.map(t => (
                      <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-muted/40 rounded-lg p-4 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-muted-foreground">{t('upload.schedule.scheduledFor').replace('{date}', format(selectedDate, 'EEE, MMM d yyyy')).replace('{time}', timeValue)}</span>
            </div>
            <div className="text-xs text-muted-foreground italic">({relative}) • {t('upload.schedule.localTimezone')}</div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <AlertDialogCancel>{t('upload.schedule.cancel')}</AlertDialogCancel>
            <Button onClick={onConfirm}>{t('upload.schedule.scheduleBeat')}</Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
