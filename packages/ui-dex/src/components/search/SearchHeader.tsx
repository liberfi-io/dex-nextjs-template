import { SearchInput } from "./SearchInput";
import { ModalHeaderWrapper } from "../layout/ModalHeaderWrapper";

type SearchHeaderProps = {
  onClose?: () => void;
  defaultKeyword?: string;
};

export function SearchHeader({ onClose, defaultKeyword }: SearchHeaderProps) {
  return (
    // <ModalHeaderWrapper onClose={onClose} endContent={<SearchChainSelect />}>
    <ModalHeaderWrapper onClose={onClose}>
      <SearchInput defaultKeyword={defaultKeyword} />
    </ModalHeaderWrapper>
  );
}
