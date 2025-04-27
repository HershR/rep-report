import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface FormActionAlertProps {
  title: string;
  description: string;
  trigger: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const CustomAlert = ({
  title,
  description,
  trigger,
  onConfirm,
  onCancel,
}: FormActionAlertProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">{trigger}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-y-2 w-2/3 max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="justify-end gap-x-2">
          <AlertDialogCancel onPress={onCancel}>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction onPress={onConfirm}>
            <Text>Continue</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlert;
