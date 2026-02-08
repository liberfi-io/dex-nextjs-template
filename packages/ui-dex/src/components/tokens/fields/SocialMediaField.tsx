import { Button, Link } from "@heroui/react";
import { TwitterIcon, TelegramIcon, WebsiteIcon } from "@/assets";
import { useMemo } from "react";
import { ListField } from "@/components/ListField";
import { Token, TokenSocialMediasDTO } from "@chainstream-io/sdk";

interface SocialMediaFieldProps {
  className?: string;
  token: Token;
}

export function SocialMediaField({ className, token }: SocialMediaFieldProps) {
  const { website, twitter, telegram } = useMemo<TokenSocialMediasDTO>(() => {
    try {
      return typeof token.socialMedias === "string"
        ? JSON.parse(token.socialMedias ?? "{}")
        : typeof token.socialMedias === "object"
        ? token.socialMedias
        : {};
    } catch (e: unknown) {
      console.error(e);
      return {};
    }
  }, [token]);

  return (
    <ListField width={70} className={className}>
      <div className="flex h-full w-full gap-2">
        {website && (
          <Button
            as={Link}
            href={website}
            target="_blank"
            isIconOnly
            className="flex w-4 min-w-4 h-4 min-h-4 bg-transparent rounded-full"
          >
            <WebsiteIcon width={16} height={16} />
          </Button>
        )}
        {twitter && (
          <Button
            as={Link}
            href={twitter}
            target="_blank"
            isIconOnly
            className="flex w-4 min-w-4 h-4 min-h-4 bg-transparent rounded-full"
          >
            <TwitterIcon width={16} height={16} />
          </Button>
        )}
        {telegram && (
          <Button
            as={Link}
            href={telegram}
            target="_blank"
            isIconOnly
            className="flex w-4 min-w-4 h-4 min-h-4 bg-transparent rounded-full"
          >
            <TelegramIcon width={16} height={16} />
          </Button>
        )}
        {!website && !twitter && !telegram && <>--</>}
      </div>
    </ListField>
  );
}
