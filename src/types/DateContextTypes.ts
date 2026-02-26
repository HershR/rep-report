export interface DateContextType {
  currentDate: Date | null;
  updateDate: (date: Date) => void;
}
