import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TestimonialCard({ content, author, role, avatarSrc }) {
  return (
    <Card className="w-[340px] h-[300px]">
      <CardContent className="p-6 flex flex-col h-full">
        <p className="text-md text-justify text-muted-foreground flex-grow mb-4">{content}</p>
        <div className="flex items-center mt-auto">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarSrc} alt={author} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">{author}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

