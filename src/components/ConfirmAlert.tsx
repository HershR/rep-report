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
import { Button, ButtonProps } from "./ui/button";
import { Text } from "./ui/text";

interface FormActionAlertProps {
  title: string;
  description: string;
  trigger: ReactNode;
  triggerProps?: ButtonProps;
  onConfirm: () => void;
  onCancel: () => void;
}

const CustomAlert = ({
  title,
  description,
  trigger,
  triggerProps,
  onConfirm,
  onCancel,
}: FormActionAlertProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={triggerProps?.variant || "ghost"}>{trigger}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-y-2 w-2/3 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-x-2 mt-8">
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
