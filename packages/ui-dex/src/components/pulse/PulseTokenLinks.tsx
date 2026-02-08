import { useMemo } from "react";
import { Button, Link } from "@heroui/react";
import { Token, TokenSocialMediasDTO } from "@chainstream-io/sdk";
import { SearchIcon, TelegramIcon, TwitterIcon, WebsiteIcon } from "@liberfi/ui-base";
import { searchTwitterUrl } from "@/libs";
import { RecursivePartial } from "@liberfi/core";

export type PulseTokenLinksProps = {
  token: RecursivePartial<Token>;
};

export function PulseTokenLinks({ token }: PulseTokenLinksProps) {
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
  }, [token.socialMedias]);

  return (
    <div className="flex items-center gap-2">
      {twitter && (
        <Button
          isIconOnly
          as={Link}
          href={twitter}
          target="_blank"
          className="bg-transparent p-0 min-w-4 w-4 min-h-4 h-4 text-foreground hover:text-primary/50"
        >
          <TwitterIcon width={16} height={16} />
        </Button>
      )}
      {telegram && (
        <Button
          isIconOnly
          as={Link}
          href={telegram}
          target="_blank"
          className="bg-transparent p-0 min-w-4 w-4 min-h-4 h-4 hover:text-primary/50"
        >
          <TelegramIcon width={16} height={16} />
        </Button>
      )}
      {website && (
        <Button
          isIconOnly
          as={Link}
          href={website}
          target="_blank"
          className="bg-transparent p-0 min-w-4 w-4 min-h-4 h-4 hover:text-primary/50"
        >
          <WebsiteIcon width={16} height={16} />
        </Button>
      )}
      <Button
        isIconOnly
        as={Link}
        href={searchTwitterUrl(token.address ?? "")}
        target="_blank"
        className="bg-transparent p-0 min-w-4 w-4 min-h-4 h-4 hover:text-primary/50"
      >
        <SearchIcon width={16} height={16} />
      </Button>
    </div>
  );
}
