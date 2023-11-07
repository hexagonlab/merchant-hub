import { handleDeleteEmployee } from '@/app/(private)/dashboard/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Dispatch, SetStateAction } from 'react';

type TProps = {
  state: {
    open: boolean;
    employeeId: number | null;
  };
  setState: Dispatch<
    SetStateAction<{
      open: boolean;
      employeeId: number | null;
    }>
  >;
};

export default function DeleteDialog({ state, setState }: TProps) {
  const { toast } = useToast();
  const onOpenChange = () => {
    setState((prev) => {
      return {
        ...prev,
        open: false,
      };
    });
  };

  const handleClick = async () => {
    if (!state.employeeId) return;

    const { success, message } = await handleDeleteEmployee(state.employeeId);
    if (success) {
      toast({
        title: 'Амжилттай',
        description: message as string,
      });

      window.location.reload();
    } else {
      toast({
        title: 'Алдаа гарлаа',
        description: message?.toString(),
      });
    }
  };

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Устгах үйлдэл хийхдээ итгэлтэй байна уу?</DialogTitle>
          <DialogDescription>
            Өгөгдлийн сангаас устгал хийгдэх тул энэ үйлдлийг буцаах боломжгүй
            болно.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => handleClick()}>Тийм</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
