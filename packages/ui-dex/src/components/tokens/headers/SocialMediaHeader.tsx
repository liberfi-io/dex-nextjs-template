import { ListHeader } from "@/components/ListHeader";
import { useTranslation } from "@liberfi/ui-base";

export type SocialMediaHeaderProps = {
  className?: string;
};

export function SocialMediaHeader({ className }: SocialMediaHeaderProps) {
  const { t } = useTranslation();
  return (
    <ListHeader width={70} className={className}>
      {t("extend.token_list.attributes.social_media")}
    </ListHeader>
  );
}
