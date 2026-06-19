"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/image.helper";
import { Check, Pencil, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  imageKey: string | null;
  title: string;
  imageVersion: number;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isPending: boolean;
};

export function ImageViewAdmin({
  imageKey,
  imageVersion,
  title,
  isPending,
  onRemove,
  onUpload,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const imageSrc = previewUrl ?? getImageUrl(imageKey, imageVersion);

  const openFilePicker = () => {
    inputRef.current?.click();
  };
  const handleRemove = () => {
    onRemove();
  };

  const handleCancel = () => {
    setFile(null);
  };

  const handleSave = async () => {
    if (!file) return;

    await onUpload(file);

    setFile(null);
  };

  return (
    <div className="space-y-4">
      {/* hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (!selected) return;

          setFile(selected);

          // allow re-selecting same file again
          e.target.value = "";
        }}
      />

      {/* IMAGE PREVIEW */}
      <div className="relative h-96 w-full max-w-96 mx-auto overflow-hidden rounded-md border">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-contain"
          sizes="384px"
        />

        <div className="absolute top-2 right-2 flex gap-2">
          {file ? (
            <>
              <Button
                size="icon"
                variant="destructive"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X />
              </Button>
              <Button
                size="icon"
                onClick={handleSave}
                variant={"success"}
                disabled={isPending}
              >
                <Check />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="secondary"
                onClick={openFilePicker}
                disabled={isPending}
              >
                <Pencil />
              </Button>

              {imageKey && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="destructive"
                      disabled={isPending}
                    >
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete image?</AlertDialogTitle>

                      <AlertDialogDescription>
                        This will permanently remove the image from storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <AlertDialogAction onClick={handleRemove}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
