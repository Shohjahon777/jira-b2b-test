import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProjectAvatarProps {
    image?: string;
    name: string;
    className?: string;
    fallbackClassName?: string;
}

export const ProjectAvatar = ({
   name,
   className,
   image,
   fallbackClassName,
}: ProjectAvatarProps) => {
    if (image) {
        return (
            <div
                className={cn("size-5 relative rounded-md overflow-hidden", className)}
            >
                <span>{image}</span>
            </div>
        );
    }

    return (
        <Avatar className={cn("size-5 rounded-md", className)}>
            <AvatarFallback
                className={cn(
                    "text-white bg-blue-600 font-semibold text-sm uppercase rounded-md",
                    fallbackClassName
                )}
            >
                {name[0]}
            </AvatarFallback>
        </Avatar>
    );
};
