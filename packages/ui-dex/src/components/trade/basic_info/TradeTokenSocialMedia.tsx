import { Button, Divider, Link } from "@heroui/react";
import {
  TelegramIcon,
  TwitterIcon,
  WebsiteIcon,
  DiscordIcon,
  RedditIcon,
  GithubIcon,
} from "@/assets";
import { Token, TokenSocialMediasDTO } from "@chainstream-io/sdk";
import { useMemo } from "react";

export function TradeTokenSocialMedia({ token }: { token: Token }) {
  const socials = useMemo<TokenSocialMediasDTO>(() => {
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

  if (
    !socials.website &&
    !socials.twitter &&
    !socials.telegram &&
    !socials.discord &&
    !socials.github &&
    !socials.reddit
  ) {
    return <></>;
  }
  return (
    <section className="flex items-center justify-end gap-4">
      {socials.website && (
        <Button
          as={Link}
          href={socials.website}
          target="_blank"
          isIconOnly
          className="flex w-[18px] min-w-[18px] h-[18px] min-h-[18px] text-neutral hover:text-foreground bg-transparent rounded-none"
        >
          <WebsiteIcon width={18} height={18} />
        </Button>
      )}

      {socials.website && <Divider className="h-[18px] border-content3" orientation="vertical" />}

      {socials.twitter && (
        <Button
          as={Link}
          href={socials.twitter}
          target="_blank"
          isIconOnly
          className="flex w-[18px] min-w-[18px] h-[18px] min-h-[18px] text-neutral hover:text-foreground bg-transparent rounded-none"
        >
          <TwitterIcon width={18} height={18} />
        </Button>
      )}

      {socials.telegram && (
        <Button
          as={Link}
          href={socials.telegram}
          target="_blank"
          isIconOnly
          className="flex w-[18px] min-w-[18px] h-[18px] min-h-[18px] text-neutral hover:text-foreground bg-transparent rounded-none"
        >
          <TelegramIcon width={18} height={18} />
        </Button>
      )}

      {socials.discord && (
        <Button
          as={Link}
          href={socials.discord}
          target="_blank"
          isIconOnly
          className="flex w-[18px] min-w-[18px] h-[18px] min-h-[18px] text-neutral hover:text-foreground bg-transparent rounded-none"
        >
          <DiscordIcon width={18} height={18} />
        </Button>
      )}

      {socials.github && (
        <Button
          as={Link}
          href={socials.github}
          target="_blank"
          isIconOnly
          className="flex w-[18px] min-w-[18px] h-[18px] min-h-[18px] text-neutral hover:text-foreground bg-transparent rounded-none"
        >
          <GithubIcon width={18} height={18} />
        </Button>
      )}

      {socials.reddit && (
        <Button
          as={Link}
          href={socials.reddit}
          target="_blank"
          isIconOnly
          className="flex w-[18px] min-w-[18px] h-[18px] min-h-[18px] text-neutral hover:text-foreground bg-transparent rounded-none"
        >
          <RedditIcon width={18} height={18} />
        </Button>
      )}
    </section>
  );
}
