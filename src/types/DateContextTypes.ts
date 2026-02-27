export interface DateContextType {
  currentDate: Date | null;
  localDate: Date | null;
  updateDate: (date: Date) => void;
}
