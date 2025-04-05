export function toUpperCase(str: string | undefined) {
  if (!!str)
    return str
      .split(/[-_\s]/)
      .map((word, index) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  return "";
}

export function removeHTML(str: string | undefined) {
  if (!!str) {
    return str.replace(/<[^>]*>/g, "");
  }
  return "";
}

export default [toUpperCase, removeHTML];
