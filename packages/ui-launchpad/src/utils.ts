export function createMintMetadataFile(metadata: object) {
  const str = JSON.stringify({ ...metadata }, (_, value) =>
    value === null || value === "" ? undefined : value,
  );
  const blob = new Blob([str], { type: "application/json" });
  return new File([blob], "data.json", {
    type: "application/json",
    lastModified: Date.now(),
  });
}

export function getVestingPeriod(unit: string, duration: number) {
  switch (unit) {
    case "y":
      return duration * 365;
    case "m":
      return duration * 30;
    case "w":
      return duration * 7;
    case "d":
      return duration;
    default:
      return duration;
  }
}
