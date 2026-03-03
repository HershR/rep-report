export interface DateContextType {
  currentDate: string;
  updateDate: (date: string) => void;
  currentLocalDate: string;
  updateLocalDate: (localDate: string) => void;
}
